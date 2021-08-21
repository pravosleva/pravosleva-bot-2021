import { TDocument, TUserId, TFileId, TPhotoData } from '../interfaces'

type TDocsMap = Map<TFileId, TDocument>
type TPhotosData = TPhotoData[]

/**
 * Класс Одиночка предоставляет метод getInstance, который позволяет клиентам
 * получить доступ к уникальному экземпляру одиночки.
 */
export class Singleton {
  private static instance: Singleton
  state: Map<TUserId, { docs?: TDocsMap; photos?: TPhotosData }>

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
    const oldData = this.state.get(userId)
    if (oldData) {
      this.state.set(userId, { ...oldData, docs: docsMap })
    } else {
      this.state.set(userId, { docs: docsMap })
    }

    // TODO: На каждом изменении нужно обновлять информацию на физических данных (база, файлб и т.д.)
  }
  // public updateUserPhotos(userId: TUserId, photos: TPhotosData) {
  //   const oldData = this.state.get(userId)
  //   if (oldData) {
  //     if (oldData.photos) {
  //       this.state.set(userId, { ...oldData, photos })
  //     } else {
  //       this.state.set(userId, { ...oldData, photos })
  //     }
  //   } else {
  //     this.state.set(userId, { photos })
  //   }

  //   // TODO: На каждом изменении нужно обновлять информацию на физических данных (база, файлб и т.д.)
  // }
  public addUserPhoto(userId: TUserId, photo: TPhotoData) {
    const oldData = this.state.get(userId)
    if (oldData) {
      if (oldData.photos) {
        this.state.set(userId, {
          ...oldData,
          photos: [...oldData.photos, [...photo]],
        })
      } else {
        this.state.set(userId, { ...oldData, photos: [photo] })
      }
    } else {
      this.state.set(userId, { photos: [photo] })
    }

    // TODO: На каждом изменении нужно обновлять информацию на физических данных (база, файлб и т.д.)
  }
  public getDocsMapByUserId(userId: TUserId): TDocsMap | null {
    return this.state.get(userId)?.docs || null
  }
  public deleteStateForUserId(userId: TUserId): void {
    this.state.delete(userId)
    // TODO: На каждом изменении нужно обновлять информацию на физических данных (база, файлб и т.д.)
  }
  public getStateAsJSON(): {
    [key: string]: { docs: TDocument[] }
  } {
    const state = {}

    this.state.forEach(({ docs, photos }, userId) => {
      state[String(userId)] = {}
      if (docs) {
        state[String(userId)].docs = []
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        docs.forEach((document, _fileId) => {
          state[String(userId)].docs.push(document)
        })
      }
      if (photos) {
        state[String(userId)].photos = photos
      }
    })

    return state
  }
}

export const globalStateMapInstance = Singleton.getInstance()
