import cors from 'cors'
import { getShadow } from './routers/get-shadow'
import { sendCode } from './routers/autopark-2022/send-code'
import { notifyRouter } from './routers/notify'

// eslint-disable-next-line import/no-extraneous-dependencies, node/no-extraneous-require
const bodyParser = require('body-parser')

const express = require('express')

const router = express.Router()

router.use(cors())

router.use(bodyParser.urlencoded({ extended: false }))
router.use(bodyParser.json())

router.use('/get-shadow', getShadow)
router.use('/autopark-2022/send-code', sendCode)
router.use('/notify', notifyRouter)

export { router }
