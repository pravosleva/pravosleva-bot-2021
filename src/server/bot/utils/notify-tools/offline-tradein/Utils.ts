/* eslint-disable @typescript-eslint/no-unused-vars */
import { getTimeAgo } from '../../getTimeAgo'
import { TQueueState } from './interfaces'

const commonHeader = 'SP Offline Trade-In notifier'

export class Utils {
  req: any
  constructor({ req }) {
    this.req = req
  }
  get notifyCodes() {
    return {
      upload_err: {
        symbol: '⛔',
        // descr: 'Ошибка загрузки файла',
        doNotify: true,
      },
      upload_ok: {
        symbol: '✅',
        // descr: 'Все файлы загруженны',
        doNotify: true,
        // NOTE: Отправка требуется только для последнего фото
        validate: (rowValues: any[]): boolean => rowValues[4] === rowValues[8],
      },
      user_report: {
        symbol: 'ℹ️',
        // descr: 'Пользователь сообщил об ошибке',
        doNotify: true,
      },
      tradein_id_entered: {
        symbol: '⌨️',
        // descr: 'Пользователь ввел tradein_id',
        doNotify: false,
      },
    }
  }
  getMD() {
    const { rowValues } = this.req.body
    const [
      _a,
      _b,
      eventCode,
      _d,
      curFileCounter,
      tradeinId,
      additionalInfo,
      partnerName,
      totalFilesLeftCounter,
      _j,
      _k,
      _l,
      originalServerResponseStr,
    ] = rowValues
    let result = ''

    const getBackResponseMD = (jsonStr) => {
      if (!jsonStr) return ''

      let res = ''
      let _modifiedJSON
      try {
        _modifiedJSON = JSON.parse(jsonStr)
      } catch (err) {
        console.log(err)
      }

      if (_modifiedJSON)
        res += `\n\`\`\`\n${
          _modifiedJSON ? JSON.stringify(_modifiedJSON, null, 2) : jsonStr
        }\n\`\`\``

      return res
    }
    const jsonFromBack = getBackResponseMD(originalServerResponseStr)

    result += `*${commonHeader}${
      this.req.body.resultId ? ` | #${this.req.body.resultId}` : ''
    } ${partnerName} ${tradeinId || '?'}*\n\n${
      this.notifyCodes[eventCode].symbol
    } \`${eventCode} (${curFileCounter} of ${totalFilesLeftCounter})\`${
      additionalInfo ? `\n\n${additionalInfo}` : ''
    }${jsonFromBack ? `\n${jsonFromBack}` : ''}`

    return result
  }
  get isNotifUselessness() {
    return (
      !this.req.body.rowValues[2] ||
      !this.notifyCodes[this.req.body.rowValues[2]] ||
      !this.notifyCodes[this.req.body.rowValues[2]].doNotify ||
      (!!this.notifyCodes[this.req.body.rowValues[2]].validate &&
        !this.notifyCodes[this.req.body.rowValues[2]].validate(
          this.req.body.rowValues
        ))
    )
  }
  getSingleMessageMD({ queueState }: { queueState: TQueueState }) {
    const header = `${commonHeader} | ${queueState.ids.length} events`
    const msgsObj: {
      [key: string]: {
        counter: number
        msg: string
        partners: Set<string>
        fromIndex: number
        lastIndex: number
        firstDate: Date
        lastDate: Date
      }
    } = {}
    let res = ''
    const contragents = new Set()

    for (let i = 0, max = queueState.ids.length; i < max; i++) {
      const rowValues = queueState.rows[i]
      const firstDate = new Date(queueState.tss[i])
      const lastDate = new Date(queueState.tss[i])
      const eventCode = rowValues[2]
      const fromIndex = queueState.ids[i]
      const lastIndex = queueState.ids[i]
      const partnerName = rowValues[7]
      contragents.add(partnerName)
      const partners = msgsObj[eventCode]?.partners || new Set()
      partners.add(partnerName)

      if (!msgsObj[eventCode])
        msgsObj[eventCode] = {
          counter: 1,
          msg: `${eventCode}`, // NOTE: Universal message for all items! // index from #${fromIndex}
          partners,
          fromIndex,
          lastIndex,
          firstDate,
          lastDate,
        }
      else {
        msgsObj[eventCode].counter += 1
        if (fromIndex < msgsObj[eventCode].fromIndex)
          msgsObj[eventCode].fromIndex = fromIndex

        if (lastIndex > msgsObj[eventCode].lastIndex)
          msgsObj[eventCode].lastIndex = lastIndex

        if (msgsObj[eventCode].firstDate > firstDate)
          msgsObj[eventCode].firstDate = firstDate

        if (msgsObj[eventCode].lastDate < lastDate)
          msgsObj[eventCode].lastDate = lastDate
      }
    }

    if (Object.keys(msgsObj).length > 0) {
      res += Object.keys(msgsObj)
        .map(
          (key) =>
            `\`${this.notifyCodes[key].symbol} (${msgsObj[key].counter}) ${
              msgsObj[key].msg
            } | ${Array.from(msgsObj[key].partners).join(', ')}\`\n\n\`#${
              msgsObj[key].fromIndex
            }\` - first table index - ${getTimeAgo(
              msgsObj[key].firstDate
            )}\n\`#${
              msgsObj[key].lastIndex
            }\` - last table index - ${getTimeAgo(msgsObj[key].lastDate)}`
        )
        .join('\n\n')
    }

    // const contragentsArr = Array.from(contragents)
    // if (contragentsArr.length > 0) header += ` | ${contragentsArr.join(', ')}`

    return `*${header}*\n\n${res}\n\n[Full SmartPrice report](https://docs.google.com/spreadsheets/d/1NBXuyGlCznS0SJjJJX52vR3ZzqPAPM8LQPM_GX8T_Wc/edit#gid=36671662)`
  }
}
