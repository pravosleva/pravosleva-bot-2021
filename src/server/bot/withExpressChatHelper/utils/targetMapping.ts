import { ETargetParams } from '~/bot/withStartLogic/utils/types'

const targetMapping: {
  [key: string]: { link: string; uiName: string }
} = {
  [ETargetParams.SP]: {
    link: 'https://pravosleva.ru/express-helper/chat/#/?room=sp.pravosleva',
    uiName: '🔗 SP WORK CHAT',
  },
  [ETargetParams.UXTest]: {
    link: 'https://pravosleva.ru/express-helper/chat/#/?room=ux-test',
    uiName: '🔗 UX-TEST CHAT',
  },
  [ETargetParams.MFES]: {
    link: 'https://pravosleva.ru/express-helper/chat/#/?room=microfrontends',
    uiName: '🔗 MICROFRONTENDS CHAT',
  },
}

const defaultItem: { link: string; uiName: string } = {
  link: 'https://pravosleva.ru/express-helper/chat/',
  uiName: '🔗 PUB 2021',
}

export const getTargetData = (
  targetParam?: string
): { link: string; uiName: string } | null => {
  let result = defaultItem

  if (targetMapping[targetParam]) result = targetMapping[targetParam]

  return result
}
