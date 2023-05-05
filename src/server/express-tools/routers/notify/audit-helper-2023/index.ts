import express from 'express'
import { sendNotifyV2 } from './send-2'
import { withReqBodyValidationMW } from '~/express-tools/utils/mws/withReqBodyValidationMW'
import { _helpV2 } from './_help'

const router = express.Router()

router.post(
  '/send-2',
  withReqBodyValidationMW({ rules: _helpV2 }),
  sendNotifyV2
)

export const auditHelper2023NotifyRouter = router
