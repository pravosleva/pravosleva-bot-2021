import { Response as IResponse, NextFunction as INextFunction } from 'express'
import { QueueDispatcher } from '~/express-tools/utils/notify-tools/QueueDisparcher'
import { TModifiedRequest } from '~/bot/utils/interfaces'
import { freeDispatcher } from '~/express-tools/utils/notify-tools/FreeDispatcher'

// NOTE: Персональные очереди для пользователей (с таймером)
export const offlineTradeInQueueDispatcher = new QueueDispatcher({
  // NOTE: Время, не чаще которого разрешается беспокоить пользователя
  // defaultDelay: 1000 * 60 * 1, // 1 min
  // defaultDelay: 1000 * 60 * 30, // 30 min
  defaultDelay: 1000 * 60 * 60 * 1, // 1 hour
  // defaultDelay: 1000 * 60 * 60 * 24, * 1 // 1 day

  // NOTE: Количество сообщений в очереди, когда можно отправить подряд по одному
  // (если в очереди больше, то отправится все одним сообщением)
  differentMsgsLimitNumber: 1,
})

export const withHelpfulInstances = (
  req: TModifiedRequest,
  _res: IResponse,
  next: INextFunction
) => {
  // -- NOTE: Set bot instance
  offlineTradeInQueueDispatcher.setBotInstance(req.bot)
  freeDispatcher.setBotInstance(req.bot)
  // --

  req.notifyTools = {
    freeDispatcher,
    smartprice: {
      offlineTradeInQueueDispatcher,
    },
  }

  return next()
}
