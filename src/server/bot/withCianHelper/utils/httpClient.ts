import axios from 'axios'
import { TConfig } from './interfaces'

const createCancelTokenSource = () => axios.CancelToken.source()

enum EMetro {
  Chertanovo = 147,
  Tsaritsino = 144,
}

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

    const cookies = {
      __cf_bm:
        'rn3fKnrdgEQ_vBQ0pebvtcOSNkK.o8NclQ5u6zou_ak-1654121042-0-Aax+wbfELcW10JxWYkxNFSicOZ3js38st851DIlOKt+7MOwX/BCTwf0Hm8ZfHgdQ91XdTB8VQHMgI5e0uZURhwo=',
      _CIAN_GK: '316a20b3-3f62-46d1-92d2-6f56c4483e75',
      adb: '1',
      cf_clearance:
        'liDoP.7sTzaV89HB7TnbUUqYLvkDNi2vDEPFFJEsXbM-1652197357-0-150',
      cookie_agreement_accepted: '1',
      login_mro_popup: '1',
      serp_registration_trigger_popup: '1',
      session_main_town_region_id: '1',
      session_region_id: '1',
      sopr_session: '508f3fd646f54ffd',
      sopr_utm: '{"utm_source":+"google",+"utm_medium":+"organic"}',
    }
    // let cookiesAsString = ''
    // for (const key in cookies) cookiesAsString += `${key}=${cookies[key]}; `
    // const cookiesAsString = Object.keys(cookies).reduce((acc, key) => {
    //   // Do anything...
    //   return acc
    // }, '')
    const headers = {
      'User-Agent':
        'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:100.0) Gecko/20100101 Firefox/100.0',
      Referer: 'https://www.cian.ru/',
      Pragma: 'no-cache',
      Origin: 'https://www.cian.ru',
      'Sec-Fetch-Dest': 'empty',
      'Sec-Fetch-Mode': 'cors',
      'Sec-Fetch-Site': 'same-site',
      Host: 'api.cian.ru',
      'Alt-Used': 'api.cian.ru',
      'Cache-Control': 'no-cache',
    }
    const result = await this.axiosInstance({
      method: 'POST',
      url: '/search-offers/v2/search-offers-desktop/',
      data: config,
      // mode: 'cors',
      cookies,
      headers,
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

    this.cancelTokenSource1 = null
    if (result.isOk) {
      return Promise.resolve(result.res.data)
    }
    return Promise.reject(this.getErrorMsg(result))
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
        geo: {
          type: 'geo',
          value: [{ type: 'underground', id: EMetro.Chertanovo }],
        },
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
        geo: {
          type: 'geo',
          value: [{ type: 'underground', id: EMetro.Chertanovo }],
        },
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
        geo: {
          type: 'geo',
          value: [{ type: 'underground', id: EMetro.Tsaritsino }],
        },
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
        geo: {
          type: 'geo',
          value: [{ type: 'underground', id: EMetro.Tsaritsino }],
        },
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
