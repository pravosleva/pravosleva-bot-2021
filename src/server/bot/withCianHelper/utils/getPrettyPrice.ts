/* eslint-disable prefer-destructuring */
export const getPrettyPrice = (num: number): string => {
  let price: any = String(num)
  price = Math.round(+price * 100) / 100
  const parts = price.toString().split('.')
  price = parts[0]

  let tmp = ''
  let len = price.length

  for (let i = 0; i < len; ++i) {
    if (i > 0 && i % 3 === 0) {
      tmp += ' '
    }

    tmp += price[len - 1 - i]
  }

  len = tmp.length
  let out = ''

  for (let i = 0; i < len; ++i) {
    out += tmp[len - 1 - i]
  }

  parts[0] = out

  if (parts.length > 1 && parts[1].length === 1) {
    parts[1] += '0'
  }

  return parts.join('.')
}
