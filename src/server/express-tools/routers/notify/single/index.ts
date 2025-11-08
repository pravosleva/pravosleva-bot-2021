import express from 'express'
import { singleStack, _help } from './stack'
// import { _help as reminderRules } from '~/express-tools/utils/notify-tools/reminder'
import { withReqBodyValidationMW } from '~/express-tools/utils/mws/withReqBodyValidationMW'

const router = express.Router()

router.post('/stack', withReqBodyValidationMW({ rules: _help }), singleStack)

export const singleRouter = router
