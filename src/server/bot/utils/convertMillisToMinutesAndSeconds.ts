export const convertMillisToMinutesAndSeconds = (millis: number): string => {
  const minutes: number = Math.floor(millis / 60000)
  const seconds: number = (millis % 60000) / 1000

  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`
}
