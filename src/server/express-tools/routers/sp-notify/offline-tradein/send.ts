/* eslint-disable no-loop-func */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prefer-promise-reject-errors */
import { Response as IResponse } from 'express'
import { TModifiedRequest } from '~/bot/utils/interfaces'
// NOTE: Менеджер частоты доставки (без таймера, только учет количества)
import { freeDispatcher } from '~/express-tools/utils/notify-tools/FreeDispatcher'
import {
  Utils,
  // NOTE: Персональные очереди для пользователей (с таймером)
  queueDispatcher,
} from '~/express-tools/utils/notify-tools/offline-tradein'

export const sendNotify = async (req: TModifiedRequest, res: IResponse) => {
  const { chat_id, delay, oddFree, ts } = req.body

  queueDispatcher.init({ chat_id, delay })
  freeDispatcher.init({ chat_id, oddFree })

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

  switch (true) {
    // NOTE: 3. SEND NOW?
    case isSentInTime.isOk || freeDispatcher.isAllowed({ chat_id }): {
      // -- SEND LOGIC
      const hasChat = queueDispatcher.hasChat({ chat_id })
      if (hasChat) {
        // NOTE: 3.1. Get queue -> reset timer & reset queue & send current queue state
        const queueNow = queueDispatcher.getChatData({ chat_id }) // queueMap.get(chat_id)
        if (Array.isArray(queueNow.msgs) && queueNow.msgs.length > 0) {
          queueDispatcher.resetChat({ chat_id })
          queueNow.msgs.push(md)
          queueNow.rows.push(rowValues)
          queueNow.ids.push(resultId)
          queueNow.tss.push(ts)

          // NOTE: 3.1.1 Send some msgs
          const differentMsgsLimitNumber = 3
          // NOTE: Если больше - отправка будет одним общим сообщением
          switch (true) {
            // NOTE: 3.1.1.1 Less than limit?
            case queueNow.msgs.length <= differentMsgsLimitNumber:
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
              // NOTE: 3.1.1.2 More than limit? Send special common single msg
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
          // NOTE: 3.1.2 Reset queue state & Send single msg
          queueDispatcher.resetChat({ chat_id })
          tgResp = [
            await req.bot.telegram.sendMessage(chat_id, md, {
              parse_mode: 'Markdown',
            }),
          ]
        }
      } else {
        // NOTE: 3.2 Reset queue state & Send single msg
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
          'queueDispatcher.getQueueState': queueDispatcher.getQueueState({
            chat_id,
          }),
        },
      }
      if (tgResp.length > 0) toClient.tgResp = tgResp

      return res.status(200).send(toClient)
    }
    // NOTE: 4. Add to queue
    default: {
      queueDispatcher.addItem({
        chat_id,
        msg: md,
        row: rowValues,
        id: resultId,
        ts,
        delay,
      })
      const queueLengthResult = queueDispatcher.getQueueState({
        chat_id,
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
          'queueDispatcher.getQueueState': queueLengthResult,
        },
        _originalBody: req.body,
      })
    }
  }
}
