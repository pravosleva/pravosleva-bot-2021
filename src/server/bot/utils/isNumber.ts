import { getNormalizedNumber } from '~/bot/utils/getNormalizedNumber'

export function isNumber(n: any): boolean {
  const normalizeValue = getNormalizedNumber(n)

  return Number(normalizeValue) === Number(n)
}
