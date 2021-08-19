import { TDocument } from '../interfaces'

type TUserId = number
type TFileId = string
type TDocsMap = Map<TFileId, TDocument>[]

/**
 * Класс Одиночка предоставляет метод getInstance, который позволяет клиентам
 * получить доступ к уникальному экземпляру одиночки.
 */
export class Singleton {
  private static instance: Singleton
  state: Map<TUserId, { docs: TDocsMap }>

  /**
   * Конструктор Одиночки всегда должен быть скрытым, чтобы предотвратить
   * создание объекта через оператор new.
   */
  private constructor() {
    this.state = new Map()
    // TODO: При создании нужно брать информацию из физических данных (база, файлб и т.д.)
  }

  /**
   * Статический метод, управляющий доступом к экземпляру одиночки.
   *
   * Эта реализация позволяет вам расширять класс Одиночки, сохраняя повсюду
   * только один экземпляр каждого подкласса.
   */
  public static getInstance(): Singleton {
    if (!Singleton.instance) Singleton.instance = new Singleton()

    return Singleton.instance
  }

  /**
   * Наконец, любой одиночка должен содержать некоторую бизнес-логику, которая
   * может быть выполнена на его экземпляре.
   */
  public updateUserDocsMap(userId: TUserId, docsMap: TDocsMap) {
    this.state.set(userId, { docs: docsMap })
    // TODO: На каждом изменении нужно обновлять информацию на физических данных (база, файлб и т.д.)
  }
  public getDocsMapByUserId(userId: TUserId): TDocsMap | null {
    return this.state.get(userId)?.docs || null
  }
  public deleteStateForUserId(userId: TUserId): void {
    this.state.delete(userId)
    // TODO: На каждом изменении нужно обновлять информацию на физических данных (база, файлб и т.д.)
  }
  public getStateAsJSON() {
    const state = {}

    this.state.forEach(({ docs }, userId) => {
      state[String(userId)] = {
        docs: [],
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      docs.forEach((document, _fileId) => {
        state[String(userId)].docs.push(document)
      })
    })

    return state
  }
}

export const globalStateMapInstance = Singleton.getInstance()
