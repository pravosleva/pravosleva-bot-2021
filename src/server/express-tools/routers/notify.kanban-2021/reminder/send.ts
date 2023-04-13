/* eslint-disable no-return-await */
/* eslint-disable no-loop-func */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prefer-promise-reject-errors */
import { Response as IResponse } from 'express'
import { TModifiedRequest } from '~/bot/utils/interfaces'
import {
  // QueueDispatcher,
  TQueueState,
  TNotifyCodesMap,
  TCodeSettings,
  Utils,
} from '~/express-tools/utils/notify-tools'
import { EEventCodes, TReqBody } from '../types'

// NOTE: Declarative refactoring roadmap
// + Формат rowValues должен быть учтен только в этой логике
// + Вся настройка форматов output notifs описана при создании new Utils,
// + QueueDisparcher абстрагирован от формата сообщений
// + Utils не знает про формат очереди TQueueStates
// + Utils не знает про notifyCodes (должно задаваться при создании new Utils)
// x QueueDisparcher абстрагирован от reqBody? [No, cuz need chat_id, row, etc.]
// + Example of QueueDisparcher should not be Singletone

const commonHeader = 'SP Reminder'
const rules: { [key in EEventCodes]: TCodeSettings } = {
  [EEventCodes.WEEKLY_REMINDER]: {
    symbol: '🧯',
    descr: 'Еженедельное напоминание',
    doNotify: true,
    showAdditionalInfo: true,
    validate: () => true,
  },
}

export const sendNotify = async (req: TModifiedRequest, res: IResponse) => {
  const { ts: _optionalTs } = req.body as TReqBody
  const ts = _optionalTs || new Date().getTime()

  const { offlineTradeInQueueDispatcher: queueDispatcher } =
    req.notifyTools.smartprice

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
        const {
          eventCode,
          about,
          // errMsg,
          targetMD,
          // jsonStringified,
        } = body
        let result = ''

        if (!eventCode || !notifyCodes[eventCode]) {
          result += `⛔ Неизвестный eventCode ${eventCode}`
          // NOTE: Should be impossible (эти вещи будем фильтровать в mw)
        } else {
          try {
            result += `*${commonHeader} | ${notifyCodes[eventCode].descr}*\n\n${notifyCodes[eventCode].symbol} ${about}\n\n${targetMD}`
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
          )}`
          return `*${header}*\n\n${res}`
        } catch (err) {
          return `ERR001: ${err?.message || 'No err.message'}`
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
