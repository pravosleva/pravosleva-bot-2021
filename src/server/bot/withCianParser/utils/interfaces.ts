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
  }
}
