export type TQueueState = {
  msgs: string[]
  rows: any[][]
  ids: number[]
  tss: number[]
  delay: number
}

export type TCodeSettings = {
  symbol: string
  descr: string
  doNotify: boolean
  validate?: (rowValues: any[]) => boolean
  showAdditionalInfo: boolean
}

export type TNotifyCodesMap = {
  [key: string]: TCodeSettings
}
