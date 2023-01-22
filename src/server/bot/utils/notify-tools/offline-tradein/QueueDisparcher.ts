import {
  wasSentInTime,
  TWasSentInTimeResponse,
} from '~/bot/utils/wasSentInTime'
import { TQueueState } from './interfaces'
import { isNumber } from '~/bot/utils/isNumber'

type TTimersMap = Map<number, { ts: number }>

const initialState = { msgs: [], rows: [], ids: [] }

type TQueueArgs = {
  defaultDelay?: number
  differenceMessagesPackLimit?: number
}

export class QueueDisparcher {
  queueMap: Map<number, TQueueState>
  defaultDelay: number
  timersMap: TTimersMap
  differenceMessagesPackLimit: number

  constructor({ defaultDelay, differenceMessagesPackLimit }: TQueueArgs) {
    this.defaultDelay =
      !!defaultDelay && isNumber(defaultDelay) ? defaultDelay : 1000 * 60 * 10 // 10 min
    this.differenceMessagesPackLimit =
      !!differenceMessagesPackLimit && isNumber(differenceMessagesPackLimit)
        ? differenceMessagesPackLimit
        : 5
    this.queueMap = new Map()
    this.timersMap = new Map()
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
    delay,
  }: {
    chat_id: number
    msg: string
    row: any[][]
    id: number
    delay?: number
  }): void {
    const queue = this.queueMap.get(chat_id)

    if (!!queue && queue.msgs.length > 0) {
      queue.msgs.push(msg)
      queue.rows.push(row)
      queue.ids.push(id)
      this.queueMap.set(chat_id, queue)
    } else {
      this.queueMap.set(chat_id, {
        msgs: [msg],
        rows: [row],
        ids: [id],
        delay: !!delay && isNumber(delay) ? delay : this.defaultDelay,
      })
    }
  }

  get limit(): number {
    return this.differenceMessagesPackLimit
  }

  hasChat({ chat_id }: { chat_id: number }): boolean {
    return this.queueMap.has(chat_id)
  }
}
