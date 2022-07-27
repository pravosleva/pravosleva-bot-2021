/* eslint-disable @typescript-eslint/no-unused-vars */
import axios from 'axios'
import { EAPIUserCode } from '~/bot/withExpressChatHelper/utils/types'

const isDev = process.env.NODE_ENV === 'development'

const createCancelTokenSource = () => axios.CancelToken.source()
const promisifyData = (data: any) => {
  if (typeof data === 'string') return Promise.reject(data)
  return Promise.resolve(data)
}

class Singleton {
  private static instance: Singleton
  cancelTokenSource1: any
  axiosInstance: any

  private constructor() {
    this.cancelTokenSource1 = null
    this.axiosInstance = axios.create({
      baseURL: isDev
        ? 'http://localhost:5000/pravosleva-bot-2021'
        : 'http://pravosleva.ru/express-helper/pravosleva-bot-2021',
      // timeout: 1000,
      // headers: { 'X-Custom-Header': 'foobar' },
      validateStatus: (_s: number) => true,
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

  async api({
    url,
    data,
    method,
  }: {
    url: string
    data?: any
    method?: 'GET' | 'POST'
  }): Promise<any> {
    if (this.cancelTokenSource1)
      this.cancelTokenSource1.cancel('axios request cancelled')

    const source = createCancelTokenSource()
    this.cancelTokenSource1 = source
    const opts: any = {
      url: `/autopark-2022${url}`,
      method: method || 'POST',
      // mode: 'cors',
      cancelToken: this.cancelTokenSource1.token,
    }

    if (data) opts.data = data

    const result = await this.axiosInstance(opts)
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

  async addUser({
    tg: { chat_id },
  }: {
    tg: {
      chat_id: number
    }
  }): Promise<
    | {
        ok: boolean
        message?: string
        code: EAPIUserCode
      }
    | string
  > {
    const data = await this.api({
      url: '/add-user',
      data: { tg: { chat_id } },
    })
      .then((r) => r)
      .catch((msg) => msg)

    return promisifyData(data)
  }

  async checkUser({ chat_id }: { chat_id: number }): Promise<
    | {
        ok: boolean
        message?: string
        code: EAPIUserCode
        password: number
      }
    | string
  > {
    // console.log(chat_id)
    const data = await this.api({
      url: '/check-user?p=1',
      data: { tg: { chat_id } },
    })
      .then((r) => r)
      .catch((msg) => msg)

    return promisifyData(data)
  }

  async getUserProjects({ chat_id }: { chat_id: number }): Promise<
    | {
        ok: boolean
        message?: string
        code: EAPIUserCode
        projects: {
          name: string
          description: string
          items: any[]
        }[]
      }
    | string
  > {
    // console.log(chat_id)
    const data = await this.api({
      url: '/get-user-projects',
      data: { tg: { chat_id } },
    })
      .then((r) => r)
      .catch((msg) => msg)

    return promisifyData(data)
  }

  async getProjectReport({
    chat_id,
    project_id,
    current_mileage,
  }: {
    chat_id: number
    project_id: string
    current_mileage: number
  }): Promise<
    | {
        ok: boolean
        message?: string
        // code: EAPIUserCode
        report: any[]
      }
    | string
  > {
    // console.log(chat_id)
    const data = await this.api({
      url: '/project/get-report',
      data: {
        chat_id,
        project_id,
        current_mileage,
      },
    })
      .then((r) => r)
      .catch((msg) => msg)

    return promisifyData(data)
  }
}

export const httpClient = Singleton.getInstance()
