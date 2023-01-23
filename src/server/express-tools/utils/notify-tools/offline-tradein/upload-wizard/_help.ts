import { THelp } from '~/bot/utils/interfaces'

export const _help: THelp = {
  params: {
    body: {
      chat_id: {
        type: 'number',
        descr: 'TG chat_id',
        required: true,
      },
      rowValues: {
        type: 'any[]',
        descr: 'Google sheet row data',
        required: true,
      },
      resultId: {
        type: 'number',
        descr: 'Google sheet row index',
        required: false,
      },
      ts: {
        type: 'number',
        descr: 'timestamp for getTimeAgo function (for report UI only)',
        required: false,
      },
    },
  },
}
