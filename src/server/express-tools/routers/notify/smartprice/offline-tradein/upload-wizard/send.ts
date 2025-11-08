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
import { EEventCodes } from '~/express-tools/utils/notify-tools/offline-tradein/upload-wizard'

// NOTE: Declarative refactoring roadmap
// + Формат rowValues должен быть учтен только в этой логике
// + Вся настройка форматов output notifs описана при создании new Utils,
// + QueueDisparcher абстрагирован от формата сообщений
// + Utils не знает про формат очереди TQueueStates
// + Utils не знает про notifyCodes (должно задаваться при создании new Utils)
// x QueueDisparcher абстрагирован от reqBody? [No, cuz need chat_id, row, etc.]
// + Example of QueueDisparcher should not be Singletone

const commonHeader = 'SP Offline Trade-In notifier\n[ upload-wizard ]'
const rules: { [key in EEventCodes]: TCodeSettings } = {
  [EEventCodes.UPLOAD_ERR]: {
    symbol: '⛔',
    descr: 'Ошибка загрузки файла',
    doNotify: true,
    showAdditionalInfo: true,
  },
  [EEventCodes.UPLOAD_OK]: {
    symbol: '✅',
    descr: 'Все файлы загружены',
    doNotify: true,
    // NOTE: Отправка требуется только для последнего фото
    validate: (rowValues: any[]): boolean => rowValues[4] === rowValues[8],
    showAdditionalInfo: false,
  },
  [EEventCodes.USER_REPORT]: {
    symbol: 'ℹ️',
    descr: 'Пользователь сообщил об ошибке',
    doNotify: true,
    showAdditionalInfo: true,
  },
  [EEventCodes.TRDEIN_ID_ENTERED]: {
    symbol: '⌨️',
    descr: 'Пользователь ввел tradein_id',
    doNotify: false,
    showAdditionalInfo: true,
  },
  [EEventCodes.TST]: {
    symbol: 'ℹ️',
    descr: '',
    doNotify: true,
    showAdditionalInfo: false,
  },
  [EEventCodes.STATUS_BAD_QUALITY]: {
    symbol: '👎',
    descr: 'Оценка: BAD QUALITY',
    doNotify: true,
    showAdditionalInfo: true,
  },
  [EEventCodes.STATUS_FAKE]: {
    symbol: '🤬',
    descr: 'Оценка: FAKE',
    doNotify: true,
    showAdditionalInfo: true,
  },
  [EEventCodes.STATUS_OK]: {
    symbol: '⏱️',
    descr: 'Оценка: OK',
    doNotify: true,
    showAdditionalInfo: true,
  },
  [EEventCodes.STATUS_NOT_CHECKED_STARTED]: {
    symbol: '⏳',
    descr: 'Оценка: NOT CHECKED && STARTED; Все фото загружены (run timer)',
    doNotify: true,
    showAdditionalInfo: true,
  },
  [EEventCodes.STATUS_NULL]: {
    symbol: '⚠️',
    descr: 'Оценка: status -> NULL',
    doNotify: true,
    showAdditionalInfo: true,
  },
}

export const sendNotify = async (req: TModifiedRequest, res: IResponse) => {
  const { ts: _optionalTs } = req.body
  const ts = _optionalTs || new Date().getTime()

  const { queueDispatcher } = req.notifyTools.smartprice

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
          const targetEventCode = req.body.rowValues[2]
          if (
            !req.body.rowValues[2] ||
            !notifyCodes[targetEventCode] ||
            !notifyCodes[targetEventCode].doNotify ||
            (!!notifyCodes[targetEventCode].validate &&
              !notifyCodes[targetEventCode].validate(req.body.rowValues))
          )
            res = true
        } catch (err) {
          console.log(err)
        }
        return res
      },

      getSingleMessageMD({ notifyCodes }: { notifyCodes: TNotifyCodesMap }) {
        const { rowValues } = req.body
        const [
          _a,
          _b,
          eventCode,
          _d,
          curFileCounter,
          tradeinId,
          additionalInfo,
          partnerName,
          totalFilesLeftCounter,
          _j,
          _k,
          _l,
          originalServerResponseStr,
          _n, // NOTE: ts in ms
        ] = rowValues
        let result = ''

        const getBackResponseMD = (jsonStr: any) => {
          if (!jsonStr) return ''

          let res = ''
          let _modifiedJSON
          try {
            _modifiedJSON = JSON.parse(jsonStr)
          } catch (err) {
            console.log(err)
          }

          if (_modifiedJSON)
            res += `\`\`\`json\n${
              _modifiedJSON ? JSON.stringify(_modifiedJSON, null, 2) : jsonStr
            }\`\`\``

          return res
        }
        const jsonFromBack = getBackResponseMD(originalServerResponseStr)

        try {
          result += `*${commonHeader}\n#${partnerName} ${
            tradeinId ? `#tradein${tradeinId}` : '⚠️ Trade-In ID not specified!'
          }*\n${req.body.resultId ? `report ${req.body.resultId}` : ''}\n\n${
            notifyCodes[eventCode] ? notifyCodes[eventCode].symbol : '❓'
          } \`${eventCode}\`${
            !!notifyCodes[eventCode] && notifyCodes[eventCode].descr
              ? `\n\n${notifyCodes[eventCode].descr}`
              : ''
          }${
            !!curFileCounter && !!totalFilesLeftCounter
              ? ` (upload photo ui state: ${curFileCounter} of ${totalFilesLeftCounter})`
              : ''
          }${
            additionalInfo &&
            !!notifyCodes[eventCode] &&
            notifyCodes[eventCode].showAdditionalInfo
              ? `\n\n${additionalInfo}`
              : ''
          }${jsonFromBack ? `\n\n${jsonFromBack}` : ''}`
        } catch (err) {
          console.log(err)
        }

        return result
      },

      getGeneralizedCommonMessageMD({
        queueState,
        notifyCodes,
      }: {
        queueState: TQueueState
        notifyCodes: TNotifyCodesMap
      }) {
        try {
          const header = `${commonHeader}\n${queueState.ids.length} events`
          const msgsObj: {
            [key: string]: {
              counter: number
              msg: string
              partners: Set<string>
              fromIndex: number
              lastIndex: number
              firstDate: Date
              lastDate: Date
              shortMsgs: string[]
            }
          } = {}
          let res = ''
          const contragents = new Set()

          for (let i = 0, max = queueState.ids.length; i < max; i++) {
            const rowValues = queueState.rows[i]
            const date = new Date(queueState.tss[i])
            const eventCode = rowValues[2]
            const currentIndex = queueState.ids[i]
            const lastIndex = queueState.ids[i]
            const partnerName = rowValues[7]
            contragents.add(partnerName)
            const partners = msgsObj[eventCode]?.partners || new Set()
            partners.add(partnerName)

            if (!msgsObj[eventCode])
              msgsObj[eventCode] = {
                counter: 1,
                msg: eventCode,
                partners,
                fromIndex: currentIndex,
                lastIndex,
                firstDate: date,
                lastDate: date,
                shortMsgs: [Utils._getShortMsg({ id: currentIndex, date })],
              }
            else {
              msgsObj[eventCode].counter += 1
              if (currentIndex < msgsObj[eventCode].fromIndex)
                msgsObj[eventCode].fromIndex = currentIndex

              if (lastIndex > msgsObj[eventCode].lastIndex)
                msgsObj[eventCode].lastIndex = lastIndex

              if (msgsObj[eventCode].firstDate > date)
                msgsObj[eventCode].firstDate = date

              if (msgsObj[eventCode].lastDate < date)
                msgsObj[eventCode].lastDate = date

              msgsObj[eventCode].shortMsgs.push(
                Utils._getShortMsg({ id: currentIndex, date })
              )
            }
          }

          try {
            if (Object.keys(msgsObj).length > 0) {
              res += Object.keys(msgsObj)
                .map(
                  (key) =>
                    `\`${notifyCodes[key] ? notifyCodes[key].symbol : '❓'} (${
                      msgsObj[key].counter
                    }) ${msgsObj[key].msg}\` ${Array.from(msgsObj[key].partners)
                      .map((name) => `#${name}`)
                      .join(' ')}\n\n${Utils._getShortListMD({
                      shortMsgs: msgsObj[key].shortMsgs,
                      limit: 5,
                    })}`
                )
                .join('\n\n')
            }
          } catch (err) {
            res += err?.message || 'Не удалось сформировать ответ'
          }

          // const contragentsArr = Array.from(contragents)
          // if (contragentsArr.length > 0) header += ` | ${contragentsArr.join(', ')}`

          // res += '\n\n[Full SmartPrice report](https://docs.google.com/spreadsheets/d/1NBXuyGlCznS0SJjJJX52vR3ZzqPAPM8LQPM_GX8T_Wc/edit#gid=36671662)'

          return `*${header}*\n\n${res}`
        } catch (err) {
          return `ERR001: ${err?.message || 'No err.message'}`
        }
      },
    }),

    // -- TODO: Refactoring: json for client should be made here...
    onFail: async ({ res }) => {
      const targetEventCode = req.body.rowValues[2]
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
      item: req.body.rowValues,
      id: req.body.resultId || String(ts),
      ts,
    },
    // --

    reqBody: { ...req.body, itemParams: req.body.rowValues },
  })
}
