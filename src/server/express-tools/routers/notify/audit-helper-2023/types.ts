export enum EEventCodes {
  PARSING_RESILT_SUCCESS = 'parsing_result_success',
}

export type TReqBody = {
  ts?: number
  eventCode: EEventCodes
  links: string[]
  words: string[]
  chat_id: number
}
