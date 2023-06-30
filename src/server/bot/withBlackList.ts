const blacklist = [
  // 130640667,
]

const hasAccess = (from: any) => !blacklist.includes(from.id)

export const withBlackList = async (ctx, next) => {
  try {
    const update = ctx.update.message || ctx.update.callback_query

    console.log(update?.message)
    if (!!update?.message?.from && hasAccess(update?.message?.from)) {
      next()
      return
    }
    await ctx.reply("You don't have access. Go away.")
  } catch (err) {
    console.log(err)
  }

  // next() // <- and middleware chain continues there...
  // NOTE: https://github.com/telegraf/telegraf/issues/981
  // This is exactly how things work in Express for example.
  // If you don't need to do anything after the middleware, you just don't call next() and this is perfectly fine.
}
