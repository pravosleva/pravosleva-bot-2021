import { isNumber } from '~/bot/utils/isNumber'

type TChatState = { counter: number; free: number }
type TFreeDispatchMap = Map<number, TChatState>
type TArgs = { defaultOddFree?: number }

export class FreeDispatcher {
  cacheMap: TFreeDispatchMap
  defaultOddFree: number
  botInstance: any
  static instance: FreeDispatcher
  constructor({ defaultOddFree }: TArgs) {
    this.defaultOddFree = defaultOddFree || 5
    this.cacheMap = new Map()
    this.botInstance = null
  }

  public static getInstance(ps: TArgs): FreeDispatcher {
    if (!FreeDispatcher.instance)
      FreeDispatcher.instance = new FreeDispatcher(ps)

    return FreeDispatcher.instance
  }

  init({ chat_id, oddFree }: { chat_id: number; oddFree?: number }): void {
    if (!this.cacheMap.has(chat_id))
      this.cacheMap.set(chat_id, {
        counter: 0,
        free:
          (!!oddFree || oddFree === 0) && isNumber(oddFree)
            ? oddFree
            : this.defaultOddFree,
      })
  }

  fix({ chat_id }: { chat_id: number }): void {
    const item = this.cacheMap.get(chat_id)
    if (item) {
      this.cacheMap.set(chat_id, {
        ...item,
        counter: item.counter + 1,
      })
    }
  }

  isAllowed({ chat_id }: { chat_id: number }): boolean {
    let result = false
    const item = this.cacheMap.get(chat_id)

    try {
      if (!!item && item.counter % item.free !== 0) {
        result = true
      }
    } catch (err) {
      console.log(err)
    }

    return result
  }

  getChatState({ chat_id }: { chat_id: number }): TChatState {
    return this.cacheMap.get(chat_id) || null
  }

  setOddFree({ chat_id, value }: { chat_id: number; value?: number }): void {
    const chatState = this.cacheMap.get(chat_id)
    if (chatState) {
      const newState = { ...chatState }
      if ((!!value || value === 0) && isNumber(value)) newState.free = value
      this.cacheMap.set(chat_id, newState)
    }
  }

  setBotInstance(bot: any): void {
    if (!this.botInstance) this.botInstance = bot
  }
}

// NOTE: Менеджер частоты доставки
// (без таймера, только учет количества + допустимое количество возможных сообщений вне очереди)
export const freeDispatcher = new FreeDispatcher({
  // -- // NOTE: x сообщений будут доставлены, независимо от временной задержки, остальные - после нее
  defaultOddFree: 15,
  // --
})
