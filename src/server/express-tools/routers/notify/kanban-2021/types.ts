export enum EEventCodes {
  WEEKLY_REMINDER = 'weekly_reminder',
  DAILY_REMINDER = 'daily_reminder',
}

export type TReqBody = {
  ts?: number
  eventCode: EEventCodes
  about: string
  errMsg?: string
  targetMD: string
  jsonStringified: string
}
