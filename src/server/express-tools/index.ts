import cors from 'cors'
import { getShadow } from './routers/get-shadow'
import { sendCode } from './routers/autopark-2022/send-code'
import { spNotifyRouter } from './routers/notify.smartprice'
import { kanban2021NotifyRouter } from './routers/notify.kanban-2021'

// eslint-disable-next-line import/no-extraneous-dependencies, node/no-extraneous-require
const bodyParser = require('body-parser')

const express = require('express')

const router = express.Router()

router.use(cors())

router.use(bodyParser.urlencoded({ extended: false }))
router.use(bodyParser.json())

router.use('/get-shadow', getShadow)
router.use('/autopark-2022/send-code', sendCode)
router.use('/sp-notify', spNotifyRouter)
router.use('/notify.kanban-2021', kanban2021NotifyRouter)

export { router }
