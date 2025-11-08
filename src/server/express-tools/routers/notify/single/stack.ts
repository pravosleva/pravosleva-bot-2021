/* eslint-disable no-return-await */
import { Response as IResponse } from 'express'
// import { queueDispatcher } from '~/express-tools/utils/notify-tools/QueueDisparcher'
import { THelp, TModifiedRequest } from '~/bot/utils/interfaces'
import {
  // QueueDispatcher,
  TQueueState,
  TNotifyCodesMap,
  TCodeSettings,
  Utils,
} from '~/express-tools/utils/notify-tools'
import {
  EEventCodes,
  TReqBody,
} from '~/express-tools/routers/notify/kanban-2021/types'

const wait = (ms: number) => new Promise((res) => setTimeout(res, ms))

const commonHeader = 'SINGLE REMINDER'

export enum ENotifNamespace {
  MAIN = 'main',
  AUX_SERVICE = 'aux_service',
}
const rules: { [key in ENotifNamespace]: TCodeSettings } = {
  [ENotifNamespace.MAIN]: {
    symbol: null, // 'ℹ️',
    dontShowSymbol: true,
    descr: 'Main',
    doNotify: true,
    showAdditionalInfo: true,
    validate: () => true,
  },
  [ENotifNamespace.AUX_SERVICE]: {
    symbol: '⚙️',
    dontShowSymbol: true,
    descr: 'Service',
    doNotify: true,
    showAdditionalInfo: false,
    validate: () => true,
  },
}

type TBody = {
  messages: string[]
  chat_id: number
  message_thread_id?: number
  namespace: string
}

export const singleStack = async (req: TModifiedRequest, res: IResponse) => {
  const { chat_id, message_thread_id, namespace, messages } = req.body as TBody
  const result: any = {
    ok: false,
  }

  try {
    const { queueDispatcher } = req.notifyTools.kanban2021
    switch (namespace) {
      case ENotifNamespace.MAIN: {
        const delayBetweenNotifs = 1000
        let waitCounterMs = 0
        const errs = []
        for (let i = 0, max = messages.length; i < max; i++) {
          const ts = new Date().getTime()
          waitCounterMs += i * delayBetweenNotifs
          setTimeout(async () => {
            // req.bot.sendMessage(chat_id, body.messages[i], {
            //   parse_mode: 'Markdown',
            //   message_thread_id,
            // })
            await queueDispatcher.add({
              res,
              utils: new Utils({
                rules,
                req,
                isNotifUselessnessValidator: ({
                  notifyCodes,
                }: {
                  notifyCodes: TNotifyCodesMap
                }) => {
                  const res = false
                  // try {
                  //   const body = req.body as TBody
                  //   const event: TReqBody = {
                  //     eventCode: EEventCodes.AUX_SERVICE,
                  //     // about: body.messages[i],
                  //     targetMD: body.messages[i],
                  //     header: `[${i + 1} of ${max}]`,
                  //   }
                  //   const targetEventCode = event.eventCode
                  //   if (
                  //     !targetEventCode ||
                  //     !notifyCodes[targetEventCode] ||
                  //     !notifyCodes[targetEventCode].doNotify ||
                  //     (!!notifyCodes[targetEventCode].validate &&
                  //       !notifyCodes[targetEventCode].validate(body))
                  //   )
                  //     res = true
                  // } catch (err) {
                  //   console.log(err)
                  // }
                  return res
                },
                getSingleMessageMD({
                  notifyCodes,
                }: {
                  notifyCodes: TNotifyCodesMap
                }): string {
                  const body = req.body as TBody
                  const event: TReqBody = {
                    eventCode: EEventCodes.AUX_SERVICE,
                    // about: body.messages[i],
                    targetMD: body.messages[i],
                    header: `${i + 1} of ${max}`,
                  }
                  const {
                    eventCode,
                    about,
                    // errMsg,
                    targetMD,
                    // jsonStringified,
                    partialHeader,
                    header,
                  } = event
                  let result = ''
                  const headerParts = []
                  if (header) headerParts.push(header)
                  const bodyParts = [`*${headerParts.join(' | ')}*`]
                  bodyParts.push(targetMD)
                  if (!eventCode || !notifyCodes[eventCode]) {
                    result += `⛔ Неизвестный eventCode ${eventCode}`
                    // NOTE: Should be impossible (эти вещи будем фильтровать в mw)
                  } else {
                    try {
                      result += `${bodyParts.join('\n\n')}`
                    } catch (err) {
                      console.log(err)
                    }
                  }
                  return result
                },
                getGeneralizedCommonMessageMD({
                  queueState,
                }: // notifyCodes,
                {
                  queueState: TQueueState
                  notifyCodes: TNotifyCodesMap
                }) {
                  try {
                    const header = `${commonHeader}\n${queueState.ids.length} events`
                    // NOTE: See also src/server/express-tools/routers/notify.smartprice/offline-tradein/upload-wizard/send.ts
                    // const msgsObj: {
                    //   [key: string]: {
                    //     counter: number
                    //     msg: string
                    //     partners: Set<string>
                    //     fromIndex: number
                    //     lastIndex: number
                    //     firstDate: Date
                    //     lastDate: Date
                    //     shortMsgs: string[]
                    //   }
                    // } = {}
                    const res = `Generalized msg tetsing: queueState.ids= ${queueState.ids.join(
                      ', '
                    )}\n\n${queueState.msgs.map((m) => `• ${m}`).join('\n\n')}`
                    return `*${header}*\n\n${res}`
                  } catch (err) {
                    return `ERR001A: ${err?.message || 'No err.message'}`
                  }
                },
              }),
              // -- TODO: Refactoring: json for client should be made here...
              onFail: async ({ res }) => {
                // const body = req.body as TBody
                const targetEventCode = EEventCodes.AUX_SERVICE
                // await res.status(200).send({
                //   ok: false,
                //   message: `Unnecessary case for eventCode: \`${targetEventCode}\``,
                // })
                errs.push(
                  `Unnecessary case for eventCode: \`${targetEventCode}\``
                )
              },
              onSendNow: async ({ res, toClient }) => {
                // await res.status(200).send(toClient)
              },
              onSendLater: async ({ res, toClient }) => {
                // await res.status(200).send(toClient)
              },
              newItem: {
                item: {
                  ...req.body,
                  msg: messages[i],
                  chat_id,
                  message_thread_id,
                  resultId: ts,
                },
                id: req.body.resultId || String(ts),
                ts,
              },
              // --
              reqBody: {
                chat_id,
                message_thread_id,
                itemParams: [[messages[i]]],
                resultId: ts,
                // delay?: number;
                // oddFree?: number;
                // ts?: number;
              },
            })
          }, i * delayBetweenNotifs)
        }
        result.ok = true
        await wait(waitCounterMs + 1000)

        break
      }
      // NOTE: Other cases...
      default:
        result.message = `Не предусмотрено для namespace= \`${namespace}\``
        break
    }

    return res.status(200).send(result)
  } catch (err) {
    return res.status(400).send({
      ok: false,
      message: err?.message || 'No err.message',
    })
  }
}

export const _help: THelp = {
  params: {
    body: {
      chat_id: {
        type: 'number',
        descr: 'TG chat_id',
        required: true,
      },
      message_thread_id: {
        type: 'number',
        descr: 'TG message_thread_id',
        required: false,
      },
      namespace: {
        type: 'string',
        descr: `Notifs namespace. Expected: ${Object.values(
          ENotifNamespace
        ).join(', ')}`,
        required: true,
      },
      messages: {
        type: 'string[]',
        descr: 'Notifs stack',
        required: true,
      },
    },
  },
}
