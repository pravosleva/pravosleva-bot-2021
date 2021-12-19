import axios from 'axios'
import { EAPICode } from './types'

const isDev = process.env.NODE_ENV === 'development'

const createCancelTokenSource = () => axios.CancelToken.source()

class Singleton {
  private static instance: Singleton
  cancelTokenSource1: any
  axiosInstance: any

  private constructor() {
    this.cancelTokenSource1 = null
    this.axiosInstance = axios.create({
      baseURL: isDev
        ? 'http://localhost:5000/chat'
        : 'http://pravosleva.ru/express-helper/chat',
      // timeout: 1000,
      // headers: { 'X-Custom-Header': 'foobar' },
    })
  }
  public static getInstance(): Singleton {
    if (!Singleton.instance) Singleton.instance = new Singleton()

    return Singleton.instance
  }

  universalAxiosResponseHandler(validator) {
    return (axiosRes) => {
      if (!validator(axiosRes)) {
        throw new Error('Data is incorrect')
      }
      try {
        return { isOk: true, res: axiosRes.data }
      } catch (err) {
        throw new Error(err.message)
      }
    }
  }

  getErrorMsg(data: any) {
    return data?.message ? data?.message : 'Извините, что-то пошло не так'
  }

  async api({ url, data }: { url: string; data: any }): Promise<any> {
    if (this.cancelTokenSource1)
      this.cancelTokenSource1.cancel('axios request cancelled')

    const source = createCancelTokenSource()
    this.cancelTokenSource1 = source

    const result = await this.axiosInstance({
      method: 'POST',
      url: `/api${url}`,
      data,
      // mode: 'cors',
      cancelToken: this.cancelTokenSource1.token,
    })
      // .then((res: any) => res)
      .then(
        this.universalAxiosResponseHandler(({ data }) => {
          // console.log(data)
          return data?.ok === true || data?.ok === false // NOTE: API like smartprice
        })
      )
      .catch((err: any) => {
        if (axios.isCancel(err)) {
          console.log('Request canceled', err.message)
        } else {
          console.log(err)
        }
        return { isOk: false, message: err.message || 'No err.message' }
      })

    // console.log(result) // { isOk: true, res: { ok: true, _originalBody: { username: 'pravosleva', chatId: 432590698 } } }

    this.cancelTokenSource1 = null
    if (result.isOk) {
      return Promise.resolve(result.res)
    }
    return Promise.reject(this.getErrorMsg(result))
  }

  async createUser({
    username,
    chatId,
  }: {
    username: string
    chatId: number
  }): Promise<
    | {
        password: string
        ok: boolean
        message?: string
        code: EAPICode
      }
    | string
  > {
    const data = await this.api({
      url: '/create-user',
      data: { username, chatId },
    })
      .then((r) => r)
      .catch((msg) => msg)

    if (typeof data === 'string') return Promise.reject(data)
    return Promise.resolve(data)
  }

  async checkUser({
    username,
    chatId,
  }: {
    username: string
    chatId: number
  }): Promise<
    | {
        password: string
        ok: boolean
        message?: string
        code: EAPICode
        oldUsername?: string
      }
    | string
  > {
    const data = await this.api({
      url: '/check-user',
      data: { username, chatId },
    })
      .then((r) => r)
      .catch((msg) => msg)

    if (typeof data === 'string') return Promise.reject(data)
    return Promise.resolve(data)
  }
}

export const httpClient = Singleton.getInstance()
