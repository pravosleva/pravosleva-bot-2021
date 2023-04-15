import { Request as IRequest } from 'express'
import { QueueDispatcher } from '~/express-tools/utils/notify-tools'
// import { Telegraf } from 'telegraf'
import { FreeDispatcher } from '~/express-tools/utils/notify-tools/FreeDispatcher'

export type TModifiedRequest = IRequest & {
  bot: any
  notifyTools: {
    freeDispatcher: FreeDispatcher
    smartprice: {
      offlineTradeInQueueDispatcher: QueueDispatcher
    }
    kanban2021: {
      queueDispatcher: QueueDispatcher
    }
    auditHelper2023: {
      queueDispatcher: QueueDispatcher
    }
  }
}

export type THelp = {
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
