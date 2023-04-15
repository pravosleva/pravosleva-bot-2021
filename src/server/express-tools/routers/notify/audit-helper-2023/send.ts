/* eslint-disable no-return-await */
import { EEventCodes, TReqBody } from './types'
import {
  // QueueDispatcher,
  TQueueState,
  TNotifyCodesMap,
  TCodeSettings,
  Utils,
} from '~/express-tools/utils/notify-tools'

const commonHeader = 'MIAN Reminder'
const rules: { [key in EEventCodes]: TCodeSettings } = {
  [EEventCodes.PARSING_RESILT_SUCCESS]: {
    symbol: '✅',
    descr: 'Парсер что-то нашел',
    doNotify: true,
    showAdditionalInfo: true,
    validate: () => true,
  },
}

export const sendNotify = async (req, res, _next) => {
  const { ts: _optionalTs } = req.body as TReqBody
  const ts = _optionalTs || new Date().getTime()

  const { queueDispatcher } = req.notifyTools.auditHelper2023

  // NOTE: Init bot instance if necessary (already in withHelpfulInstances)
  // queueDispatcher.setBotInstance(req.bot)

  return await queueDispatcher.add({
    res,
    utils: new Utils({
      rules,
      req,

      isNotifUselessnessValidator: ({
        notifyCodes,
      }: {
        notifyCodes: TNotifyCodesMap
      }) => {
        let res = false
        try {
          const body = req.body as TReqBody
          const targetEventCode = body.eventCode
          if (
            !targetEventCode ||
            !notifyCodes[targetEventCode] ||
            !notifyCodes[targetEventCode].doNotify ||
            (!!notifyCodes[targetEventCode].validate &&
              !notifyCodes[targetEventCode].validate(body))
          )
            res = true
        } catch (err) {
          console.log(err)
        }
        return res
      },

      getSingleMessageMD({
        notifyCodes,
      }: {
        notifyCodes: TNotifyCodesMap
      }): string {
        const body = req.body as TReqBody
        const { eventCode, links, words } = body
        let result = ''

        if (!eventCode || !notifyCodes[eventCode]) {
          result += `⛔ Неизвестный eventCode ${eventCode}`
          // NOTE: Should be impossible (эти вещи будем фильтровать в mw)
        } else {
          try {
            result += `*${commonHeader} | ${notifyCodes[eventCode].descr}*\n\n${
              notifyCodes[eventCode].symbol
            } Результат поиска по словам: ${words.join(', ')}\n\n${links.join(
              '\n'
            )}`
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
          const res = `TST (generalized) queueState.ids= ${queueState.ids.join(
            ', '
          )} (комбинированное сообщение не предусмотрено)`
          return `*${header}*\n\n${res}`
        } catch (err) {
          return `ERR_20230415: ${err?.message || 'No err.message'}`
        }
      },
    }),

    // -- TODO: Refactoring: json for client should be made here...
    onFail: async ({ res }) => {
      const body = req.body as TReqBody
      const targetEventCode = body.eventCode
      await res.status(200).send({
        ok: false,
        message: `Unnecessary case for eventCode: \`${targetEventCode}\``,
      })
    },

    onSendNow: async ({ res, toClient }) =>
      await res.status(200).send(toClient),

    onSendLater: async ({ res, toClient }) =>
      await res.status(200).send(toClient),

    newItem: {
      item: req.body,
      id: req.body.resultId,
      ts,
    },
    // --

    reqBody: req.body,
  })
}
