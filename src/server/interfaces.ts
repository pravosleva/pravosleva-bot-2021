export type TDocument = {
  file_name: string // "cs_icon.png",
  mime_type: string // "image/png",
  thumb: {
    file_id: string // "AAMCAgADGQEAAgYPYR4e9bDZxIKkgjn43LyXuEU72c4AAtUQAAKpQ_BIKIuZTj7FNpYBAAdtAAMgBA",
    file_unique_id: string // "AQAD1RAAAqlD8Ehy",
    file_size: number // 15296,
    width: number // 320,
    height: number // 320
  }
  file_id: string // "BQACAgIAAxkBAAIGD2EeHvWw2cSCpII5-Ny8l7hFO9nOAALVEAACqUPwSCiLmU4-xTaWIAQ",
  file_unique_id: string // "AgAD1RAAAqlD8Eg",
  file_size: number // 55712

  // Special for additional service:
  _specialTGFileName: string
  _specialFileUrl: string
}
// export type TAudio = {
//   duration: 270,
//   file_name: "limp-bizkit-pollution-demo_(tetamix.org).mp3",
//   mime_type: "audio/mpeg",
//   title: "Pollution \\(Demo\\)",
//   performer: "Limp Bizkit",
//   file_id: "CQACAgIAAxkBAAIGEmEeH5GGYajNh0EkP7NCCI4JKrIcAALYEAACqUPwSG-M50LoyaH3IAQ",
//   file_unique_id: "AgAD2BAAAqlD8Eg",
//   file_size: 3783697
// }
export type TContact = {
  phone_number: string
  first_name?: string
  last_name?: string
}
export type TUserId = number
export type TFileId = string
