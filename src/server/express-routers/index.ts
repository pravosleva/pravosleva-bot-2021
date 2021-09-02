import { getShadow } from './get-shadow'

const express = require('express')

const router = express.Router()

router.use('/get-shadow', getShadow)

export { router }
