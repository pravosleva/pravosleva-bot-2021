import express from 'express'

import { sendNotify as sendOfflineTradeInNotify } from './offline-tradein/upload-wizard/send'
import { reqBodyValidationMW } from '~/express-tools/utils/mws/reqBodyValidationMW'
import { _help as offlineTradeInUploadWizardRules } from '~/express-tools/utils/notify-tools/offline-tradein/upload-wizard'
import { withBotInstanceInTools } from '~/express-tools/utils/notify-tools/mws/withBotInstanceInTools'

const router = express.Router()

router.use(withBotInstanceInTools)
router.post(
  '/offline-tradein/upload-wizard/send',
  reqBodyValidationMW({ rules: offlineTradeInUploadWizardRules }),
  sendOfflineTradeInNotify
)

export const spNotifyRouter = router
