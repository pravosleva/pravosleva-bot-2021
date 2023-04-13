/* eslint-disable @typescript-eslint/no-unused-vars */
import { TModifiedRequest } from '~/bot/utils/interfaces'
import { TQueueState, TNotifyCodesMap } from './interfaces'
import { getTimeAgo } from '~/bot/utils/getTimeAgo'

export class Utils {
  req: TModifiedRequest
  isNotifUselessnessValidator: ({
    notifyCodes,
  }: {
    notifyCodes: TNotifyCodesMap
  }) => boolean
  getSingleMessageMD: ({
    notifyCodes,
  }: {
    notifyCodes: TNotifyCodesMap
  }) => string
  getGeneralizedCommonMessageMD: ({
    queueState,
    notifyCodes,
  }: {
    queueState: TQueueState
    notifyCodes: TNotifyCodesMap
  }) => string
  rules: TNotifyCodesMap
  constructor({
    rules,
    req,
    isNotifUselessnessValidator,
    getSingleMessageMD,
    getGeneralizedCommonMessageMD,
  }) {
    this.rules = rules
    this.req = req
    this.isNotifUselessnessValidator = isNotifUselessnessValidator
    this.getSingleMessageMD = getSingleMessageMD
    this.getGeneralizedCommonMessageMD = getGeneralizedCommonMessageMD
  }
  get notifyCodes(): TNotifyCodesMap {
    return this.rules
  }

  static _getShortListMD({
    shortMsgs,
    limit,
  }: {
    shortMsgs: string[]
    limit: number
  }): string {
    const msgs = []

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
          case i + 1 >= limit && isLastByOne:
            msgs.push('`...`')
            break
          case i + 1 >= limit && isLast:
            msgs.push(shortMsgs[i])
            break
          case isLast:
            msgs.push(shortMsgs[i])
            break
          default:
            break
        }
      }
    }

    return msgs.join('\n')
  }

  static _getShortMsg({ id, date }: { id: number; date: Date }): string {
    return `\`#${id}\` - ${getTimeAgo(date)}`
  }

  get isNotifUselessness(): boolean {
    let res = false
    try {
      if (
        this.isNotifUselessnessValidator({
          notifyCodes: this.notifyCodes,
        })
      )
        res = true
    } catch (err) {
      console.log(err)
    }
    return res
  }
}
