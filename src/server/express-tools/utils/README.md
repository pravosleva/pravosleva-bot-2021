# Helpful Express middlewares

## `reqBodyValidationMW`

```ts
import express from 'express'
import { reqBodyValidationMW } from '~/express-tools/utils/reqBodyValidationMW'

type THelp = {
  params: {
    body?: {
      [key: string]: {
        type: string
        descr: string
        required: boolean
      }
    }
    query?: {
      [key: string]: {
        type: string
        descr: string
        required: boolean
      }
    }
  }
  res?: {
    [key: string]: any
  }
}

export const _help: THelp = {
  params: {
    body: {
      chat_id: {
        type: 'number',
        descr: 'TG chat_id',
        required: true,
      },
      ts: {
        type: 'number',
        descr: 'timestamp for getTimeAgo function (for report UI only)',
        required: false,
      },
    },
  },
}

const router = express.Router()

router.post(
  '/route/sample',
  reqBodyValidationMW({ rules: _help }),
  (req, res, next) => {
    // NOTE: req.body validated already
    next()
  }
)

export const spNotifyRouter = router
```
