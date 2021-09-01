/* eslint-disable no-shadow */
import { Markup, Stage, BaseScene, Extra } from 'telegraf'
import { SceneContextMessageUpdate } from 'telegraf/typings/stage.d'
// import { httpClient } from '~/bot/withCianHelper/utils/httpClient'
import { httpClient } from '@cianHttpClient'
import {
  // httpClient,
  getMinimalItemInfo,
  withDistance,
  sortByDistanceDESC,
} from './utils'

enum STAGES {
  STEP1 = 'cian.step1',
  STEP2 = 'cian.step2',
}

// const exitKeyboard = Markup.keyboard(['exit']).oneTime().resize().extra()

// 1. Step 1:
const step1Scene = new BaseScene(STAGES.STEP1)
// @ts-ignore
step1Scene.enter((ctx) => {
  return ctx.replyWithMarkdown(
    'Нужны координаты для оценки расстояния от устройства _(По кнопке)_',
    Extra.markup((markup) => {
      return markup
        .keyboard([
          markup.locationRequestButton('Send location'),
          markup.callbackButton('Без локации'),
        ])
        .oneTime()
        .resize()
    })
  )
})
step1Scene.on(
  'location',
  (ctx: SceneContextMessageUpdate & { session: any }) => {
    const coords = {
      lat: ctx.message.location.latitude,
      lng: ctx.message.location.longitude,
    }
    ctx.session.coords = coords
    return ctx.scene.enter(STAGES.STEP2, { coords })
  }
)
step1Scene.on('text', (ctx: any) => {
  // console.log(ctx.message.text)
  // ctx.scene.leave()
  ctx.session.coords = null
  return ctx.scene.enter(STAGES.STEP2)
})
const step2Scene = new BaseScene(STAGES.STEP2)
step2Scene.enter((ctx) => {
  return ctx.replyWithMarkdown(
    '_Выберите метро в близи которого искать:_',
    Markup.inlineKeyboard(
      [
        Markup.callbackButton('Чертаново', 'cian.flatrent.chertanovo'),
        Markup.callbackButton('Царицыно', 'cian.flatrent.tsaritsino'),
      ],
      {
        columns: 2,
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
    ctx.scene.enter(STAGES.STEP1)
  })
  bot.action(
    'cian.flatrent.chertanovo',
    async (ctx: SceneContextMessageUpdate & { session: any }) => {
      await ctx.answerCbQuery()

      return ctx.replyWithMarkdown(
        `🗺️ Аренда в *Чертаново*\n\n_Настройки фильтров:_\n15 мин пешком от метро, холодильник, стиралка${
          ctx.session.coords
            ? `\n\n_Ваши координаты:_\n\`${JSON.stringify(
                ctx.session.coords,
                null,
                2
              )}\``
            : ''
        }`,
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
          .map((e: any) =>
            withDistance({ ...e, from: ctx.session?.coords || null })
          )
          .sort(sortByDistanceDESC)
          .map(getMinimalItemInfo)
          .join('\n\n')

        // console.log(normalizedItems)

        ctx.replyWithMarkdown(
          `*1-комн кв 30K: Нашлось ${response.offersSerialized.length}*\n\n${normalizedItems}`
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
          .map((e: any) =>
            withDistance({ ...e, from: ctx.session?.coords || null })
          )
          .sort(sortByDistanceDESC)
          .map(getMinimalItemInfo)
          .join('\n\n')
        ctx.replyWithMarkdown(
          `*1-комн кв 30-35K: Нашлось ${response.offersSerialized.length}*\n\n${normalizedItems}`
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
        `🗺️ Аренда в *Царьках*\n\n_Настройки фильтров:_\n15 мин пешком от метро, холодильник, стиралка${
          ctx.session.coords
            ? `\n\n_Ваши координаты:_\n\`${JSON.stringify(
                ctx.session.coords,
                null,
                2
              )}\``
            : ''
        }`,
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
          .map((e: any) =>
            withDistance({ ...e, from: ctx.session?.coords || null })
          )
          .sort(sortByDistanceDESC)
          .map(getMinimalItemInfo)
          .join('\n\n')
        ctx.replyWithMarkdown(
          `*1-комн кв 30K: Нашлось ${response.offersSerialized.length}*\n\n${normalizedItems}`
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
          .map((e: any) =>
            withDistance({ ...e, from: ctx.session?.coords || null })
          )
          .sort(sortByDistanceDESC)
          .map(getMinimalItemInfo)
          .join('\n\n')
        ctx.replyWithMarkdown(
          `*1-комн кв 30-35K: Нашлось ${response.offersSerialized.length}*\n\n${normalizedItems}`
        )
      } else {
        ctx.reply('ERR:', response)
      }
    }
  )
}
