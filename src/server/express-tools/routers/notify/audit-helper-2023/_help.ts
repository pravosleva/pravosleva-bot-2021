import { THelp } from '~/bot/utils/interfaces'
import { EEventCodes } from './types'

export const _helpV2: THelp = {
  params: {
    body: {
      chat_id: {
        type: 'number',
        descr: 'TG chat_id',
        required: true,
      },
      eventCode: {
        type: 'string',
        descr: `Possible values: ${Object.values(EEventCodes).join(', ')}`,
        required: true,
      },
      report: {
        type: '{ [key: string]: { elmTextList: string[] } }',
        descr: 'Parsing report details',
        required: true,
      },
      words: {
        type: 'string[]',
        descr: 'Words (parsing details)',
        required: true,
      },
      ts: {
        type: 'number',
        descr: 'timestamp for getTimeAgo function (for report UI only)',
        required: true,
      },
    },
  },
}
