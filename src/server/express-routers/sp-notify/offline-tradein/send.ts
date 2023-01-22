/* eslint-disable no-loop-func */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prefer-promise-reject-errors */
import { FreeDispatcher } from '~/bot/utils/notify-tools/FreeDispatcher'
import {
  Utils,
  _help,
  QueueDisparcher,
} from '~/bot/utils/notify-tools/offline-tradein'

const queueDispatcher = new QueueDisparcher({
  defaultDelay: 1000 * 60 * 1, // -> 10 min
  differenceMessagesPackLimit: 3,
})

// NOTE: Менеджер частоты доставки (x сообщений будут доставлены, независимо от временной задержки)
const freeDispatcher = new FreeDispatcher({ defaultOddFree: 3 })

export const sendNotify = async (req, res) => {
  // console.log(req.body)
  const { chat_id, delay } = req.body
  // const delayLimit =
  // const _modifiedDelay = !!delay && isNumber(delay) ? delay

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
      // _help,
    })
  // --

  queueDispatcher.init({ chat_id, delay })
  freeDispatcher.init({ chat_id })

  // NOTE: v2
  // 1. Check timers in this startup session
  const isSentInTime = await queueDispatcher.isSentInTimePromise({
    chat_id,
  }) // NOTE: Sample { isOk: true, message: 'Ok' }

  // 2. Get user data - httpClient.checkUser({ chat_id })
  let data: any
  let tgResp: any[] = []

  const utils = new Utils({ req })
  const md = utils.getMD()
  const { isNotifUselessness } = utils

  if (isNotifUselessness)
    return res.status(200).send({ ok: false, message: 'Unnecessary case' })

  const { rowValues, resultId } = req.body
  // const initialState = { msgs: [], rows: [], ids: [] }

  switch (true) {
    // NOTE: 3. SEND NOW?
    case isSentInTime.isOk || freeDispatcher.isAllowed({ chat_id }): {
      // -- SEND LOGIC
      const hasChat = queueDispatcher.hasChat({ chat_id })
      if (hasChat) {
        // console.log('3.1')
        // NOTE: 3.1. Get queue -> reset timer & reset queue
        const queueNow = queueDispatcher.getChatData({ chat_id }) // queueMap.get(chat_id)
        if (Array.isArray(queueNow.msgs) && queueNow.msgs.length > 0) {
          // queueMap.set(chat_id, { ...initialState, delay: 1 })
          queueDispatcher.resetChat({ chat_id })

          queueNow.msgs.push(md)
          queueNow.rows.push(rowValues)
          queueNow.ids.push(resultId)

          // NOTE: 3.1.1 Send some msgs
          // NOTE: Если больше - отправка будет одним общим сообщением
          switch (true) {
            // NOTE: 3.1.1.1 Less than limit?
            case queueNow.msgs.length <= queueDispatcher.limit:
              for (let i = 0, max = queueNow.msgs.length; i < max; i++) {
                setTimeout(async () => {
                  tgResp.push(
                    await req.bot.telegram.sendMessage(
                      chat_id,
                      queueNow.msgs[i],
                      {
                        parse_mode: 'Markdown',
                      }
                    )
                  )
                }, i * 500)
              }
              break
            default: {
              // NOTE: 3.1.1.2 More than limit?
              const singleMessage = utils.getSingleMessageMD({
                queueState: queueNow,
              })
              tgResp.push(
                await req.bot.telegram.sendMessage(chat_id, singleMessage, {
                  parse_mode: 'Markdown',
                })
              )
              // TODO: How to send link as button? setTimeout(async () => { tgResp.push() }, 500)

              break
            }
          }
        } else {
          // console.log('3.1.2')
          // NOTE: 3.1.2 Send single msg
          // queueMap.set(chat_id, initialState) // Reset queue state
          queueDispatcher.resetChat({ chat_id })

          tgResp = [
            await req.bot.telegram.sendMessage(chat_id, md, {
              parse_mode: 'Markdown',
            }),
          ]
        }
      } else {
        // console.log('3.2')
        // NOTE: 3.2 Send single msg
        // queueMap.set(chat_id, initialState) // Reset queue state
        queueDispatcher.resetChat({ chat_id })

        tgResp = [
          await req.bot.telegram.sendMessage(chat_id, md, {
            parse_mode: 'Markdown',
          }),
        ]
      }

      queueDispatcher.resetTimer({ chat_id })
      freeDispatcher.fix({ chat_id })
      // --

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
      // console.log('4')
      queueDispatcher.addItem({
        chat_id,
        msg: md,
        row: rowValues,
        id: resultId,
        delay,
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
}
