import { Request as IRequest } from 'express'
// import { Telegraf } from 'telegraf'

export type TModifiedRequest = IRequest & { bot: any }

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