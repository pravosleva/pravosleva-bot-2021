type TChatState = { counter: number; free: number }
type TFreeDispatchMap = Map<number, TChatState>

export class FreeDispatcher {
  cacheMap: TFreeDispatchMap
  defaultOddFree: number
  constructor({ defaultOddFree }) {
    this.defaultOddFree = defaultOddFree || 5
    this.cacheMap = new Map()
  }

  init({ chat_id, oddFree }: { chat_id: number; oddFree?: number }): void {
    if (!this.cacheMap.has(chat_id))
      this.cacheMap.set(chat_id, {
        counter: 0,
        free: oddFree || this.defaultOddFree,
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
}
