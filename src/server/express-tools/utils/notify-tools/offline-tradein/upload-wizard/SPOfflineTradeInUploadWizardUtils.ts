/* eslint-disable no-useless-constructor */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { getTimeAgo } from '~/bot/utils/getTimeAgo'
import { TQueueState } from '~/express-tools/utils/notify-tools/interfaces'
import { Utils } from '~/express-tools/utils/notify-tools/Utils'

const commonHeader = 'SP Offline Trade-In notifier\n[ upload-wizard ]'

export class SPOfflineTradeInUploadWizardUtils extends Utils {
  constructor(ps: { req: any }) {
    super(ps)
  }
  // NOTE: One message
  getSingleMessageMD() {
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
      _n, // NOTE: ts in ms
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
        res += `\`\`\`\n${
          _modifiedJSON ? JSON.stringify(_modifiedJSON, null, 2) : jsonStr
        }\n\`\`\``

      return res
    }
    const jsonFromBack = getBackResponseMD(originalServerResponseStr)

    result += `*${commonHeader}${
      this.req.body.resultId ? ` | #${this.req.body.resultId}` : ''
    } ${partnerName} ${tradeinId || '?'}*\n\n${
      this.notifyCodes[eventCode].symbol
    } \`${eventCode}\`\n\n${
      this.notifyCodes[eventCode].descr
    } (upload photo ui state: ${curFileCounter} of ${totalFilesLeftCounter})${
      additionalInfo ? `\n\n${additionalInfo}` : ''
    }${jsonFromBack ? `\n\n${jsonFromBack}` : ''}`

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

  // NOTE: Multi message
  _getShortMsg({
    // rowValues,
    id,
    date,
  }: {
    rowValues: any[][]
    id: number
    date: Date
  }): string {
    return `\`#${id}\` - ${getTimeAgo(date)}`
  }
  _getShortListMD({ shortMsgs }): string {
    const msgs = []
    const limit = 5

    for (let i = 0, max = shortMsgs.length; i < max; i++) {
      const isLast = i === max - 1
      const isLastByOne = i === max - 2

      if (max <= limit) {
        msgs.push(shortMsgs[i])
      } else {
        switch (true) {
          case i + 1 < limit:
            msgs.push(shortMsgs[i])
            break
          case i + 1 > limit && isLastByOne:
            msgs.push('`...`')
            break
          case i + 1 >= limit && isLast:
            msgs.push(shortMsgs[i])
            break
          default:
            break
        }
      }
    }

    return msgs.join('\n')
  }
  getGeneralizedCommonMessageMD({ queueState }: { queueState: TQueueState }) {
    const header = `${commonHeader} ${queueState.ids.length} events`
    const msgsObj: {
      [key: string]: {
        counter: number
        msg: string
        partners: Set<string>
        fromIndex: number
        lastIndex: number
        firstDate: Date
        lastDate: Date
        shortMsgs: string[]
      }
    } = {}
    let res = ''
    const contragents = new Set()

    for (let i = 0, max = queueState.ids.length; i < max; i++) {
      const rowValues = queueState.rows[i]
      const date = new Date(queueState.tss[i])
      const eventCode = rowValues[2]
      const currentIndex = queueState.ids[i]
      const lastIndex = queueState.ids[i]
      const partnerName = rowValues[7]
      contragents.add(partnerName)
      const partners = msgsObj[eventCode]?.partners || new Set()
      partners.add(partnerName)

      if (!msgsObj[eventCode])
        msgsObj[eventCode] = {
          counter: 1,
          msg: eventCode, // NOTE: Universal message for all items! // index from #${fromIndex}
          // : ${this.notifyCodes[eventCode]?.descr || 'No descr'}
          partners,
          fromIndex: currentIndex,
          lastIndex,
          firstDate: date,
          lastDate: date,
          shortMsgs: [this._getShortMsg({ rowValues, id: currentIndex, date })],
        }
      else {
        msgsObj[eventCode].counter += 1
        if (currentIndex < msgsObj[eventCode].fromIndex)
          msgsObj[eventCode].fromIndex = currentIndex

        if (lastIndex > msgsObj[eventCode].lastIndex)
          msgsObj[eventCode].lastIndex = lastIndex

        if (msgsObj[eventCode].firstDate > date)
          msgsObj[eventCode].firstDate = date

        if (msgsObj[eventCode].lastDate < date)
          msgsObj[eventCode].lastDate = date

        msgsObj[eventCode].shortMsgs.push(
          this._getShortMsg({ rowValues, id: currentIndex, date })
        )
      }
    }

    if (Object.keys(msgsObj).length > 0) {
      res += Object.keys(msgsObj)
        .map(
          (key) =>
            `\`${this.notifyCodes[key].symbol} (${msgsObj[key].counter}) ${
              msgsObj[key].msg
            } | ${Array.from(msgsObj[key].partners).join(
              ', '
            )}\`\n\n${this._getShortListMD({
              shortMsgs: msgsObj[key].shortMsgs,
            })}`
        )
        .join('\n\n')
    }

    // const contragentsArr = Array.from(contragents)
    // if (contragentsArr.length > 0) header += ` | ${contragentsArr.join(', ')}`

    return `*${header}*\n\n${res}\n\n[Full SmartPrice report](https://docs.google.com/spreadsheets/d/1NBXuyGlCznS0SJjJJX52vR3ZzqPAPM8LQPM_GX8T_Wc/edit#gid=36671662)`
  }
}
