import { Response as IResponse, NextFunction as INextFunction } from 'express'
import { QueueDispatcher } from '~/express-tools/utils/notify-tools/QueueDisparcher'
import { TModifiedRequest } from '~/bot/utils/interfaces'
import { freeDispatcher } from '~/express-tools/utils/notify-tools/FreeDispatcher'

// -- NOTE: TG_NOTIFS Step 2/3
// NOTE: Персональные очереди для пользователей (с таймером)
export const queueDispatcher = new QueueDispatcher({
  // NOTE: Время, не чаще которого разрешается беспокоить пользователя
  // defaultDelay: 1000 * 60 * 30, // 30 min
  defaultDelay: 1000 * 60 * 60 * 1, // 1 hour
  // defaultDelay: 1000 * 60 * 60 * 24, * 1 // 1 day

  // NOTE: Количество сообщений в очереди, когда можно отправить подряд по одному
  // (если в очереди больше, то отправится все одним сообщением)
  differentMsgsLimitNumber: 1,
})
const queueDispatcherKanban2021 = new QueueDispatcher({
  // defaultDelay: 1000 * 60 * 60 * 1,
  defaultDelay: 1000 * 20, // sec
  differentMsgsLimitNumber: 1,
})
const queueDispatcherAuditHelper2023 = new QueueDispatcher({
  defaultDelay: 1000 * 60 * 60 * 1,
  differentMsgsLimitNumber: 5,
})
// --

export const withHelpfulInstances = (
  req: TModifiedRequest,
  _res: IResponse,
  next: INextFunction
) => {
  // -- NOTE: Set bot instance
  // NOTE: TG_NOTIFS Step 3/3
  queueDispatcher.setBotInstance(req.bot)
  queueDispatcherKanban2021.setBotInstance(req.bot)
  queueDispatcherAuditHelper2023.setBotInstance(req.bot)
  freeDispatcher.setBotInstance(req.bot)
  // --

  req.notifyTools = {
    freeDispatcher,
    smartprice: {
      offlineTradeInQueueDispatcher: queueDispatcher,
    },
    kanban2021: {
      queueDispatcher: queueDispatcherKanban2021,
    },
    auditHelper2023: {
      queueDispatcher: queueDispatcherAuditHelper2023,
    },
  }

  return next()
}
