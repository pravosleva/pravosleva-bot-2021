export type TQueueState = {
  msgs: string[]
  rows: any[][]
  ids: number[]
  tss: number[]
  delay: number
}

export type TCodeSettings = {
  symbol: string
  dontShowSymbol?: boolean
  descr: string
  doNotify: boolean
  validate?: (itemParams: any) => boolean
  showAdditionalInfo: boolean
}

export type TNotifyCodesMap = {
  [key: string]: TCodeSettings
}
