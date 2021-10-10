/* eslint-disable prefer-destructuring */
/* eslint-disable no-shadow */
import axios from 'axios'
import { SceneContextMessageUpdate } from 'telegraf/typings/stage.d'
import { IUserState, TUserId, TFile, TContact, TPhotoItem } from './interfaces'

const API_FEEDBACK_TARGET =
  process.env.API_FEEDBACK_TARGET ||
  'http://pravosleva.ru/express-helper/pravosleva-bot-2021/add-entry'
const TELEGRAM_DOCS_SHADOW_API =
  process.env.TELEGRAM_DOCS_SHADOW_API || 'http://pravosleva.ru/tg-bot-2021'

const initialUserState: IUserState = {
  files: {},
  entryData: {},
}

enum EEntryField {
  Company = 'company',
  Position = 'position',
  Contact = 'contact',
  Feedback = 'feedback',
}
enum EFileCode {
  Document = 'document',
  Photo = 'photo',
}
const getNormalizedObj = async (
  ctx: SceneContextMessageUpdate,
  fileCode: EFileCode
): Promise<TFile> => {
  const result: any = {}
  let photo: any
  let originalPhoto: TPhotoItem
  // let tgFileUrl: string
  // let fileName: string
  // let ext: string

  switch (fileCode) {
    case EFileCode.Document:
      if (ctx.message.document) {
        result.fileUrl = `${TELEGRAM_DOCS_SHADOW_API}/get-shadow/document/${ctx.message.document.file_id}`
        // result.file_id = ctx.message.document.file_id
      }

      break
    case EFileCode.Photo:
      photo = ctx.message.photo
      // eslint-disable-next-line prefer-destructuring
      originalPhoto = photo.reverse()[0]

      if (originalPhoto) {
        // tgFileUrl = await ctx.telegram.getFileLink(originalPhoto.file_id)
        // fileName = tgFileUrl.split('/').reverse()[0]
        // ext = fileName.split('.').reverse()[0]

        result.fileUrl = `${TELEGRAM_DOCS_SHADOW_API}/get-shadow/document/${originalPhoto.file_id}`
        // result.file_id = originalPhoto.file_id

        // if (ext) {
        //   result.ext = ext
        //   result.fileUrl += `?ext=${ext}`
        // }
      }
      break
    default:
      break
  }

  return Promise.resolve(result)
}

export class Singleton {
  private static instance: Singleton
  state: Map<TUserId, IUserState>

  private constructor() {
    this.state = new Map()
    // TODO: При создании нужно брать информацию из физических данных (база, файл и т.д.)
  }
  public static getInstance(): Singleton {
    if (!Singleton.instance) Singleton.instance = new Singleton()

    return Singleton.instance
  }

  public get size(): number {
    return this.state.size
  }
  public get keys(): number[] {
    return Array.from(this.state.keys())
  }
  public getUserState(userId: TUserId): IUserState | undefined {
    return this.state.get(userId)
  }
  public deleteUserState(userId: TUserId): void {
    this.state.delete(userId)
    // TODO: На каждом изменении нужно обновлять информацию на физических данных (база, файл и т.д.)
  }
  // https://t.me/botoid/645541
  private addFile(
    ctx: SceneContextMessageUpdate,
    normalizedObject: TFile
  ): void {
    const userId: TUserId = ctx.message.from.id
    const oldUserState: IUserState | undefined = this.state.get(userId)
    const newState = oldUserState || initialUserState

    newState.files[normalizedObject.fileUrl] = normalizedObject
    this.state.set(userId, newState)

    // TODO: На каждом изменении нужно обновлять информацию на физических данных (база, файл и т.д.)
  }
  public async addPhoto(ctx: SceneContextMessageUpdate): Promise<any> {
    const normalizedObj = await getNormalizedObj(ctx, EFileCode.Photo)

    this.addFile(ctx, normalizedObj)
    return Promise.resolve()
  }
  public async addDocument(ctx: SceneContextMessageUpdate): Promise<any> {
    const normalizedObj = await getNormalizedObj(ctx, EFileCode.Document)

    this.addFile(ctx, normalizedObj)
    return Promise.resolve()
  }
  private setEntryField(
    ctx: SceneContextMessageUpdate,
    value: string | TContact,
    entryFieldCode: EEntryField
  ) {
    const userId: TUserId = ctx.message.from.id
    const oldUserState: IUserState | undefined = this.state.get(userId)
    const newState = oldUserState
      ? { ...oldUserState, files: {} }
      : {
          ...initialUserState,
          entryData: { ...initialUserState.entryData, contact: null },
        }
    switch (entryFieldCode) {
      case EEntryField.Company:
      case EEntryField.Position:
      case EEntryField.Feedback:
        // @ts-ignore
        newState.entryData[entryFieldCode] = value
        newState.entryData.contact = null
        break
      case EEntryField.Contact:
        // @ts-ignore
        newState.entryData[entryFieldCode] = value
        break
      default:
        break
    }

    this.state.set(userId, newState)
    // TODO: На каждом изменении нужно обновлять информацию на физических данных (база, файл и т.д.)
  }
  public setCompany(ctx: SceneContextMessageUpdate, value: string) {
    this.setEntryField(ctx, value, EEntryField.Company)
  }
  public setPosition(ctx: SceneContextMessageUpdate, value: string) {
    this.setEntryField(ctx, value, EEntryField.Position)
  }
  public setFeedback(ctx: SceneContextMessageUpdate, value: string) {
    this.setEntryField(ctx, value, EEntryField.Feedback)
  }
  public setContact(ctx: SceneContextMessageUpdate, value: TContact | string) {
    this.setEntryField(ctx, value, EEntryField.Contact)
  }

  private hasEntryFieldNotEmpty(
    ctx: SceneContextMessageUpdate,
    entryFieldCode: EEntryField
  ) {
    const userId: TUserId = ctx.message.from.id
    const userData = this.state.get(userId)

    if (!userData) return false
    return !!userData.entryData[entryFieldCode]
  }
  public hasCompany(ctx: SceneContextMessageUpdate) {
    return this.hasEntryFieldNotEmpty(ctx, EEntryField.Company)
  }
  public hasPosition(ctx: SceneContextMessageUpdate) {
    return this.hasEntryFieldNotEmpty(ctx, EEntryField.Position)
  }
  public hasContact(ctx: SceneContextMessageUpdate) {
    return this.hasEntryFieldNotEmpty(ctx, EEntryField.Contact)
  }
  public hasFeedback(ctx: SceneContextMessageUpdate) {
    return this.hasEntryFieldNotEmpty(ctx, EEntryField.Feedback)
  }

  public clearUserState(ctx: SceneContextMessageUpdate) {
    const userId: TUserId = ctx.message.from.id

    this.state.delete(userId)
  }

  public sendEntryByCallbackQuery(ctx: SceneContextMessageUpdate) {
    const userId: TUserId = ctx.update.callback_query.from.id
    const myState = this.state.get(userId)

    if (myState) {
      axios.post(API_FEEDBACK_TARGET, { userState: myState })
    }
  }
}

export const globalStateMapInstance = Singleton.getInstance()
