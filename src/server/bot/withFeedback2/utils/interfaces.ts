export type TContact = {
  phone_number: string
  first_name?: string
  last_name?: string
}
export type TUserId = number
export type TFileId = string
export type TFile = {
  fileUrl: string
  // file_id: string
  caption?: string
}
export interface IUserState {
  files?: {
    [key: string]: TFile
  }
  entryData: {
    company?: string
    position?: string
    feedback?: string
    contact?: TContact | string
  }
}

export type TPhotoItem = {
  file_id: string // "AgACAgIAAxkBAAILO2Eg0HeSyc4LrC_3N9lKcdsK9vMAAx-3MRviaAFJgtKcL2rc6e4BAAMCAANzAAMgBA",
  file_unique_id: string // "AQADH7cxG-JoAUl4",
  file_size: number // 1114,
  width: number // 90,
  height: number // 51
}
export type TPhoto = TPhotoItem[]
