/* eslint-disable @typescript-eslint/no-unused-vars */
import { TModifiedRequest } from '~/bot/utils/interfaces'
import { TQueueState } from './interfaces'

enum EEventCodes {
  UPLOAD_ERR = 'upload_err',
  UPLOAD_OK = 'upload_ok',
  USER_REPORT = 'user_report',
  TRDEIN_ID_ENTERED = 'tradein_id_entered',
}

type TNotifyCodesMap = {
  [key in EEventCodes]: {
    symbol: string
    descr: string
    doNotify: boolean
    validate?: (rowValues: any[]) => boolean
  }
}

export class Utils {
  req: TModifiedRequest
  constructor({ req }) {
    this.req = req
  }
  get notifyCodes(): TNotifyCodesMap {
    return {
      [EEventCodes.UPLOAD_ERR]: {
        symbol: '⛔',
        descr: 'Ошибка загрузки файла',
        doNotify: true,
      },
      [EEventCodes.UPLOAD_OK]: {
        symbol: '✅',
        descr: 'Все файлы загружены',
        doNotify: true,
        // NOTE: Отправка требуется только для последнего фото
        validate: (rowValues: any[]): boolean => rowValues[4] === rowValues[8],
      },
      [EEventCodes.USER_REPORT]: {
        symbol: 'ℹ️',
        descr: 'Пользователь сообщил об ошибке',
        doNotify: true,
      },
      [EEventCodes.TRDEIN_ID_ENTERED]: {
        symbol: '⌨️',
        descr: 'Пользователь ввел tradein_id',
        doNotify: false,
      },
    }
  }
  getSingleMessageMD() {
    try {
      throw new Error('method getSingleMessageMD should be unitialized')
    } catch (err) {
      console.log(err)
    }
    return 'ERR'
  }

  get isNotifUselessness() {
    try {
      throw new Error('getter isNotifUselessness should be unitialized')
    } catch (err) {
      console.log(err)
    }
    return true
  }

  getGeneralizedCommonMessageMD(_ps: { queueState: TQueueState }) {
    try {
      throw new Error(
        'method getGeneralizedCommonMessageMD should be unitialized'
      )
    } catch (err) {
      console.log(err)
    }
    return 'ERR'
  }
}
