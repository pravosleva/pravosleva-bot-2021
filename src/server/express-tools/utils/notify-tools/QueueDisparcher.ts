/* eslint-disable no-loop-func */
/* eslint-disable no-nested-ternary */
import {
  wasSentInTime,
  TWasSentInTimeResponse,
} from '~/bot/utils/wasSentInTime'
import { TQueueState } from './interfaces'
import { isNumber } from '~/bot/utils/isNumber'
import { Utils } from './offline-tradein/upload-wizard/Utils'

type TTimersMap = Map<number, { ts: number }>

const initialState = { msgs: [], rows: [], ids: [], tss: [] }

type TQueueArgs = {
  defaultDelay?: number
}

export class QueueDisparcher {
  queueMap: Map<number, TQueueState>
  defaultDelay: number
  timersMap: TTimersMap
  static instance: any

  public constructor({ defaultDelay }: TQueueArgs) {
    this.defaultDelay =
      !!defaultDelay && isNumber(defaultDelay) ? defaultDelay : 1000 * 60 * 10 // 10 min
    this.queueMap = new Map()
    this.timersMap = new Map()
  }

  public static getInstance(ps: TQueueArgs): QueueDisparcher {
    if (!QueueDisparcher.instance)
      QueueDisparcher.instance = new QueueDisparcher(ps)

    return QueueDisparcher.instance
  }

  init({ chat_id, delay }: { chat_id: number; delay?: number }): void {
    if (!this.queueMap.has(chat_id))
      this.queueMap.set(chat_id, {
        ...initialState,
        delay: !!delay && isNumber(delay) ? delay : this.defaultDelay,
      })
  }

  async isSentInTimePromise({ chat_id }): Promise<TWasSentInTimeResponse> {
    const res = await wasSentInTime({
      key: chat_id,
      jsMap: this.timersMap,
      delayMs: this.defaultDelay,
    })
      .then((r) => r)
      .catch((e) => e)
    return res
  }

  getChatData({ chat_id }): TQueueState | null {
    return this.queueMap.get(chat_id)
  }

  resetChat({ chat_id, delay }: { chat_id: number; delay?: number }): void {
    this.queueMap.set(chat_id, {
      ...initialState,
      delay: !!delay && isNumber(delay) ? delay : this.defaultDelay,
    })
  }

  resetTimer({ chat_id }): void {
    this.timersMap.set(chat_id, { ts: new Date().getTime() })
  }

  addItem({
    chat_id,
    msg,
    row,
    id,
    ts,
    delay,
  }: {
    chat_id: number
    msg: string
    row: any[][]
    id: number
    ts: number
    delay?: number
  }): void {
    const queue = this.queueMap.get(chat_id)

    if (!!queue && queue.msgs.length > 0) {
      queue.msgs.push(msg)
      queue.rows.push(row)
      queue.ids.push(id)
      queue.tss.push(ts)
      this.queueMap.set(chat_id, queue)
    } else {
      this.queueMap.set(chat_id, {
        msgs: [msg],
        rows: [row],
        ids: [id],
        tss: [ts],
        delay: !!delay && isNumber(delay) ? delay : this.defaultDelay,
      })
    }
  }

  hasChat({ chat_id }: { chat_id: number }): boolean {
    return this.queueMap.has(chat_id)
  }

  getQueueState({ chat_id }): { value: number; message?: string } {
    return this.queueMap.has(chat_id)
      ? this.queueMap.get(chat_id).msgs?.length > 0 ||
        this.queueMap.get(chat_id).msgs?.length === 0
        ? { value: this.queueMap.get(chat_id).msgs?.length }
        : { value: 0, message: 'ERR1: No length' }
      : { value: 0, message: 'No chat_id' }
  }

  async sendNow<TR>(arg: {
    newItem: {
      chat_id: number
      msg: string
      row: any[][]
      id: number
      ts: number
    }
    targetAction: ({
      msg,
      chat_id,
    }: {
      msg: string
      chat_id: number
    }) => Promise<TR>
    utils: Utils
    cb: (q: QueueDisparcher) => void
  }): Promise<any> {
    const { newItem, targetAction, utils, cb } = arg
    const { chat_id, msg, row, id, ts } = newItem

    const hasChat = this.hasChat({ chat_id })
    let tgResp = []
    if (hasChat) {
      const queueNow = this.getChatData({ chat_id })
      if (Array.isArray(queueNow.msgs) && queueNow.msgs.length > 0) {
        this.resetChat({ chat_id })
        queueNow.msgs.push(msg)
        queueNow.rows.push(row)
        queueNow.ids.push(id)
        queueNow.tss.push(ts)

        // NOTE: 3.1.1 Send some msgs
        const differentMsgsLimitNumber = 3
        // NOTE: Если больше - отправка будет одним общим сообщением
        switch (true) {
          // NOTE: 3.1.1.1 Less than limit?
          case queueNow.msgs.length <= differentMsgsLimitNumber:
            for (let i = 0, max = queueNow.msgs.length; i < max; i++) {
              setTimeout(async () => {
                tgResp.push(await targetAction({ msg, chat_id }))
              }, i * 500)
            }
            break
          default: {
            // NOTE: 3.1.1.2 More than limit? Send special common single msg
            tgResp.push(
              await targetAction({
                msg: utils.getGeneralizedCommonMessageMD({
                  queueState: queueNow,
                }),
                chat_id,
              })
            )
            // TODO: How to send link as button? setTimeout(async () => { tgResp.push() }, 500)
            break
          }
        }
      } else {
        // NOTE: 3.1.2 Reset queue state & Send single msg
        this.resetChat({ chat_id })
        tgResp = [await targetAction({ msg, chat_id })]
      }
    } else {
      // NOTE: 3.2 Reset queue state & Send single msg
      this.resetChat({ chat_id })
      tgResp = [await targetAction({ msg, chat_id })]
    }
    if (cb) cb(this)

    return tgResp
  }
}

// NOTE: Персональные очереди для пользователей (с таймером)
export const queueDispatcher = QueueDisparcher.getInstance({
  defaultDelay: 1000 * 60 * 1, // 1 min
  // defaultDelay: 1000 * 60 * 10 // 10 min
  // defaultDelay: 1000 * 60 * 60 * 1 // 1 hour
  // defaultDelay: 1000 * 60 * 60 * 24 * 1 // 1 day
})
