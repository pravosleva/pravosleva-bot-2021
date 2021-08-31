import { Markup, Stage, BaseScene, Extra } from 'telegraf'
import { SceneContextMessageUpdate } from 'telegraf/typings/stage.d'
import { httpClient, getMinimalItemInfo } from './utils'

// const exitKeyboard = Markup.keyboard(['exit']).oneTime().resize().extra()

// 1. Step 1:
const step1Scene = new BaseScene('step11Scene')
// @ts-ignore
step1Scene.enter((ctx) => {
  return ctx.replyWithMarkdown(
    'Нужны координаты для оценки расстояния от устройства _(По кнопке)_',
    Extra.markup((markup) => {
      return markup
        .keyboard([
          markup.locationRequestButton('Send location'),
          markup.callbackButton('Exit', 'exit'),
        ])
        .oneTime()
        .resize()
    })
  )
})
step1Scene.on('location', (ctx: any) => {
  ctx.session.coords = {
    lat: ctx.message.location.latitude,
    lng: ctx.message.location.longitude,
  }
  return ctx.scene.enter('step21Scene', {
    coords: {
      lat: ctx.message.location.latitude,
      lng: ctx.message.location.longitude,
    },
  })
})
step1Scene.on('text', (ctx) => {
  console.log(ctx.message.text)
  ctx.scene.leave()
})
const step2Scene = new BaseScene('step21Scene')
step2Scene.enter((ctx) => {
  return ctx.reply(
    'Cian special settings',
    Markup.inlineKeyboard(
      [
        Markup.callbackButton('Чертаново', 'cian.flatrent.chertanovo'),
        Markup.callbackButton('Царицыно', 'cian.flatrent.tsaritsino'),
      ],
      {
        columns: 1,
      }
    )
      .oneTime()
      .resize()
      .extra()
  )
})
const stage = new Stage([step1Scene, step2Scene])
stage.hears('exit', (ctx) => {
  ctx.scene.leave()
})

export const withCianHelper = (bot) => {
  bot.use(stage.middleware())

  bot.command('cian', async (ctx: SceneContextMessageUpdate) => {
    ctx.scene.enter('step11Scene')
  })
  bot.action(
    'cian.flatrent.chertanovo',
    async (ctx: SceneContextMessageUpdate & { session: any }) => {
      await ctx.answerCbQuery()

      return ctx.replyWithMarkdown(
        '🗺️ *Чертаново*: Аренда\nНастройки фильтров: 15 мин пешком от метро, холодильник, стиралка',
        Markup.inlineKeyboard(
          [
            Markup.callbackButton(
              '1-комн кв 30K',
              'cian.flatrent.chertanovo.1-room-30-30'
            ),
            Markup.callbackButton(
              '1-комн кв 30-35K',
              'cian.flatrent.chertanovo.1-room-30-35'
            ),
          ],
          {
            columns: 1,
          }
        )
          .oneTime()
          .resize()
          .extra()
      )
    }
  )
  bot.action(
    'cian.flatrent.chertanovo.1-room-30-30',
    async (ctx: SceneContextMessageUpdate & { session: any }) => {
      await ctx.answerCbQuery()

      const response = await httpClient
        .getFlatrentChertanovo1Room30K30K()
        .then((data) => data)
        .catch((msg) => msg)

      if (response.offersSerialized) {
        const normalizedItems = response.offersSerialized
          .map((e) =>
            getMinimalItemInfo({ ...e, from: ctx.session?.coords || null })
          )
          .join('\n\n')

        // console.log(normalizedItems)

        ctx.replyWithMarkdown(
          `RECEIVED: ${response.offersSerialized.length}\n\n${normalizedItems}`
        )
      } else {
        ctx.reply('ERR:', response)
      }
    }
  )
  bot.action(
    'cian.flatrent.chertanovo.1-room-30-35',
    async (ctx: SceneContextMessageUpdate & { session: any }) => {
      await ctx.answerCbQuery()

      const response = await httpClient
        .getFlatrentChertanovo1Room30K35K()
        .then((data) => data)
        .catch((msg) => msg)

      if (response.offersSerialized) {
        const normalizedItems = response.offersSerialized
          .map((e) =>
            getMinimalItemInfo({ ...e, from: ctx.session?.coords || null })
          )
          .join('\n\n')
        ctx.replyWithMarkdown(
          `RECEIVED: ${response.offersSerialized.length}\n\n${normalizedItems}`
        )
      } else {
        ctx.reply('ERR:', response)
      }
    }
  )

  bot.action(
    'cian.flatrent.tsaritsino',
    async (ctx: SceneContextMessageUpdate & { session: any }) => {
      await ctx.answerCbQuery()

      return ctx.replyWithMarkdown(
        '🗺️ *Царьки*: Аренда\nНастройки фильтров: 15 мин пешком от метро, холодильник, стиралка',
        Markup.inlineKeyboard(
          [
            Markup.callbackButton(
              '1-комн кв 30K',
              'cian.flatrent.tsaritsino.1-room-30-30'
            ),
            Markup.callbackButton(
              '1-комн кв 30-35K',
              'cian.flatrent.tsaritsino.1-room-30-35'
            ),
          ],
          {
            columns: 1,
          }
        )
          .oneTime()
          .resize()
          .extra()
      )
    }
  )
  bot.action(
    'cian.flatrent.tsaritsino.1-room-30-30',
    async (ctx: SceneContextMessageUpdate & { session: any }) => {
      await ctx.answerCbQuery()

      const response = await httpClient
        .getFlatrentTsaritsino1Room30K30K()
        .then((data) => data)
        .catch((msg) => msg)

      if (response.offersSerialized) {
        const normalizedItems = response.offersSerialized
          .map((e) =>
            getMinimalItemInfo({ ...e, from: ctx.session?.coords || null })
          )
          .join('\n\n')
        ctx.replyWithMarkdown(
          `RECEIVED: ${response.offersSerialized.length}\n\n${normalizedItems}`
        )
      } else {
        ctx.reply('ERR:', response)
      }
    }
  )
  bot.action(
    'cian.flatrent.tsaritsino.1-room-30-35',
    async (ctx: SceneContextMessageUpdate & { session: any }) => {
      await ctx.answerCbQuery()

      const response = await httpClient
        .getFlatrentTsaritsino1Room30K35K()
        .then((data) => data)
        .catch((msg) => msg)

      if (response.offersSerialized) {
        const normalizedItems = response.offersSerialized
          .map((e) =>
            getMinimalItemInfo({ ...e, from: ctx.session?.coords || null })
          )
          .join('\n\n')
        ctx.replyWithMarkdown(
          `RECEIVED: ${response.offersSerialized.length}\n\n${normalizedItems}`
        )
      } else {
        ctx.reply('ERR:', response)
      }
    }
  )
}
