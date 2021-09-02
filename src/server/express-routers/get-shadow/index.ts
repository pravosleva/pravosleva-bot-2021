import express from 'express'
import { docsShadow } from './document'

const router = express.Router()

router.get('/document/:file_id', docsShadow)

export const getShadow = router
