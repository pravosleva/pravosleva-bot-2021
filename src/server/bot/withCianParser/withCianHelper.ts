import { Markup } from 'telegraf'
import { SceneContextMessageUpdate } from 'telegraf/typings/stage.d'
import { httpClient, getMinimalItemInfo } from './utils'

export const withCianHelper = (bot) => {
  bot.command('cian', (ctx) => {
    return ctx.reply(
      'Cian special settings',
      Markup.inlineKeyboard([
        Markup.callbackButton('1 room 30K', '1-room-30-30'),
        Markup.callbackButton('1 room 30-35K', '1-room-30-35'),
      ])
        .oneTime()
        .resize()
        .extra()
    )
  })
  bot.action('1-room-30-30', async (ctx: SceneContextMessageUpdate) => {
    await ctx.answerCbQuery()

    const response = await httpClient
      .get1Room30K30K()
      .then((data) => data)
      .catch((msg) => msg)

    if (response.offersSerialized) {
      const normalizedItems = response.offersSerialized
        .map(getMinimalItemInfo)
        .join('\n\n')
      ctx.replyWithMarkdown(
        `RECEIVED: ${response.offersSerialized.length}\n\n${normalizedItems}`
      )
    } else {
      ctx.reply('ERR:', response)
    }
  })
  bot.action('1-room-30-35', async (ctx: SceneContextMessageUpdate) => {
    await ctx.answerCbQuery()

    const response = await httpClient
      .get1Room30K35K()
      .then((data) => data)
      .catch((msg) => msg)

    if (response.offersSerialized) {
      const normalizedItems = response.offersSerialized
        .map(getMinimalItemInfo)
        .join('\n\n')
      ctx.replyWithMarkdown(
        `RECEIVED: ${response.offersSerialized.length}\n\n${normalizedItems}`
      )
    } else {
      ctx.reply('ERR:', response)
    }
  })
}
