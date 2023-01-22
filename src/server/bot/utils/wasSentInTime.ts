/* eslint-disable prefer-promise-reject-errors */
import { getTimeAgo } from '~/bot/utils/getTimeAgo'
import { convertMillisToMinutesAndSeconds } from '~/bot/utils/convertMillisToMinutesAndSeconds'

export type TWasSentInTimeArgs = {
  key: number
  jsMap: Map<any, any>
  delayMs: number
}
export type TWasSentInTimeResponse = {
  isOk: boolean
  message?: string
}

// NOTE: Derty function!
export const wasSentInTime = ({
  key,
  jsMap,
  delayMs,
}: TWasSentInTimeArgs): Promise<TWasSentInTimeResponse> => {
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
