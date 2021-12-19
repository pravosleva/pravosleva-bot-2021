export const makeDisappearingDelay = (cb: () => void, ms = 30000) => {
  return setTimeout(cb, ms)
}
