export enum EEventCodes {
  MAGAZ_REMINDER_DAILY = 'magaz_reminder_daily',
  MAGAZ_REMINDER_WEEKLY = 'magaz_reminder_weekly',
  MAGAZ_SPRINT_REMINDER_WEEKLY = 'magaz_sprint_reminder_weekly',
  MAGAZ_REMINDER_MONTHLY = 'magaz_reminder_monthly',

  SP_REMINDER_DAILY = 'sp_reminder_daily',
  SP_REMINDER_WEEKLY = 'sp_reminder_weekly',

  TASKLIST_REMINDER_DAILY = 'tasklist_reminder_daily',

  AUX_SERVICE = 'aux_service',
  SINGLE_REMINDER = 'single_reminder',
}

export type TReqBody = {
  ts?: number
  eventCode: EEventCodes
  about: string
  errMsg?: string
  targetMD: string
  jsonStringified: string
  partialHeader?: string
  header?: string
}
