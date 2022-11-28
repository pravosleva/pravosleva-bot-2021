/* eslint-disable prefer-promise-reject-errors */
import axios from 'axios'
import { httpClient } from '~/bot/withMyAutopark2022/utils/httpClient'
import { getTimeAgo } from '~/bot/utils/getTimeAgo'
import { convertMillisToMinutesAndSeconds } from '~/bot/utils/convertMillisToMinutesAndSeconds'

const { TG_BOT_TOKEN } = process.env

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

const _help: THelp = {
  params: {
    body: {
      chat_id: {
        type: 'number',
        descr: 'TG chat_id',
        required: true,
      },
    },
  },
}

type TTimersMap = Map<number, { ts: number }>
const timersMap: TTimersMap = new Map()
const wasSentInTime = ({
  key,
  jsMap,
  delayMs,
}: {
  key: number
  jsMap: Map<any, any>
  delayMs: number
}): Promise<{
  isOk: boolean
  message?: string
}> => {
  if (jsMap.has(key)) {
    const data = jsMap.get(key)
    if (!!data.ts && typeof data.ts === 'number') {
      const lastCallTime = data.ts
      const deadlineTime = lastCallTime + delayMs
      const nowTime = new Date().getTime()
      const waitingText = `Please wait ${convertMillisToMinutesAndSeconds(
        deadlineTime - nowTime
      )} min (requested ${getTimeAgo(data.ts)})`

      if (nowTime - data.ts < delayMs) {
        return Promise.reject({ isOk: false, message: waitingText })
      }
      return Promise.resolve({ isOk: true, message: 'Ok' })
    }
  }
  return Promise.resolve({ isOk: true, message: 'Ok' })
}

export const sendCode = async (req, res) => {
  // console.log(req.body)
  const { chat_id } = req.body

  const errs: string[] = []

  for (const key in _help.params.body) {
    if (_help.params.body[key]?.required && !req.body[key])
      errs.push(
        `Missing required param: \`${key}\` (${_help.params.body[key].descr})`
      )
  }
  if (errs.length > 0)
    return res.status(200).send({
      ok: false,
      message: `ERR! ${errs.join('; ')}`,
      _originalBody: req.body,
      _help,
    })

  // NOTE:
  // 1. Check timers in this startup session
  const isSentInTime = await wasSentInTime({
    key: chat_id,
    jsMap: timersMap,
    delayMs: 1000 * 60 * 1, // 1 min
  })
    .then((r) => {
      return r
    })
    .catch((e) => {
      console.log(e)
      return e
    })

  // 2. Get user data - httpClient.checkUser({ chat_id })
  let data: any
  let tgResp: any
  switch (true) {
    case isSentInTime.isOk: {
      data = await httpClient
        .checkUser({ chat_id })
        .then(async (res) => {
          // console.log(data)

          timersMap.set(chat_id, { ts: new Date().getTime() })

          // 3. If ok -> send code
          if (typeof res === 'object') {
            tgResp = await axios
              .post(
                `https://api.telegram.org/bot${TG_BOT_TOKEN}/sendMessage?chat_id=${chat_id}&text=${
                  res.password || 'ERR'
                }`
              )
              .then(() => {
                // console.log('--- RES')
                // console.log(res)
                // console.log('--- RES:END')
              })
              .catch(() => {
                // console.log('--- ERR')
                // console.log(err)
                // console.log('--- ERR:END')
              })
          }
        })
        .catch((msg) => msg)

      const toClient: any = {
        ok: true,
        data,
        originalBody: req.body,
      }
      if (tgResp) toClient.tgResp = tgResp

      return res.status(200).send(toClient)
    }
    default:
      return setTimeout(() => {
        res.status(200).send({
          ok: false,
          message: isSentInTime.message || 'No isSentInTime.message',
          _originalBody: req.body,
        })
      }, 1000)
  }
}
