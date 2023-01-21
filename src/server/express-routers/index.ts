import cors from 'cors'
import { getShadow } from './get-shadow'
import { sendCode } from './autopark-2022/send-code'
import { sendNotify } from './sp-notify/offline-tradein/send'

// eslint-disable-next-line import/no-extraneous-dependencies, node/no-extraneous-require
const bodyParser = require('body-parser')

const express = require('express')

const router = express.Router()

router.use(cors())

router.use(bodyParser.urlencoded({ extended: false }))
router.use(bodyParser.json())

router.use('/get-shadow', getShadow)
router.use('/autopark-2022/send-code', sendCode)
router.post('/sp-notify/offline-tradein/send', sendNotify)

export { router }
