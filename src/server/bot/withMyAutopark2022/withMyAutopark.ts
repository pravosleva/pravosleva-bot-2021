import {
  Markup,
  // BaseScene, Stage, Extra,
} from 'telegraf'
// import { SceneContextMessageUpdate } from 'telegraf/typings/stage.d'
// import { exitKeyboard } from '~/bot/utils/exitKeyboard'
import { httpClient } from './utils/httpClient'
import { EAPIUserCode } from '~/bot/withExpressChatHelper/utils/types'
import { makeDisappearingDelay } from '~/bot/utils/makeDisappearingDelay'

const AUTOPARK_2022_BASE_URL =
  process.env.AUTOPARK_2022_BASE_URL || 'http://pravosleva.ru/autopark-2022'

export const withMyAutopark = (bot: any) => {
  bot.command('autopark', async (ctx) => {
    // TODO:
    // 1. Check is user exists?
    // console.log(ctx.update.message.from.id)
    const data = await httpClient
      .checkUser({ chat_id: ctx.update.message.from.id })
      .then((data) => data)
      .catch((msg) => msg)

    // console.log(data)
    if (typeof data === 'string') return ctx.replyWithMarkdown(`ERR: ${data}`)

    const {
      reply,
      replyWithMarkdown,
      // deleteMessage,
    } = ctx
    const delaySeconds = 15

    switch (data?.code) {
      // 1. Is user exists?
      // 1.1 YES:
      case EAPIUserCode.UserExists:
        try {
          const newData = await replyWithMarkdown(
            `Пользователь существует\nОдноразовый пароль: \`${data.password}\``,
            Markup.inlineKeyboard([
              Markup.urlButton(
                'Настроить проекты',
                `${AUTOPARK_2022_BASE_URL}/${ctx.update.message.from.id}`
              ),
              Markup.callbackButton(
                'Получить отчет',
                'autopark-2022.get-report'
              ),
            ])
              .oneTime()
              .resize()
              .extra()
          )
          const descrData = await ctx.replyWithMarkdown(
            `_Кнопка доступна ${delaySeconds} сек..._`
          )

          return makeDisappearingDelay(() => {
            ctx.deleteMessage(newData.message_id)
            ctx.deleteMessage(descrData.message_id)
          }, delaySeconds * 1000)
        } catch (err) {
          console.log(err)
          return reply(`⛔ ERR1-1: ${err.messate || 'No err msg'}`)
        }
      // 1.1.1 YES: API

      // 1.2 NO: Registry?
      case EAPIUserCode.NotFound:
        try {
          const newData = await reply(
            'Пользователь не найден',
            Markup.inlineKeyboard([
              Markup.callbackButton(
                'Зарегистрироваться',
                'autopark-2022.add-user'
              ),
            ])
              .oneTime()
              .resize()
              .extra()
          )
          const descrData = await ctx.replyWithMarkdown(
            `_Кнопка доступна ${delaySeconds} сек..._`
          )

          return makeDisappearingDelay(() => {
            ctx.deleteMessage(newData.message_id)
            ctx.deleteMessage(descrData.message_id)
          }, delaySeconds * 1000)
        } catch (err) {
          return reply(`⛔ ERR1-2: ${err.messate || 'No err msg'}`)
        }
      default:
        return ctx.replyWithMarkdown(
          `\`\`\`\n${JSON.stringify(data, null, 2)}\n\`\`\``
        )
    }
  })
  // bot.command('mystate', (ctx: SceneContextMessageUpdate) => {
  //   const state = gStateInstance.getUserState(ctx.message.from.id)
  //   ctx.reply(`Total keys: ${gStateInstance.size}`)
  //   if (gStateInstance.size > 0) {
  //     ctx.reply(gStateInstance.keys.join(', '))
  //   }

  //   ctx.replyWithMarkdown(`\`\`\`\n${JSON.stringify(state, null, 2)}\n\`\`\``)
  // })

  bot.action('autopark-2022.add-user', async (ctx: any) => {
    const { reply, replyWithMarkdown, answerCbQuery } = ctx

    // console.log(ctx.update)

    // try { deleteMessage() }
    // catch (err) { console.log(err) }

    // -- NOTE: Get data & setd to user
    const data = await httpClient
      .addUser({ tg: { chat_id: ctx.update.callback_query.from.id } })
      .then((data) => data)
      .catch((msg) => msg)

    try {
      await answerCbQuery()

      if (data.ok) {
        switch (data.code) {
          case EAPIUserCode.Created:
            return replyWithMarkdown(
              `✅ Пользователь создан успешно\nОдноразовый пароль: \`${data.password}\``,
              Markup.inlineKeyboard([
                Markup.urlButton(
                  'Перейти к проектам',
                  `${AUTOPARK_2022_BASE_URL}/${ctx.update.callback_query.from.id}`
                ),
              ])
                .oneTime()
                .resize()
                .extra()
            )
          default:
            return replyWithMarkdown(
              `Response by express-helper:\n\n\`\`\`\n${JSON.stringify(
                data,
                null,
                2
              )}\n\`\`\``
            )
        }
      }

      return reply(`⛔ ERR1: ${data?.message || 'No data.message'}`)
    } catch (err) {
      return reply(`⛔ ERR2: ${err?.message || 'No err.message'}`)
    }
    // --
  })

  bot.action('autopark-2022.get-report', async (ctx: any) => {
    const { reply, replyWithMarkdown, answerCbQuery } = ctx

    const data = await httpClient
      .getUserProjects({ chat_id: ctx.update.callback_query.from.id })
      .then((data) => data)
      .catch((msg) => msg)

    try {
      await answerCbQuery()

      if (data.ok) {
        if (data.projects) {
          const buttons = []
          for (const key in data.projects) {
            buttons.push(
              Markup.urlButton(
                data.projects[key].name,
                `${AUTOPARK_2022_BASE_URL}/${ctx.update.callback_query.from.id}/${key}/report`
              )
            )
          }

          return reply(
            `✅ ${Object.keys(data.projects).length} проектов`,
            Markup.inlineKeyboard(buttons, { columns: 1 })
              .oneTime()
              .resize()
              .extra()
          )
        }
        return replyWithMarkdown(
          `Response by express-helper:\n\n\`\`\`\n${JSON.stringify(
            data,
            null,
            2
          )}\n\`\`\``
        )
      }

      return reply(`⛔ ERR1: ${data?.message || 'No data.message'}`)
    } catch (err) {
      return reply(`⛔ ERR2: ${err?.message || 'No err.message'}`)
    }
  })
}
