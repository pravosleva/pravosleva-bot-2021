/* eslint-disable no-shadow */
import { Markup, Stage, BaseScene, Extra } from 'telegraf'
// import { httpClient } from '~/bot/withCianHelper/utils/httpClient'
import { httpClient } from '@cianHttpClient'
import {
  // httpClient,
  getMinimalItemInfo,
  withDistance,
  sortByDistanceDESC,
} from './utils'
import { STAGES, ICustomSceneContextMessageUpdate } from './interfaces'
import { makeDisappearingDelay } from '~/bot/utils/makeDisappearingDelay'

// const exitKeyboard = Markup.keyboard(['exit']).oneTime().resize().extra()
const noLocationText = 'Без локации'

// 1. Step 1:
const step1Scene = new BaseScene(STAGES.STEP1)
// @ts-ignore
step1Scene.enter(async (ctx) => {
  try {
    ctx.deleteMessage()
    const btns = await ctx.replyWithMarkdown(
      'Нужны координаты для оценки расстояния от устройства\n👉 _(По кнопке)_',
      Extra.markup((markup) => {
        return markup
          .keyboard([
            markup.locationRequestButton('✅ Сообщить координаты'),
            markup.callbackButton(noLocationText),
          ])
          .oneTime()
          .resize()
      })
    )
    const delaySeconds = 10
    const descrData = await ctx.replyWithMarkdown(
      `_Кнопки доступны ${delaySeconds} сек..._`
    )

    return makeDisappearingDelay(() => {
      ctx.deleteMessage(btns.message_id)
      ctx.deleteMessage(descrData.message_id)
    }, delaySeconds * 1000)
  } catch (err) {
    return ctx.reply('ERR')
  }
})
step1Scene.on('location', (ctx: ICustomSceneContextMessageUpdate) => {
  const {
    message: {
      location: { latitude: lat, longitude: lng },
    },
  } = ctx
  const coords = { lat, lng }
  ctx.session.coords = coords
  return ctx.scene.enter(STAGES.STEP2, { coords })
})
step1Scene.on('text', (ctx: ICustomSceneContextMessageUpdate) => {
  const { text } = ctx.message
  if (text === noLocationText) ctx.session.coords = null
  return ctx.scene.enter(STAGES.STEP2)
})
const step2Scene = new BaseScene(STAGES.STEP2)
step2Scene.enter(async (ctx) => {
  try {
    // ctx.deleteMessage()
    const btns = await ctx.replyWithMarkdown(
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
    const delaySeconds = 10
    const descrData = await ctx.replyWithMarkdown(
      `_Кнопки доступны ${delaySeconds} сек..._`
    )

    return makeDisappearingDelay(() => {
      ctx.deleteMessage(btns.message_id)
      ctx.deleteMessage(descrData.message_id)
    }, delaySeconds * 1000)
  } catch (err) {
    return ctx.reply('ERR')
  }
})
const stage = new Stage([step1Scene, step2Scene])
stage.hears('exit', (ctx) => {
  try {
    ctx.deleteMessage()
  } catch (err) {
    console.log(err)
  }
  ctx.scene.leave()
})

export const withCianHelper = (bot) => {
  bot.use(stage.middleware())

  bot.command('cian', async (ctx: ICustomSceneContextMessageUpdate) => {
    try {
      ctx.deleteMessage()
    } catch (err) {
      console.log(err)
    }
    ctx.scene.enter(STAGES.STEP1)
  })
  bot.action(
    'cian.flatrent.chertanovo',
    async (ctx: ICustomSceneContextMessageUpdate) => {
      try {
        await ctx.answerCbQuery()
        ctx.deleteMessage()
        const btns = await ctx.replyWithMarkdown(
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
        const delaySeconds = 20
        const descrData = await ctx.replyWithMarkdown(
          `_Кнопки доступны ${delaySeconds} сек..._`
        )

        return makeDisappearingDelay(() => {
          ctx.deleteMessage(btns.message_id)
          ctx.deleteMessage(descrData.message_id)
        }, delaySeconds * 1000)
      } catch (err) {
        return ctx.reply('ERR')
      }
    }
  )
  bot.action(
    'cian.flatrent.chertanovo.1-room-30-30',
    async (ctx: ICustomSceneContextMessageUpdate) => {
      try {
        await ctx.answerCbQuery()
        ctx.deleteMessage()
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

          return ctx.replyWithMarkdown(
            `*1-комн кв 30K: Нашлось ${response.offersSerialized.length}*\n\n${normalizedItems}`
          )
        }
        return ctx.reply('ERR:', response)
      } catch (err) {
        return ctx.reply('ERR')
      }
    }
  )
  bot.action(
    'cian.flatrent.chertanovo.1-room-30-35',
    async (ctx: ICustomSceneContextMessageUpdate) => {
      try {
        await ctx.answerCbQuery()
        ctx.deleteMessage()
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
          return ctx.replyWithMarkdown(
            `*1-комн кв 30-35K: Нашлось ${response.offersSerialized.length}*\n\n${normalizedItems}`
          )
        }
        return ctx.reply('ERR:', response)
      } catch (err) {
        return ctx.reply('ERR')
      }
    }
  )

  bot.action(
    'cian.flatrent.tsaritsino',
    async (ctx: ICustomSceneContextMessageUpdate) => {
      try {
        await ctx.answerCbQuery()
        ctx.deleteMessage()
        const btns = await ctx.replyWithMarkdown(
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
        const delaySeconds = 20
        const descrData = await ctx.replyWithMarkdown(
          `_Кнопки доступны ${delaySeconds} сек..._`
        )

        return makeDisappearingDelay(() => {
          ctx.deleteMessage(btns.message_id)
          ctx.deleteMessage(descrData.message_id)
        }, delaySeconds * 1000)
      } catch (err) {
        return ctx.reply('ERR')
      }
    }
  )
  bot.action(
    'cian.flatrent.tsaritsino.1-room-30-30',
    async (ctx: ICustomSceneContextMessageUpdate) => {
      try {
        await ctx.answerCbQuery()
        ctx.deleteMessage()
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
          return ctx.replyWithMarkdown(
            `*1-комн кв 30K: Нашлось ${response.offersSerialized.length}*\n\n${normalizedItems}`
          )
        }
        return ctx.reply('ERR:', response)
      } catch (err) {
        return ctx.reply('ERR')
      }
    }
  )
  bot.action(
    'cian.flatrent.tsaritsino.1-room-30-35',
    async (ctx: ICustomSceneContextMessageUpdate) => {
      try {
        await ctx.answerCbQuery()
        ctx.deleteMessage()
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
          return ctx.replyWithMarkdown(
            `*1-комн кв 30-35K: Нашлось ${response.offersSerialized.length}*\n\n${normalizedItems}`
          )
        }
        return ctx.reply('ERR:', response)
      } catch (err) {
        return ctx.reply('ERR')
      }
    }
  )
}
