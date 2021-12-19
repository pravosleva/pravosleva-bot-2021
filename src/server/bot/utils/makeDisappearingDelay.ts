export const makeDisappearingDelay = (cb: () => void, ms = 30000) => {
  return setTimeout(() => {
    try {
      cb()
    } catch (err) {
      console.log(err)
    }
  }, ms)
}
