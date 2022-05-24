import axios from 'axios'
import {
  TConfig,
  ETransmission,
  EBodyTypeGroup,
  EEngineGroup,
  ESection,
  ECategory,
  EOutputType,
  EResponseStatus,
} from './interfaces'

const createCancelTokenSource = () => axios.CancelToken.source()

export enum EPreferences {
  AutomaticCoupeUsed = 'automatic.coupe.used',
}
const cfg = {
  [EPreferences.AutomaticCoupeUsed]: {
    displacement_from: 400,
    displacement_to: 2000,
    transmission: [ETransmission.AUTOMATIC],
    body_type_group: [EBodyTypeGroup.COUPE],
    engine_group: [EEngineGroup.GASOLINE],
    section: ESection.Used,
    category: ECategory.Cars,
    output_type: EOutputType.List,
    geo_radius: 200,
    geo_id: [213],
  },
}

class Singleton {
  private static instance: Singleton
  cancelTokenSource1: any
  axiosInstance: any

  private constructor() {
    this.cancelTokenSource1 = null
    this.axiosInstance = axios.create({
      baseURL: 'https://auto.ru',
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
      url: '/-/ajax/desktop/listing/',
      data: config,
      headers: {
        Referer:
          'https://auto.ru/cars/used/body-coupe/?displacement_from=200&displacement_to=2000&engine_group=GASOLINE&transmission=AUTOMATIC',
        Origin: 'https://auto.ru',
        Host: 'auto.ru',
        'User-Agent':
          'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:97.0) Gecko/20100101 Firefox/97.0',
        Accept: '*/*',
        'Accept-Language': 'ru-RU,ru;q=0.8,en-US;q=0.5,en;q=0.3',
        'Accept-Encoding': 'gzip, deflate, br',
        'x-client-date': '1647950180900',
        'x-csrf-token': '3bf9a44a67f69b6be676d07f8eea41884598cf9cd1e342ba',
        'x-requested-with': 'XMLHttpRequest',
        'x-retpath-y':
          'https://auto.ru/cars/used/body-coupe/?displacement_from=200&displacement_to=2000&engine_group=GASOLINE&transmission=AUTOMATIC',
        'content-type': 'application/json',
        // 'Content-Length': 222,
        'x-client-app-version': '925d953969b',
        'Proxy-Authorization': 'Basic amFjazppbnNlY3VyZQ==',
        'x-page-request-id': '1acc7f42c3ca9b95bee7f3ad65579bb1',
      },
      // mode: 'cors',
      cancelToken: this.cancelTokenSource1.token,
    })
      // .then((res: any) => res)
      .then(
        this.universalAxiosResponseHandler(({ data }) => {
          console.log(data)
          return data?.status === EResponseStatus.SUCCESS
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

    this.cancelTokenSource1 = null
    if (result.isOk) {
      return Promise.resolve(result.res.data)
    }
    return Promise.reject(this.getErrorMsg(result))
  }

  async getPrefs0(): Promise<any> {
    const data = await this.getOriginal(cfg[EPreferences.AutomaticCoupeUsed])
      .then((r) => r)
      .catch((msg) => msg)

    if (typeof data === 'string') return Promise.reject(data)
    return Promise.resolve(data)
  }
}

export const httpClient = Singleton.getInstance()
