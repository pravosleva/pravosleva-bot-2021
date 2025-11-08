import { Response as IResponse, NextFunction as INextFunction } from 'express'
import { QueueDispatcher } from '~/express-tools/utils/notify-tools/QueueDisparcher'
import { TModifiedRequest } from '~/bot/utils/interfaces'
import { freeDispatcher } from '~/express-tools/utils/notify-tools/FreeDispatcher'

// -- NOTE: TG_NOTIFS Step 2/3
// NOTE: Персональные очереди для пользователей (с таймером)
const offlineTradeInQueueDispatcher = new QueueDispatcher({
  // NOTE: Время, не чаще которого разрешается беспокоить пользователя
  defaultDelay: 1000 * 60 * 20,
  // defaultDelay: 1000 * 60 * 30, // 30 mins
  // defaultDelay: 1000 * 60 * 60 * 1, // 1 hour
  // defaultDelay: 1000 * 60 * 60 * 24, * 1 // 1 day

  // NOTE: Количество сообщений в очереди, когда можно отправить подряд по одному
  // (если в очереди меньше, то отправится все одним сообщением)
  differentMsgsLimitNumber: 3,
})
const queueDispatcherKanban2021 = new QueueDispatcher({
  defaultDelay: 1000 * 60 * 20, // mins
  differentMsgsLimitNumber: 3,
})
const queueDispatcherAuditHelper2023 = new QueueDispatcher({
  defaultDelay: 1000 * 60 * 60 * 1, // hour
  differentMsgsLimitNumber: 2,
})
// --

export const withHelpfulInstances = (
  req: TModifiedRequest,
  _res: IResponse,
  next: INextFunction
) => {
  // -- NOTE: Set bot instance
  // NOTE: TG_NOTIFS Step 3/3
  offlineTradeInQueueDispatcher.setBotInstance(req.bot)
  queueDispatcherKanban2021.setBotInstance(req.bot)
  queueDispatcherAuditHelper2023.setBotInstance(req.bot)
  freeDispatcher.setBotInstance(req.bot)
  // --

  req.notifyTools = {
    freeDispatcher,
    smartprice: {
      queueDispatcher: offlineTradeInQueueDispatcher,
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
