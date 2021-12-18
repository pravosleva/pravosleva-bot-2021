import { ETargetParams } from '~/bot/withStartLogic/utils/types'

const targetMapping: {
  [key: string]: { link: string; uiName: string }
} = {
  [ETargetParams.SP]: {
    link: 'http://pravosleva.ru/express-helper/chat/#/?room=sp.pravosleva',
    uiName: '🔗 SP WORK CHAT',
  },
  [ETargetParams.UXTest]: {
    link: 'http://pravosleva.ru/express-helper/chat/#/?room=ux-test',
    uiName: '🔗 UX-TEST CHAT',
  },
}

const defaultItem: { link: string; uiName: string } = {
  link: 'http://pravosleva.ru/express-helper/chat/',
  uiName: '🔗 PUB 2021',
}

export const getTargetData = (
  targetParam?: string
): { link: string; uiName: string } | null => {
  return !!targetParam && !!targetMapping[targetParam]
    ? targetMapping[targetParam]
    : defaultItem
}
