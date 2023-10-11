/* eslint-disable prefer-destructuring */
/* eslint-disable no-shadow */
// import { SceneContextMessageUpdate } from 'telegraf/typings/stage.d'

import { proxyMap } from 'valtio/utils'

type TChatId = number
type TData = { targetParam: string; link?: string }

export const localStateInstance = proxyMap<TChatId, TData>()

export class Singleton {
  private static instance: Singleton
  state: Map<TChatId, TData>

  private constructor() {
    this.state = new Map()
    // TODO: При создании нужно брать информацию из физических данных (база, файл и т.д.)
  }
  public static getInstance(): Singleton {
    if (!Singleton.instance) Singleton.instance = new Singleton()

    return Singleton.instance
  }

  public keys() {
    return this.state.keys()
  }
  public set(key: number, value: TData) {
    this.state.set(key, value)
  }
  public get(key: number) {
    return this.state.get(key)
  }
  public delete(key: number) {
    return this.state.delete(key)
  }
  public has(key: number) {
    return this.state.has(key)
  }

  public get size(): number {
    return this.state.size
  }
  public getChatIdState(chatId: TChatId): TData | undefined {
    return this.state.get(chatId)
  }
  public deleteChatIdState(chatId: TChatId): void {
    this.state.delete(chatId)
  }
  // public setEntryField(fieldName: string, ctx: SceneContextMessageUpdate) {
  //   const chatId: TChatId = ctx.message.from.id
  //   const oldChatIdState: TChatIdState | undefined = this.state.get(chatId)
  //   const newState = oldChatIdState
  //     ? { ...oldChatIdState, [fieldName]: ctx.message.text }
  //     : { ...initialUserState, [fieldName]: ctx.message.text }
  //   this.state.set(chatId, newState)
  // }
}
