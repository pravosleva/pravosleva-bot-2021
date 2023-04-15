import express from 'express'
import { withHelpfulInstances } from '~/express-tools/utils/notify-tools/mws/withHelpfulInstances'
import { spNotifyRouter } from './smartprice'
import { kanban2021NotifyRouter } from './kanban-2021'
import { auditHelper2023NotifyRouter } from './audit-helper-2023'

const router = express.Router()

// NOTE: TG_NOTIFS Step 1/3
router.use(withHelpfulInstances)
router.use('/sp', spNotifyRouter)
router.use('/kanban-2021', kanban2021NotifyRouter)
router.use('/audit-helper-2023', auditHelper2023NotifyRouter)

export const notifyRouter = router
