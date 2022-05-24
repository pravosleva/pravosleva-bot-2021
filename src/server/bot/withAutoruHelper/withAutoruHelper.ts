/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-restricted-syntax */
/* eslint-disable guard-for-in */
// import { httpClient, EPreferences } from '@autoruHttpClient' // NOTE: In progress
import { Markup } from 'telegraf'
// import { makeDisappearingDelay } from '~/bot/utils/makeDisappearingDelay'

type TObjFormat = {
  descr: string
  link: {
    url: string
    label: string
  }
}
const tmpCfg: { [key: string]: TObjFormat } = {
  AutomaticCoupeUsed: {
    descr: 'Купе Автомат б/у | 0.2-2 L.',
    link: {
      url: 'https://auto.ru/cars/used/body-coupe/?displacement_from=200&displacement_to=2000&engine_group=GASOLINE&transmission=AUTOMATIC',
      label: 'Link',
    },
  },
  '150-550': {
    descr: 'Купе Автомат б/у | 0.2-2 L. 150-550 ₽',
    link: {
      url: 'https://auto.ru/cars/used/body-coupe/?displacement_from=200&displacement_to=2000&transmission=AUTOMATIC&engine_group=GASOLINE&price_from=150000&price_to=550000',
      label: 'Link',
    },
  },
  '350-1M': {
    descr: 'Купе Автомат б/у | 0.2-6 L. 350-1M ₽',
    link: {
      url: 'https://auto.ru/cars/used/body-coupe/?displacement_from=200&displacement_to=6000&transmission=AUTOMATIC&engine_group=GASOLINE&price_from=350000&price_to=1000000',
      label: 'Link',
    },
  },
}

export const withAutoruHelper = (bot) => {
  bot.command('autoru', async (ctx) => {
    try {
      await ctx.deleteMessage()
      /* V2: Simple markdown
      const getItem = (key: string) =>
        `*${tmpCfg[key].descr}* 👉 [${tmpCfg[key].link.label}](${tmpCfg[key].link.url})`
      const mdText = Object.keys(tmpCfg).map(getItem).join(`\n\n`)

      return ctx.replyWithMarkdown(mdText)
      */

      // V3
      // Markup.button.url('❤️', 'http://telegraf.js.org'),
      const buttons = []
      for (const key in tmpCfg) {
        buttons.push(Markup.urlButton(tmpCfg[key].descr, tmpCfg[key].link.url))
      }

      const _btns = await ctx.replyWithMarkdown(
        '*Select config*',
        Markup.inlineKeyboard(buttons, { columns: 1 })
          .oneTime()
          .resize()
          .extra()
      )
      return null
      // const delaySeconds = 30
      // const descrData = await ctx.replyWithMarkdown(
      //   `_Кнопки будут удалены через ${delaySeconds} сек..._`
      // )

      // return makeDisappearingDelay(() => {
      //   ctx.deleteMessage(btns.message_id)
      //   ctx.deleteMessage(descrData.message_id)
      // }, delaySeconds * 1000)
    } catch (err) {
      return ctx.reply('ERR')
    }
  })

  // bot.action(EPreferences.AutomaticCoupeUsed, async (ctx) => {
  //   try {
  //     await ctx.answerCbQuery()
  //     ctx.deleteMessage()
  //     // const response = await httpClient.getPrefs0().then((data) => data).catch((msg) => msg)
  //     const response: TObjFormat = getObjData(EPreferences.AutomaticCoupeUsed)

  //     return ctx.replyWithMarkdown(
  //       `*${response.descr}*\n[${response.label}](${response.link})`
  //     )
  //   } catch (err) {
  //     return ctx.replyWithMarkdown(`\`${err.message}\``)
  //   }
  // })
}
