import express from 'express'

import { sendNotify as sendOfflineTradeInNotify } from './offline-tradein/upload-wizard/send'
import { withReqBodyValidationMW } from '~/express-tools/utils/mws/withReqBodyValidationMW'
import { _help as offlineTradeInUploadWizardRules } from '~/express-tools/utils/notify-tools/offline-tradein/upload-wizard'
import { withBotInstanceInTools } from '~/express-tools/utils/notify-tools/mws/withBotInstanceInTools'

const router = express.Router()

router.use(withBotInstanceInTools)
router.post(
  '/offline-tradein/upload-wizard/send',
  withReqBodyValidationMW({ rules: offlineTradeInUploadWizardRules }),
  sendOfflineTradeInNotify
)

export const spNotifyRouter = router
