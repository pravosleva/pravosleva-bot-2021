import express from 'express'

import { sendNotify as sendOfflineTradeInNotify } from './offline-tradein/send'
import { reqBodyValidationMW } from '~/express-tools/utils/reqBodyValidationMW'
import { _help as offlineTradeInRules } from '~/express-tools/utils/notify-tools/offline-tradein'

const router = express.Router()

router.post(
  '/offline-tradein/send',
  reqBodyValidationMW({ rules: offlineTradeInRules }),
  sendOfflineTradeInNotify
)

export const spNotifyRouter = router
