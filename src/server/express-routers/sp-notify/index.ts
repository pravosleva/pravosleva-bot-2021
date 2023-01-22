import express from 'express'

import { sendNotify as sendOfflineTradeInNotify } from './offline-tradein/send'

const router = express.Router()

router.post('/offline-tradein/send', sendOfflineTradeInNotify)

export const spNotifyRouter = router
