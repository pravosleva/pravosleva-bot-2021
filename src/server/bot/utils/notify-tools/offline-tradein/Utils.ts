/* eslint-disable @typescript-eslint/no-unused-vars */
import { TQueueState } from './interfaces'

export class Utils {
  req: any
  constructor({ req }) {
    this.req = req
  }
  get notifyCodes() {
    return {
      upload_err: {
        symbol: '⛔',
        doNotify: true,
      },
      upload_ok: {
        symbol: '✅',
        doNotify: true,
        // NOTE: Отправка требуется только для последнего фото
        validate: (rowValues: any[]): boolean => rowValues[4] === rowValues[8],
      },
      user_report: {
        symbol: 'ℹ️',
        doNotify: true,
      },
      tradein_id_entered: {
        symbol: '⌨️',
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

    result += `*SP notify${
      this.req.body.resultId ? ` #${this.req.body.resultId}` : ''
    } | ${partnerName} ${tradeinId || '?'}*\n\n${
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
    const header = `SP notify (${queueState.ids.length} events)`
    const msgsObj: {
      [key: string]: {
        counter: number
        msg: string
        partners: Set<string>
        fromIndex: number
      }
    } = {}
    let res = ''
    const contragents = new Set()

    for (let i = 0, max = queueState.ids.length; i < max; i++) {
      const rowValues = queueState.rows[i]
      const eventCode = rowValues[2]
      const fromIndex = queueState.ids[i]
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
        }
      else {
        msgsObj[eventCode].counter += 1
        if (fromIndex < msgsObj[eventCode].fromIndex)
          msgsObj[eventCode].fromIndex = fromIndex
      }
    }

    if (Object.keys(msgsObj).length > 0) {
      res += Object.keys(msgsObj)
        .map(
          (key) =>
            `\`${this.notifyCodes[key].symbol} (${msgsObj[key].counter}) ${
              msgsObj[key].msg
            } | ${Array.from(msgsObj[key].partners).join(', ')} | down from #${
              msgsObj[key].fromIndex
            }\``
        )
        .join('\n\n')
    }

    // const contragentsArr = Array.from(contragents)
    // if (contragentsArr.length > 0) header += ` | ${contragentsArr.join(', ')}`

    return `*${header}*\n\n${res}\n\n[Full SmartPrice report](https://docs.google.com/spreadsheets/d/1NBXuyGlCznS0SJjJJX52vR3ZzqPAPM8LQPM_GX8T_Wc/edit#gid=36671662)`
  }
}
