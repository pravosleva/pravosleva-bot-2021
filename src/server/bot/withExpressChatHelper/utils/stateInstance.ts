/* eslint-disable prefer-destructuring */
/* eslint-disable no-shadow */
import { SceneContextMessageUpdate } from 'telegraf/typings/stage.d'

type TChatIdState = {
  passwordHash: string | null
  name: string | null
  signupLink: string | null
  firstToken?: string
  username: string | null
}
const initialUserState: TChatIdState = {
  passwordHash: null,
  name: null,
  signupLink: null,
  username: null,
}
type TChatId = number

export class Singleton {
  private static instance: Singleton
  state: Map<TChatId, TChatIdState>

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
  public getChatIdState(chatId: TChatId): TChatIdState | undefined {
    return this.state.get(chatId)
  }
  public deleteChatIdState(chatId: TChatId): void {
    this.state.delete(chatId)
    // TODO: На каждом изменении нужно обновлять информацию на физических данных (база, файл и т.д.)
  }
  public setEntryField(fieldName: string, ctx: SceneContextMessageUpdate) {
    const chatId: TChatId = ctx.message.from.id
    const oldChatIdState: TChatIdState | undefined = this.state.get(chatId)
    const newState = oldChatIdState
      ? { ...oldChatIdState, [fieldName]: ctx.message.text }
      : { ...initialUserState, [fieldName]: ctx.message.text }
    this.state.set(chatId, newState)
    // TODO: На каждом изменении нужно обновлять информацию на физических данных (база, файл и т.д.)
  }
  public setUserName({
    chatId,
    username,
  }: {
    chatId: number
    username: string
  }) {
    const oldChatIdState: TChatIdState | undefined = this.state.get(chatId)
    const newState = oldChatIdState
      ? {
          ...oldChatIdState,
          username,
        }
      : {
          ...initialUserState,
          username,
        }
    this.state.set(chatId, newState)
  }
}

export const stateInstance = Singleton.getInstance()
