/* eslint-disable no-return-await */
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
  differentMsgsLimitNumber?: number
}

export class QueueDisparcher {
  queueMap: Map<number, TQueueState>
  defaultDelay: number
  tsMap: TTimersMap
  timersMap: Map<number, NodeJS.Timeout>
  static instance: any
  botInstance: any
  differentMsgsLimitNumber: number

  public constructor({ defaultDelay, differentMsgsLimitNumber }: TQueueArgs) {
    this.botInstance = null
    this.defaultDelay =
      !!defaultDelay && isNumber(defaultDelay) ? defaultDelay : 1000 * 60 * 10 // 10 min
    this.differentMsgsLimitNumber =
      !!differentMsgsLimitNumber && isNumber(differentMsgsLimitNumber)
        ? differentMsgsLimitNumber
        : 0
    this.queueMap = new Map()
    this.tsMap = new Map()
    this.timersMap = new Map() // NOTE: Для отправки через setTimeout, независимо от приходящих ивентов
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
      jsMap: this.tsMap,
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

  resetTimestamp({ chat_id }): void {
    this.tsMap.set(chat_id, { ts: new Date().getTime() })
  }

  addItem({
    chat_id,
    msg,
    row,
    id,
    ts,
    delay,
    utils,
  }: {
    chat_id: number
    msg: string
    row: any[][]
    id: number
    ts: number
    delay?: number
    utils: Utils
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

    this.runTimer({ chat_id, utils }) // NOTE: Запланируем отложеннау отправку на случай, если ивентов больше не придет
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
    chat_id: number
    newItem?: {
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
    }) => Promise<any>
    utils: Utils
    cb?: (q: QueueDisparcher) => void
  }): Promise<TR> {
    const { chat_id, newItem, targetAction, utils, cb } = arg
    const hasChat = this.hasChat({ chat_id })
    let tgResp: any = []
    if (hasChat) {
      const queueNow = this.getChatData({ chat_id })
      if (Array.isArray(queueNow.msgs) && queueNow.msgs.length > 0) {
        this.resetChat({ chat_id })

        if (newItem) {
          const {
            // chat_id,
            msg,
            row,
            id,
            ts,
          } = newItem

          queueNow.msgs.push(msg)
          queueNow.rows.push(row)
          queueNow.ids.push(id)
          queueNow.tss.push(ts)
        }

        // NOTE: 3.1.1 Send some msgs
        // NOTE: Если больше - отправка будет одним общим сообщением
        switch (true) {
          // NOTE: 3.1.1.1 Less than limit?
          case queueNow.msgs.length <= this.differentMsgsLimitNumber:
            for (let i = 0, max = queueNow.msgs.length; i < max; i++) {
              setTimeout(async () => {
                tgResp.push(
                  await targetAction({ msg: queueNow.msgs[i], chat_id })
                )
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
        if (newItem)
          tgResp = [await targetAction({ msg: newItem.msg, chat_id })]
      }
    } else {
      // NOTE: 3.2 Reset queue state & Send single msg
      this.resetChat({ chat_id })
      if (newItem) tgResp = [await targetAction({ msg: newItem.msg, chat_id })]
    }
    if (cb) cb(this)

    this.cleanupTimer({ chat_id }) // NOTE: Сброс таймера, отложенная отправка больше не требуется

    return tgResp
  }

  // NOTE: Таймер будет создан, если он не был запущен раее
  runTimer({ chat_id, utils }: { chat_id: number; utils: Utils }): void {
    try {
      const _queueState = this.queueMap.get(chat_id)
      if (_queueState) {
        const { delay } = _queueState

        if (!this.timersMap.has(chat_id))
          this.timersMap.set(
            chat_id,
            setTimeout(() => this.sendOldQueue({ chat_id, utils }), delay)
          )
      } else {
        throw new Error('⛔ TIMER_ERR_1: Не удалось получить _queueState')
      }
    } catch (err) {
      console.log(err)
    }
  }

  cleanupTimer({ chat_id }: { chat_id: number }): void {
    const timer = this.timersMap.get(chat_id)
    if (timer) {
      clearTimeout(timer)
      this.timersMap.delete(chat_id)
    }
  }

  // NOTE: Отправка существующей очереди
  sendOldQueue({ chat_id, utils }: { chat_id: number; utils: Utils }) {
    try {
      const queueState = this.queueMap.get(chat_id)
      if (!this.botInstance)
        throw new Error(
          `⛔ TIMER_ERR_3: this.botInstance is ${String(
            this.botInstance
          )} (${typeof this.botInstance})`
        )
      if (queueState && !!this.botInstance) {
        // NOTE: Отправляем все что есть в очереди
        this.sendNow({
          chat_id,
          targetAction: async ({ msg, chat_id }) => {
            return await this.botInstance.telegram.sendMessage(chat_id, msg, {
              parse_mode: 'Markdown',
            })
          },
          utils,
        })
      } else {
        throw new Error('⛔ TIMER_ERR_2: Не удалось получить queueState')
      }
    } catch (err) {
      console.log(err)
    }
  }

  setBotInstance(bot: any): void {
    this.botInstance = bot
  }

  // NOTE: При отправке ивента на этот сервер можно передать параметр delay
  // для его переустановки для конкретного пользователя:
  // TODO: setDelay({ chat_id , value }) {}
}

// NOTE: Персональные очереди для пользователей (с таймером)
export const queueDispatcher = QueueDisparcher.getInstance({
  // NOTE: Время, не чаще которого беспокоить пользователя
  // defaultDelay: 1000 * 60 * 1, // 1 min
  defaultDelay: 1000 * 60 * 30, // 30 min
  // defaultDelay: 1000 * 60 * 60 * 1 // 1 hour
  // defaultDelay: 1000 * 60 * 60 * 24 * 1 // 1 day

  // NOTE: Количество сообщений в очереди, которые можно отправить подряд по одному
  differentMsgsLimitNumber: 2,
})
