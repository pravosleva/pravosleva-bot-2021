/* eslint-disable no-return-await */
/* eslint-disable no-loop-func */
/* eslint-disable no-nested-ternary */
import { Response as IResponse } from 'express'
import {
  wasSentInTime,
  TWasSentInTimeResponse,
} from '~/bot/utils/wasSentInTime'
import { TQueueState } from './interfaces'
import { isNumber } from '~/bot/utils/isNumber'
import { freeDispatcher } from '~/express-tools/utils/notify-tools/FreeDispatcher'
import { Utils } from '~/express-tools/utils/notify-tools/Utils'

type TTimersMap = Map<number, { ts: number }>

const initialState = { msgs: [], rows: [], ids: [], tss: [] }
const wait = (ms: number) => new Promise((res) => setTimeout(res, ms))

type TQueueArgs = {
  defaultDelay?: number
  differentMsgsLimitNumber?: number
}

export class QueueDispatcher {
  queueMap: Map<number, TQueueState>
  defaultDelay: number
  tsMap: TTimersMap
  timersMap: Map<
    number,
    {
      timeout: NodeJS.Timeout
      utils: Utils
    }
  >
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

  init({ chat_id, delay }: { chat_id: number; delay?: number }): void {
    freeDispatcher.init({ chat_id })
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

  _addItemToQueue({
    chat_id,
    msg,
    item,
    id,
    ts,
    delay,
    utils,
  }: {
    chat_id: number
    msg: string
    item: any
    id: number
    ts: number
    delay?: number
    utils: Utils
  }): void {
    const queue = this.queueMap.get(chat_id)

    if (!!queue && queue.msgs.length > 0) {
      queue.msgs.push(msg)
      queue.rows.push(item)
      queue.ids.push(id)
      queue.tss.push(ts)
      this.queueMap.set(chat_id, queue)
    } else {
      this.queueMap.set(chat_id, {
        msgs: [msg],
        rows: [item],
        ids: [id],
        tss: [ts],
        delay: !!delay && isNumber(delay) ? delay : this.defaultDelay,
      })
    }

    this.runTimer({ chat_id, utils }) // NOTE: Запланируем отложенную отправку на случай, если ивентов больше не придет
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

  async _sendNow<TR>(arg: {
    chat_id: number
    newItem?: {
      msg: string
      item: any
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
    cb?: (q: QueueDispatcher) => void
  }): Promise<TR> {
    const { chat_id, newItem, targetAction, utils, cb } = arg
    const hasChat = this.hasChat({ chat_id })
    let tgResp: any = []
    let waitCounterMs = 0
    if (hasChat) {
      const queueNow = this.getChatData({ chat_id })
      if (Array.isArray(queueNow.msgs) && queueNow.msgs.length > 0) {
        this.resetChat({ chat_id })

        if (newItem) {
          const {
            // chat_id,
            msg,
            item,
            id,
            ts,
          } = newItem

          queueNow.msgs.push(msg)
          queueNow.rows.push(item)
          queueNow.ids.push(id)
          queueNow.tss.push(ts)
        }

        // NOTE: 3.1.1 Send some msgs
        // NOTE: Если больше - отправка будет одним общим сообщением
        switch (true) {
          // NOTE: 3.1.1.1 Less than limit?
          case queueNow.msgs.length <= this.differentMsgsLimitNumber: {
            const delayBetweenNotifs = 500
            for (let i = 0, max = queueNow.msgs.length; i < max; i++) {
              waitCounterMs += i * delayBetweenNotifs
              setTimeout(async () => {
                tgResp.push(
                  await targetAction({ msg: queueNow.msgs[i], chat_id })
                )
              }, i * delayBetweenNotifs)
            }
            break
          }
          default: {
            // NOTE: 3.1.1.2 More than limit? Send special common single msg
            await tgResp.push(
              await targetAction({
                msg: utils.getGeneralizedCommonMessageMD({
                  queueState: queueNow,
                  notifyCodes: utils.notifyCodes,
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

    await wait(waitCounterMs + 1000)

    return tgResp
  }

  // NOTE: Таймер будет создан, если он не был запущен раее
  runTimer({ chat_id, utils }: { chat_id: number; utils: Utils }): void {
    try {
      const _queueState = this.queueMap.get(chat_id)
      if (_queueState) {
        const { delay } = _queueState

        if (!this.timersMap.has(chat_id))
          this.timersMap.set(chat_id, {
            timeout: setTimeout(
              () => this.sendOldQueue({ chat_id, utils }),
              delay
            ),
            utils,
          })
      } else {
        throw new Error('⛔ TIMER_ERR_1: Не удалось получить _queueState')
      }
    } catch (err) {
      console.log(err)
    }
  }

  cleanupTimer({ chat_id }: { chat_id: number }): void {
    const timerData = this.timersMap.get(chat_id)
    if (timerData) {
      clearTimeout(timerData.timeout)
      this.timersMap.delete(chat_id)
    }
  }

  // NOTE: Отправка существующей очереди
  async sendOldQueue({ chat_id, utils }: { chat_id: number; utils: Utils }) {
    let result = null
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
        result = await this._sendNow<any[]>({
          chat_id,
          targetAction: async ({ msg, chat_id }) => {
            console.log(`-- send 2: ${msg}`)

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
    return result
  }

  setBotInstance(bot: any): void {
    if (!this.botInstance) this.botInstance = bot
  }

  // NOTE: При отправке ивента на этот сервер можно передать параметр delay
  // для его переустановки для конкретного пользователя:
  _setDelay({ chat_id, value }) {
    const queueState = this.queueMap.get(chat_id)
    if (queueState)
      this.queueMap.set(chat_id, {
        ...queueState,
        delay: !!value && isNumber(value) ? value : this.defaultDelay,
      })
  }

  async runExtra({
    chat_id,
  }: {
    chat_id: number
  }): Promise<{ ok: boolean; message?: string; tgRess?: any[] }> {
    const targetTimerData = this.timersMap.get(chat_id)
    let tgRess = null

    if (targetTimerData) {
      tgRess = await this.sendOldQueue({
        chat_id,
        utils: targetTimerData.utils,
      })

      // clearTimeout(targetTimerData.timeout) // NOTE: Already called in sendOldQueue -> _sendNow -> cleanupTimer
      // this.timersMap.delete(chat_id) // NOTE: Already called in sendOldQueue -> _sendNow -> cleanupTimer
      this.resetTimestamp({ chat_id })
      freeDispatcher.fix({ chat_id })
      return Promise.resolve({ ok: true, tgRess })
    }
    return Promise.resolve({
      ok: false,
      message: 'Таймер не установлен (видимо, нет необходимости)',
    })
  }

  async add({
    newItem,
    utils,
    res,
    onFail,
    onSendNow,
    onSendLater,
    reqBody,
  }: {
    res?: IResponse
    onFail: ({ res }: { res?: IResponse }) => void
    onSendNow: ({
      res,
    }: {
      res?: IResponse
      toClient: { [key: string]: any }
    }) => void
    onSendLater: ({
      res,
    }: {
      res?: IResponse
      toClient: { [key: string]: any }
    }) => void
    newItem: {
      item: any
      id: number
      ts: number
    }
    reqBody: {
      chat_id: number
      itemParams: any
      resultId: number
      delay?: number
      oddFree?: number
      ts?: number
    }
    utils: Utils
  }) {
    const { delay, oddFree, chat_id } = reqBody
    // const ts = _optionalTs || new Date().getTime()

    freeDispatcher.setOddFree({ chat_id, value: oddFree })
    this.init({ chat_id, delay })
    this._setDelay({ chat_id, value: delay })

    const md = utils.getSingleMessageMD({ notifyCodes: utils.notifyCodes })
    const { isNotifUselessness } = utils

    if (isNotifUselessness) return await onFail({ res })

    const { itemParams, resultId } = reqBody

    // 1. Check timers in this startup session; sample { isOk: true, message: 'Ok' }
    const isSentInTime = await this.isSentInTimePromise({
      chat_id,
    })

    // 2. Get user data - httpClient.checkUser({ chat_id })
    let data: any
    let tgResp: any[] = []

    switch (true) {
      // NOTE: 3. Send now or later?
      case isSentInTime.isOk || freeDispatcher.isAllowed({ chat_id }): {
        // -- SEND LOGIC
        tgResp = await this._sendNow<any[]>({
          chat_id,
          utils,
          newItem: {
            msg: md,
            ...newItem,
          },
          targetAction: async ({ msg, chat_id }) => {
            console.log(`-- send 1: ${msg}`)
            return await this.botInstance.telegram.sendMessage(chat_id, msg, {
              parse_mode: 'Markdown',
            })
          },
          cb: (q) => {
            q.resetTimestamp({ chat_id })
            freeDispatcher.fix({ chat_id })
          },
        })
        // --

        const toClient: any = {
          ok: true,
          data,
          originalBody: reqBody,
          _serviceInfo: {
            'freeDispatcher.getChatState': freeDispatcher.getChatState({
              chat_id,
            }),
            'queueDispatcher.getQueueState': this.getQueueState({
              chat_id,
            }),
          },
        }
        if (tgResp.length > 0) toClient.tgResp = tgResp

        return await onSendNow({ res, toClient })
      }
      // NOTE: 4. Add to queue
      default: {
        this._addItemToQueue({
          chat_id,
          msg: md,
          item: itemParams,
          id: resultId,
          ts: newItem.ts,
          delay: reqBody.delay,
          utils,
        })
        const queueLengthResult = this.getQueueState({
          chat_id,
        })

        return await onSendLater({
          res,
          toClient: {
            ok: false,
            message:
              isSentInTime.message ||
              `No isSentInTime.message or !freeDispatcher.isAllowed({ chat_id: ${chat_id} })`,
            _serviceInfo: {
              'freeDispatcher.getChatState': freeDispatcher.getChatState({
                chat_id,
              }),
              'freeDispatcher.isAllowed': freeDispatcher.isAllowed({ chat_id }),
              'queueDispatcher.getQueueState': queueLengthResult,
            },
            _originalBody: reqBody,
          },
        })
      }
    }
  }
}
