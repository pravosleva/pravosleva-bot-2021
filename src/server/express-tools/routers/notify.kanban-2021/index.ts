import express from 'express'

import { sendNotify as sendReminderNotify } from './reminder/send'
import { withReqBodyValidationMW } from '~/express-tools/utils/mws/withReqBodyValidationMW'
import { _help as reminderRules } from '~/express-tools/utils/notify-tools/reminder'
import { withHelpfulInstances } from '~/express-tools/utils/notify-tools/mws/withHelpfulInstances'

const router = express.Router()

router.use(withHelpfulInstances)
router.post(
  '/reminder/send',
  withReqBodyValidationMW({ rules: reminderRules }),
  sendReminderNotify
)

export const kanban2021NotifyRouter = router
