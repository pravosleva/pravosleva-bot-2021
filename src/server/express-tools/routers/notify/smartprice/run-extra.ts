import { Response as IResponse } from 'express'
// import { queueDispatcher } from '~/express-tools/utils/notify-tools/QueueDisparcher'
import { THelp, TModifiedRequest } from '~/bot/utils/interfaces'

export enum ENotifNamespace {
  OFFLINE_TRADEIN_UPLOAD_WIZARD = 'offline-tradein/upload-wizard',
  OFFLINE_TRADEIN_MTSMAIN = 'offline-tradein/mtsmain',
  // PRAVOSLEVA = 'pravosleva',
}

export const runExtra = async (req: TModifiedRequest, res: IResponse) => {
  const { chat_id, message_thread_id, namespace } = req.body
  const result: any = {
    ok: false,
  }

  switch (namespace) {
    case ENotifNamespace.OFFLINE_TRADEIN_UPLOAD_WIZARD:
    case ENotifNamespace.OFFLINE_TRADEIN_MTSMAIN: {
      const { offlineTradeInQueueDispatcher: queueDispatcher } =
        req.notifyTools.smartprice

      const _result = await queueDispatcher.runExtra({
        chat_id,
        message_thread_id,
      })
      result.ok = _result.ok
      if (_result.message) result.message = _result.message
      result._service = {
        runExtraResult: _result,
      }

      break
    }
    // NOTE: Other cases...
    default:
      result.message = `Не предусмотрено для namespace= \`${namespace}\``
      break
  }

  return res.status(200).send(result)
}

export const _help: THelp = {
  params: {
    body: {
      chat_id: {
        type: 'number',
        descr: 'TG chat_id',
        required: true,
      },
      namespace: {
        type: 'string',
        descr: 'notifs namespace',
        required: true,
      },
    },
  },
}
