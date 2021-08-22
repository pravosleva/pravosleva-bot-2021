import { getPrettyPrice } from './getPrettyPrice'

type TPhone = {
  number: string
  countryCode: string
}
export type TItem = {
  [key: string]: any
  id: number
  photos: {
    isLayout: boolean
    isDefault: boolean
    thumbnail2Url: string
    fullUrl: string
    id: number
    miniUrl: string
    thumbnailUrl: string
    rotateDegree: null
  }[]
  phones: TPhone[]
  newbuilding: {
    hasFlatTourBooking: boolean
    isFromSeller: boolean
    isFromDeveloper: boolean
    isFromLeadFactory: boolean
    isFromBuilder: boolean
    id: number
    showJkReliableFlag: boolean
    name: string // 'NEVA TOWERS (Нева Тауэрс)'
  }
  humanizedTimedelta: string // 'вчера'
  title: string // '1-комн. апартаменты, 45,1 м²'
  geo: {
    [key: string]: any
    coordinates: { lng: number; lat: number }
    userInput: string // 'Москва, ЦАО, р-н Пресненский, 1-й Красногвардейский проезд, 22с1',
    // address: [ [Object], [Object], [Object], [Object], [Object], [Object] ],
    countryId: number
    // districts: [ [Object], [Object] ],
    // highways: [],
  }
  bargainTerms: {
    vatPrice: any // null,
    bargainAllowed: boolean
    clientFee: number
    currency: string // 'rur'
    agentBonus: any // null,
    vatType: any // null,
    paymentPeriod: string // 'monthly'
    mortgageAllowed: null
    deposit: number
    leaseTermType: string // 'longTerm'
    priceForWorkplace: any // null,
    price: number
    priceRur: number
    saleType: any // null,
    leaseType: any // null,
    agentFee: number
    priceType: string // 'all'
    utilitiesTerms: {
      includedInPrice: boolean
      flowMetersNotIncludedInPrice: any // null,
      price: 0
    }
  }
  fullUrl: string
}

const getPhoneNumber = ({ number, countryCode }: TPhone) => {
  const str = `+${countryCode}${number}`
  return `[${str}](tel:${str})`
}
export const getMinimalItemInfo = (item: TItem): string => {
  const { bargainTerms, geo, user, phones, fullUrl } = item
  return `${geo.userInput}\n${user.agencyName}${
    phones.length > 0 ? `, ${phones.map(getPhoneNumber).join(', ')}` : ''
  }\n${getPrettyPrice(
    bargainTerms.priceRur
  )} ${bargainTerms.currency.toUpperCase()}\n${fullUrl}`
}
