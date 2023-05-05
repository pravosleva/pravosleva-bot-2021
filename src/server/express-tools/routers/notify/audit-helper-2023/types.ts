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

export enum EEventCodesV2 {
  PARSING_RESILT_SUCCESS_V2 = 'parsing_result_success_v2',
}

export type TReqBodyV2 = {
  ts?: number
  eventCode: EEventCodes
  report: {
    [key: string]: {
      elmTextList: string[]
    }
  }
  words: string[]
  chat_id: number
}
