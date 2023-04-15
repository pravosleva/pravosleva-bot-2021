import express from 'express'
import { sendNotify } from './send'
import { withReqBodyValidationMW } from '~/express-tools/utils/mws/withReqBodyValidationMW'
import { _help } from './_help'

const router = express.Router()

router.post('/send', withReqBodyValidationMW({ rules: _help }), sendNotify)

export const auditHelper2023NotifyRouter = router
