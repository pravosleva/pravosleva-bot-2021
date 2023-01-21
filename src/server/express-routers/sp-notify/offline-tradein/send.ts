/* eslint-disable no-loop-func */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prefer-promise-reject-errors */
// import axios from 'axios'
// import { httpClient } from '~/bot/withMyAutopark2022/utils/httpClient'
import { wasSentInTime } from '~/bot/utils/wasSentInTime'
import { FreeDispatcher } from '~/bot/utils/FreeDispatcher'
import { THelp } from '~/bot/utils/interfaces'

// NOTE: Менеджер частоты доставки (x сообщений будут доставлены, независимо от временной задержки)
const freeDispatcher = new FreeDispatcher({ defaultOddFree: 5 })

type TTimersMap = Map<number, { ts: number }>
const timersMap: TTimersMap = new Map()

type TQueueState = { msgs: string[]; rows: any[][]; ids: number[] }
const queueMap: Map<number, TQueueState> = new Map()

class Utils {
  req: any
  constructor({ req }) {
    this.req = req
  }
  get notifyCodes() {
    return {
      upload_err: {
        symbol: '⛔',
        doNotify: true,
      },
      upload_ok: {
        symbol: '✅',
        doNotify: true,
        validate: (rowValues: any[]): boolean => rowValues[4] === rowValues[8],
      },
      user_report: {
        symbol: 'ℹ️',
        doNotify: true,
      },
      tradein_id_entered: {
        symbol: '⌨️',
        doNotify: false,
      },
    }
  }
  getMD() {
    const { rowValues } = this.req.body
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
    ] = rowValues
    let result = ''

    const getBackResponseMD = (jsonStr) => {
      if (!jsonStr) return ''

      let res = ''
      let _modifiedJSON
      try {
        _modifiedJSON = JSON.parse(jsonStr)
      } catch (err) {
        console.log(err)
      }

      if (_modifiedJSON)
        res += `\n\`\`\`\n${
          _modifiedJSON ? JSON.stringify(_modifiedJSON, null, 2) : jsonStr
        }\n\`\`\``

      return res
    }
    const jsonFromBack = getBackResponseMD(originalServerResponseStr)

    result += `*SP notify${
      this.req.body.resultId ? ` #${this.req.body.resultId}` : ''
    } | ${partnerName} ${tradeinId || '?'}*\n\n${
      this.notifyCodes[eventCode].symbol
    } \`${eventCode} (${curFileCounter} of ${totalFilesLeftCounter})\`${
      additionalInfo ? `\n\n${additionalInfo}` : ''
    }${jsonFromBack ? `\n${jsonFromBack}` : ''}`

    return result
  }
  get isNotifUselessness() {
    return (
      !this.req.body.rowValues[2] ||
      !this.notifyCodes[this.req.body.rowValues[2]] ||
      !this.notifyCodes[this.req.body.rowValues[2]].doNotify ||
      (!!this.notifyCodes[this.req.body.rowValues[2]].validate &&
        !this.notifyCodes[this.req.body.rowValues[2]].validate(
          this.req.body.rowValues
        ))
    )
  }
  getSingleMessageMD({ queueState }: { queueState: TQueueState }) {
    let header = `SP notify (${queueState.ids.length} events)`
    const msgsObj: { [key: string]: { counter: number; msg: string } } = {}
    let res = ''
    const contragents = new Set()

    for (let i = 0, max = queueState.ids.length; i < max; i++) {
      const rowValues = queueState.rows[i]
      const eventCode = rowValues[2]
      const fromIndex = queueState.ids[0]
      const partnerName = rowValues[7]
      contragents.add(partnerName)

      if (!msgsObj[eventCode])
        msgsObj[eventCode] = {
          counter: 1,
          msg: `${eventCode} index from #${fromIndex}`, // NOTE: Universal message for all items!
        }
      else msgsObj[eventCode].counter += 1
    }

    if (Object.keys(msgsObj).length > 0) {
      res += Object.keys(msgsObj)
        .map(
          (key) =>
            `\`${this.notifyCodes[key].symbol} (${msgsObj[key].counter}) ${msgsObj[key].msg}\``
        )
        .join('\n\n')
    }

    const contragentsArr = Array.from(contragents)
    if (contragentsArr.length > 0) header += ` | ${contragentsArr.join(', ')}`

    return `*${header}*\n\n${res}\n\n[Full SmartPrice report](https://docs.google.com/spreadsheets/d/1NBXuyGlCznS0SJjJJX52vR3ZzqPAPM8LQPM_GX8T_Wc/edit#gid=36671662)`
  }
}

const _help: THelp = {
  params: {
    body: {
      chat_id: {
        type: 'number',
        descr: 'TG chat_id',
        required: true,
      },
      rowValues: {
        type: 'any[]',
        descr: 'Google sheet row data',
        required: true,
      },
      resultId: {
        type: 'number',
        descr: 'Google sheet row index',
        required: false,
      },
    },
  },
}

export const sendNotify = async (req, res) => {
  // console.log(req.body)
  const { chat_id } = req.body

  // -- NOTE: Errs handler (TODO: Make as middleware)
  const errs: string[] = []
  for (const key in _help.params.body) {
    if (_help.params.body[key]?.required && !req.body[key])
      errs.push(
        `Missing required param: \`${key}\` (${_help.params.body[key].descr})`
      )
  }
  if (errs.length > 0)
    return res.status(200).send({
      ok: false,
      message: `ERR! ${errs.join('; ')}`,
      _originalBody: req.body,
      _help,
    })
  // --

  freeDispatcher.init({ chat_id })

  // NOTE: v2
  // 1. Check timers in this startup session
  const isSentInTime = await wasSentInTime({
    key: chat_id,
    jsMap: timersMap,
    delayMs: 1000 * 60 * 10,
  })
    .then((r) => r)
    .catch((e) => e)
  // const isSentInTime = { isOk: true, message: 'Ok' }

  // 2. Get user data - httpClient.checkUser({ chat_id })
  let data: any
  let tgResp: any[] = []

  const utils = new Utils({ req })
  const md = utils.getMD()
  const { isNotifUselessness } = utils

  if (isNotifUselessness)
    return res.status(200).send({ ok: false, message: 'Unnecessary case' })

  // ---
  const { rowValues, resultId } = req.body
  const initialState = { msgs: [], rows: [], ids: [] }

  switch (true) {
    // NOTE: 3. SEND NOW?
    case isSentInTime.isOk || freeDispatcher.isAllowed({ chat_id }): {
      // --- SEND LOGIC
      if (queueMap.has(chat_id)) {
        // NOTE: 3.1. Get queue -> reset timer & reset queue.msgs
        const queue = queueMap.get(chat_id)
        if (Array.isArray(queue.msgs) && queue.msgs.length > 0) {
          queueMap.set(chat_id, initialState)
          queue.msgs.push(md)
          queue.rows.push(rowValues)
          queue.ids.push(resultId)

          // NOTE: 3.1.1 Send some msgs

          const limit = 5 // NOTE: Если больше - отправка будет одним общим сообщением
          switch (true) {
            // NOTE: 3.1.1.1 Less than limit?
            case queue.msgs.length <= limit:
              for (let i = 0, max = queue.msgs.length; i < max; i++) {
                setTimeout(async () => {
                  tgResp.push(
                    await req.bot.telegram.sendMessage(chat_id, queue.msgs[i], {
                      parse_mode: 'Markdown',
                    })
                  )
                }, i * 500)
              }
              break
            default: {
              // NOTE: 3.1.1.2 More than limit?
              const singleMessage = utils.getSingleMessageMD({
                queueState: queue,
              })
              tgResp = [
                await req.bot.telegram.sendMessage(chat_id, singleMessage, {
                  parse_mode: 'Markdown',
                }),
              ]
              break
            }
          }
        } else {
          // NOTE: 3.2 Send single msg
          queueMap.set(chat_id, initialState) // Reset queue state

          tgResp = [
            await req.bot.telegram.sendMessage(chat_id, md, {
              parse_mode: 'Markdown',
            }),
          ]
        }
      } else {
        // NOTE: 3.2 Send single msg
        queueMap.set(chat_id, initialState) // Reset queue state

        tgResp = [
          await req.bot.telegram.sendMessage(chat_id, md, {
            parse_mode: 'Markdown',
          }),
        ]
      }
      timersMap.set(chat_id, { ts: new Date().getTime() })
      freeDispatcher.fix({ chat_id })
      // ---

      const toClient: any = {
        ok: true,
        data,
        originalBody: req.body,
        _serviceInfo: {
          'freeDispatcher.getChatState': freeDispatcher.getChatState({
            chat_id,
          }),
        },
      }
      if (tgResp.length > 0) toClient.tgResp = tgResp

      return res.status(200).send(toClient)
    }
    // NOTE: 4. Add to queue
    default: {
      const queue = queueMap.get(chat_id)
      if (queue) {
        if (Array.isArray(queue.msgs) && queue.msgs.length > 0) {
          queueMap.set(chat_id, {
            msgs: [...queue.msgs, md],
            rows: [...queue.rows, rowValues],
            ids: [...queue.ids, resultId],
          })
        } else
          queueMap.set(chat_id, {
            msgs: [md],
            rows: [rowValues],
            ids: [resultId],
          })
      } else
        queueMap.set(chat_id, {
          msgs: [md],
          rows: [rowValues],
          ids: [resultId],
        })

      return res.status(200).send({
        ok: false,
        message:
          isSentInTime.message ||
          `No isSentInTime.message or !freeDispatcher.isAllowed({ chat_id: ${chat_id} })`,
        _serviceInfo: {
          'freeDispatcher.getChatState': freeDispatcher.getChatState({
            chat_id,
          }),
          'freeDispatcher.isAllowed': freeDispatcher.isAllowed({ chat_id }),
        },
        _originalBody: req.body,
      })
    }
  }
  // ---
}
