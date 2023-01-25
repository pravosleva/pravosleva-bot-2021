import { Response as IResponse, NextFunction as INextFunction } from 'express'
// import { queueDispatcher } from '~/express-tools/utils/notify-tools/QueueDisparcher'
import { TModifiedRequest } from '~/bot/utils/interfaces'

export const withBotInstanceInTools = (
  _req: TModifiedRequest,
  _res: IResponse,
  next: INextFunction
) => {
  // -- NOTE: Set bot instance
  // queueDispatcher.setBotInstance(req.bot)
  // --

  return next()
}
