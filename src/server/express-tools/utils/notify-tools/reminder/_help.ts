import { THelp } from '~/bot/utils/interfaces'
import { EEventCodes } from '~/express-tools/routers/notify/kanban-2021/types'

export const _help: THelp = {
  params: {
    body: {
      chat_id: {
        type: 'number',
        descr: 'TG chat_id',
        required: true,
      },
      message_thread_id: {
        type: 'number',
        descr: 'TG message_thread_id (in chat)',
        required: false,
      },
      eventCode: {
        type: 'string',
        descr: `Possible values: ${Object.values(EEventCodes).join(', ')}`,
        required: true,
      },
      about: {
        type: 'string',
        descr: 'Description',
        required: false,
      },
      header: {
        type: 'string',
        descr: 'Header',
        required: false,
      },
      partialHeader: {
        type: 'string',
        descr: 'Part of header',
        required: false,
      },
      errMsg: {
        type: 'string',
        descr: 'Description',
        required: false,
      },
      targetMD: {
        type: 'string',
        descr: 'Description',
        required: true,
      },
      jsonStringified: {
        type: 'string',
        descr: 'Description',
        required: false,
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
