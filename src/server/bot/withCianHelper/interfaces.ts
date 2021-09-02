import { SceneContextMessageUpdate } from 'telegraf/typings/stage.d'

export enum STAGES {
  STEP1 = 'cian.step1',
  STEP2 = 'cian.step2',
}
export type TSession = {
  coords?: {
    lat: number
    lng: number
  } | null
}
export interface ICustomSceneContextMessageUpdate
  extends SceneContextMessageUpdate {
  session: TSession
}
