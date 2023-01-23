import express from 'express'

import { sendNotify as sendOfflineTradeInNotify } from './offline-tradein/upload-wizard/send'
import { reqBodyValidationMW } from '~/express-tools/utils/reqBodyValidationMW'
import { _help as offlineTradeInUploadWizardRules } from '~/express-tools/utils/notify-tools/offline-tradein/upload-wizard'

const router = express.Router()

router.post(
  '/offline-tradein/upload-wizard/send',
  reqBodyValidationMW({ rules: offlineTradeInUploadWizardRules }),
  sendOfflineTradeInNotify
)

export const spNotifyRouter = router
