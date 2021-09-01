import { getPrettyPrice } from './getPrettyPrice'
// import { getDistanceInKM } from './getDistance'

type TPhone = {
  number: string
  countryCode: string
}
export type TItem = {
  [key: string]: any
  from?: {
    lat: number
    lng: number
  }
  to?: {
    lat: number
    lng: number
  }

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
const getGoogleWayLinkCar = ({ from, to }) => {
  const { lat: lat1, lng: lng1 } = from
  const { lat: lat2, lng: lng2 } = to
  const base = 'https://www.google.com/maps/dir'
  return `${base}/${lat1},${lng1}/${lat2},${lng2}/@55.6453986,37.6259161,8.96z/data=!4m5!4m4!1m1!4e1!1m0!3e0`
}
const getGoogleWayLinkHuman = ({ from, to }) => {
  const { lat: lat1, lng: lng1 } = from
  const { lat: lat2, lng: lng2 } = to
  const base = 'https://www.google.com/maps/dir'
  return `${base}/${lat1},${lng1}/${lat2},${lng2}/@55.6453986,37.6259161,8.96z/data=!3m1!4b1!4m2!4m1!3e2`
}
const getGoogleMapLinks = ({ from, to }: any): string => {
  return `[👣 Маршрут пешком](${getGoogleWayLinkHuman({
    from,
    to,
  })})\n[🚘 Маршрут на машине](${getGoogleWayLinkCar({ from, to })})`
}
export const getMinimalItemInfo = (item: TItem): string => {
  const { bargainTerms, geo, user, phones, fullUrl, from, to, distance } = item

  return `${geo.userInput}\n${user.agencyName}${
    phones.length > 0 ? `, ${phones.map(getPhoneNumber).join(', ')}` : ''
  }\n${getPrettyPrice(
    bargainTerms.priceRur
  )} ${bargainTerms.currency.toUpperCase()}\n${fullUrl}${
    !!from && !!to
      ? `\n*${distance} км от Вас*\n${getGoogleMapLinks({
          from,
          to,
        })}`
      : ''
  }`
}
