import axios from 'axios'
// import { EAPIUserCode, EAPIRoomCode } from './types'
import { ENotifNamespace } from '~/express-tools/routers/notify.smartprice/run-extra'

// const isDev = process.env.NODE_ENV === 'development'

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
      // baseURL: isDev
      //   ? 'http://localhost:5000/sp/report/v2'
      //   : 'http://pravosleva.ru/express-helper/sp/report/v2',
      baseURL: 'http://pravosleva.ru/express-helper/sp/report/v2',
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
      url,
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

  async runExtraNotifs({
    chat_id,
    namespace,
  }: {
    chat_id: number
    namespace: ENotifNamespace
  }): Promise<
    | {
        ok: boolean
        state?: { [key: string]: any }
        message?: string
      }
    | string
  > {
    const data = await this.api({
      url: '/run-tg-extra-notifs',
      method: 'POST',
      data: { namespace, chat_id }, // 'offline-tradein/upload-wizard'
    })
      .then((r) => r)
      .catch((msg) => msg)

    return promisifyData(data)
  }

  async getOfflineTradeinUploadWizardAnalysis({
    tradeinId,
  }: {
    tradeinId: string
  }): Promise<
    | {
        ok: boolean
        state?: { [key: string]: any }
        message?: string
      }
    | string
  > {
    const data = await this.api({
      url: '/offline-tradein/upload-wizard/get-timing-analysis',
      method: 'POST',
      data: { tradeinId },
    })
      .then((r) => r)
      .catch((msg) => msg)

    return promisifyData(data)
  }
}

export const httpClient = Singleton.getInstance()
