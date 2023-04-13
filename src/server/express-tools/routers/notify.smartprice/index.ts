import express from 'express'

import { sendNotify as sendOfflineTradeInNotify } from './offline-tradein/upload-wizard/send'
import { withReqBodyValidationMW } from '~/express-tools/utils/mws/withReqBodyValidationMW'
import { _help as offlineTradeInUploadWizardRules } from '~/express-tools/utils/notify-tools/offline-tradein/upload-wizard'
import { withHelpfulInstances } from '~/express-tools/utils/notify-tools/mws/withHelpfulInstances'
import { runExtra, _help as notifsNamespaceRules } from './run-extra'

const router = express.Router()

router.use(withHelpfulInstances)
router.post(
  '/offline-tradein/upload-wizard/send',
  withReqBodyValidationMW({ rules: offlineTradeInUploadWizardRules }),
  sendOfflineTradeInNotify
)

// NOTE: Common run extra (btn in tg bot)
router.post(
  '/run-extra',
  withReqBodyValidationMW({ rules: notifsNamespaceRules }),
  runExtra
)

export const spNotifyRouter = router
