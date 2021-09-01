import axios from 'axios'
import { TConfig } from './interfaces'

const createCancelTokenSource = () => axios.CancelToken.source()

class Singleton {
  private static instance: Singleton
  cancelTokenSource1: any
  axiosInstance: any

  private constructor() {
    this.cancelTokenSource1 = null
    this.axiosInstance = axios.create({
      baseURL: 'https://api.cian.ru',
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

  async getOriginal(config: TConfig): Promise<any> {
    if (this.cancelTokenSource1)
      this.cancelTokenSource1.cancel('axios request cancelled')

    const source = createCancelTokenSource()
    this.cancelTokenSource1 = source

    const result = await this.axiosInstance({
      method: 'POST',
      url: '/search-offers/v2/search-offers-desktop/',
      data: config,
      // mode: 'cors',
      cancelToken: this.cancelTokenSource1.token,
    })
      // .then((res: any) => res)
      .then(
        this.universalAxiosResponseHandler(({ data }) => data?.status === 'ok')
      )
      .catch((err: any) => {
        if (axios.isCancel(err)) {
          console.log('Request canceled', err.message)
        } else {
          console.log(err)
        }
        return { isOk: false, message: err.message || 'No err.message' }
      })

    // console.log(result.res.data)

    this.cancelTokenSource1 = null
    if (result.isOk) {
      return Promise.resolve(result.res.data)
    }
    return Promise.reject(this.getErrorMsg(result.res))
  }

  async getFlatrentChertanovo1Room30K30K(): Promise<any> {
    const data = await this.getOriginal({
      jsonQuery: {
        _type: 'flatrent',
        room: { type: 'terms', value: [1] },
        price: { type: 'range', value: { gte: 30000, lte: 30000 } },
        engine_version: { type: 'term', value: 2 },
        currency: { type: 'term', value: 2 },
        region: { type: 'terms', value: [1] },
        for_day: { type: 'term', value: '!1' },
        only_foot: { type: 'term', value: '2' },
        foot_min: { type: 'range', value: { lte: 15 } },
        geo: { type: 'geo', value: [{ type: 'underground', id: 147 }] },
        has_fridge: { type: 'term', value: true },
        has_washer: { type: 'term', value: true },
      },
    })
      .then((r) => r)
      .catch((msg) => msg)

    if (typeof data === 'string') return Promise.reject(data)
    return Promise.resolve(data)
  }
  async getFlatrentChertanovo1Room30K35K(): Promise<any> {
    const data = await this.getOriginal({
      jsonQuery: {
        _type: 'flatrent',
        room: { type: 'terms', value: [1] },
        price: { type: 'range', value: { gte: 30000, lte: 35000 } },
        engine_version: { type: 'term', value: 2 },
        currency: { type: 'term', value: 2 },
        region: { type: 'terms', value: [1] },
        for_day: { type: 'term', value: '!1' },
        only_foot: { type: 'term', value: '2' },
        foot_min: { type: 'range', value: { lte: 15 } },
        geo: { type: 'geo', value: [{ type: 'underground', id: 147 }] },
      },
    })
      .then((r) => r)
      .catch((msg) => msg)

    if (typeof data === 'string') return Promise.reject(data)
    return Promise.resolve(data)
  }

  async getFlatrentTsaritsino1Room30K30K(): Promise<any> {
    const data = await this.getOriginal({
      jsonQuery: {
        _type: 'flatrent',
        room: { type: 'terms', value: [1] },
        price: { type: 'range', value: { gte: 30000, lte: 30000 } },
        engine_version: { type: 'term', value: 2 },
        currency: { type: 'term', value: 2 },
        region: { type: 'terms', value: [1] },
        for_day: { type: 'term', value: '!1' },
        only_foot: { type: 'term', value: '2' },
        foot_min: { type: 'range', value: { lte: 15 } },
        geo: { type: 'geo', value: [{ type: 'underground', id: 144 }] },
        has_fridge: { type: 'term', value: true },
        has_washer: { type: 'term', value: true },
      },
    })
      .then((r) => r)
      .catch((msg) => msg)

    if (typeof data === 'string') return Promise.reject(data)
    return Promise.resolve(data)
  }
  async getFlatrentTsaritsino1Room30K35K(): Promise<any> {
    const data = await this.getOriginal({
      jsonQuery: {
        _type: 'flatrent',
        room: { type: 'terms', value: [1] },
        price: { type: 'range', value: { gte: 30000, lte: 35000 } },
        engine_version: { type: 'term', value: 2 },
        currency: { type: 'term', value: 2 },
        region: { type: 'terms', value: [1] },
        for_day: { type: 'term', value: '!1' },
        only_foot: { type: 'term', value: '2' },
        foot_min: { type: 'range', value: { lte: 15 } },
        geo: { type: 'geo', value: [{ type: 'underground', id: 144 }] },
        has_fridge: { type: 'term', value: true },
        has_washer: { type: 'term', value: true },
      },
    })
      .then((r) => r)
      .catch((msg) => msg)

    if (typeof data === 'string') return Promise.reject(data)
    return Promise.resolve(data)
  }
}

export const httpClient = Singleton.getInstance()
