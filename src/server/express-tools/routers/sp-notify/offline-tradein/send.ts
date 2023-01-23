/* eslint-disable no-return-await */
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
      tgResp = await queueDispatcher.sendNow({
        utils,
        newItem: {
          chat_id,
          msg: md,
          row: rowValues,
          id: resultId,
          ts,
        },
        targetAction: async ({ msg, chat_id }) => {
          return await req.bot.telegram.sendMessage(chat_id, msg, {
            parse_mode: 'Markdown',
          })
        },
        cb: (q) => {
          q.resetTimer({ chat_id })
          freeDispatcher.fix({ chat_id })
        },
      })
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
