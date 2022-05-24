export enum EResponseStatus {
  SUCCESS = 'SUCCESS',
}

export enum ETransmission {
  AUTOMATIC = 'AUTOMATIC',
}
export enum EBodyTypeGroup {
  COUPE = 'COUPE',
}
export enum EEngineGroup {
  GASOLINE = 'GASOLINE',
}
export enum ESection {
  Used = 'used',
}
export enum ECategory {
  Cars = 'cars',
}
export enum EOutputType {
  List = 'list',
}

export type TConfig = {
  displacement_from: number
  displacement_to: number
  transmission: ETransmission[]
  body_type_group: EBodyTypeGroup[]
  engine_group: EEngineGroup[]
  section: ESection
  category: ECategory
  output_type: EOutputType
  geo_radius: number
  geo_id: number[]
}
