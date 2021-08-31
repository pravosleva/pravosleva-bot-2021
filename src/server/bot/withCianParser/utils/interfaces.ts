export type TConfig = {
  jsonQuery: {
    _type: string // 'flatrent',
    room: {
      type: string // 'terms'
      value: number[] //  [1]
    }
    price: {
      type: string // 'range'
      value: {
        gte: number // <--- FROM
        lte?: number // ---> TO
      }
    }
    engine_version: {
      type: string // 'term'
      value: number // 2
    }
    currency: {
      type: string // 'term'
      value: number // 2
    }
    region: {
      type: string // 'terms'
      value: number[] // [1]
    }
    for_day: {
      type: string // 'term'
      value: string // '!1'
    }
    only_foot?: {
      type: string // 'term'
      value: string // '2'
    }
    foot_min?: {
      type: string // 'range'
      value: {
        lte: number // 15
      }
    }
    geo?: {
      type: string // 'geo'
      value: {
        type: string // 'underground'
        id: number // 147
      }[]
    }
    has_fridge?: {
      type: string // 'term'
      value: boolean // true
    }
    has_washer?: {
      type: string // 'term'
      value: boolean // true
    }
  }
}
