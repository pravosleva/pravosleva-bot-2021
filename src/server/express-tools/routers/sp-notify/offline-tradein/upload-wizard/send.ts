/* eslint-disable no-return-await */
/* eslint-disable no-loop-func */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prefer-promise-reject-errors */
import { Response as IResponse } from 'express'
import { TModifiedRequest } from '~/bot/utils/interfaces'
import { SPOfflineTradeInUploadWizardUtils } from '~/express-tools/utils/notify-tools/offline-tradein/upload-wizard/SPOfflineTradeInUploadWizardUtils'
// NOTE: Персональные очереди для пользователей (с таймером)
import { queueDispatcher } from '~/express-tools/utils/notify-tools/QueueDisparcher'

export const sendNotify = async (req: TModifiedRequest, res: IResponse) => {
  const { ts: _optionalTs } = req.body
  const ts = _optionalTs || new Date().getTime()

  // --- TODO: Refactoring: json for client should be made here...
  return await queueDispatcher.add({
    res,
    utils: new SPOfflineTradeInUploadWizardUtils({ req }),
    onFail: async ({ res }) =>
      await res.status(200).send({ ok: false, message: 'Unnecessary case' }),
    onSendNow: async ({ res, toClient }) =>
      await res.status(200).send(toClient),
    onSendLater: async ({ res, toClient }) =>
      await res.status(200).send(toClient),
    newItem: {
      row: req.body.rowValues,
      id: req.body.resultId,
      ts,
    },
    reqBody: req.body,
  })
  // ---
}
