import { Markup } from 'telegraf'

import { stateInstance } from './utils/stateInstance'
import { httpClient } from './utils/httpClient'
import { localStateInstance } from '~/bot/withStartLogic/utils'
import { getTargetData } from './utils/targetMapping'
import { EAPICode } from './utils/types'

// const isDev: boolean = process.env.NODE_ENV === 'development'

export const withExpressChatHelper = (bot: any) => {
  bot.command('invite', async (ctx: any) => {
    const { reply, replyWithMarkdown } = ctx

    if (!ctx.message?.from?.username) {
      return reply('⛔ Необходимо завести username')
    }

    const { username, id } = ctx.update.message.from

    // -- NOTE: Спросить у сервера, существует ли юзер с chatId & username
    const data = await httpClient
      .checkUser({
        chatId: id,
        username,
      })
      .then((data) => {
        // console.log(data)
        return data
      })
      .catch((msg) => msg)

    console.log(data)

    switch (data.code) {
      case EAPICode.IncorrectUserName:
        // 1.1: Пользователь менял ник (предлагаем кнопку Пересоздать с новым ником)
        return reply(
          `Мы знали Вас ранее как ${data.oldUsername || 'ERR3'}:`,
          Markup.inlineKeyboard([
            Markup.callbackButton(
              `Пересоздать профиль ${username}`,
              'express-chat-helper.signup'
            ),
            // Markup.callbackButton('Забыл пароль', 'express-chat-helper.forgot-password'),
            Markup.callbackButton('Забыл пароль', 'express-chat-helper.signup'),
          ])
            .oneTime()
            .resize()
            .extra()
        )
      case EAPICode.UserExists:
        // 1.2: Пользователь не менял ник (предлагаем кнопку Сбросить пароль)
        return replyWithMarkdown(
          `Пользователь ${username} существует`,
          Markup.inlineKeyboard([
            Markup.callbackButton('Забыл пароль', 'express-chat-helper.signup'),
          ])
            .oneTime()
            .resize()
            .extra()
        )
      case EAPICode.NotFound:
      default:
        // 2. NO: Предлагаем создать
        try {
          return reply(
            'Вы - новый пользователь',
            Markup.inlineKeyboard([
              Markup.callbackButton(
                `Зарезервировать ник ${username}`,
                'express-chat-helper.signup'
              ),
            ])
              .oneTime()
              .resize()
              .extra()
          )
        } catch (err) {
          return reply(`ERR: ${err.messate || 'No err msg #1'}`)
        }
    }
    // --
  })

  bot.action('express-chat-helper.signup', async (ctx: any) => {
    const { reply, answerCbQuery, deleteMessage, replyWithMarkdown } = ctx
    const { username, id } = ctx.update.callback_query.from

    // -- NOTE: На случай, если пользователь зашел с параметром
    const targetParam = localStateInstance.get(id)
    // --
    const targetData = getTargetData(targetParam || undefined)

    try {
      await answerCbQuery()

      stateInstance.setUserName({ chatId: id, username })
      deleteMessage()

      const data = await httpClient
        .createUser({
          chatId: id,
          username,
        })
        .then((data) => {
          // console.log(data)
          return data
        })
        .catch((msg) => msg)

      if (data.ok) {
        if (data.password) {
          return replyWithMarkdown(
            `\`\`\`\n${JSON.stringify(
              { login: username, passwd: data.password },
              null,
              2
            )}\n\`\`\`\n${data.message || 'Пароль можно поменять в ЛК'}\n\n[${
              targetData.uiName
            }](${targetData.link})`
          )
        }

        return reply(
          data?.message || 'ERR: Что-то пошло не так (сервер не прислал пароль)'
        )
      }
      if (typeof data === 'string') {
        return replyWithMarkdown(
          `${data || `ERR: Неожиданный ответ сервера (${typeof data})`}`
        )
      }

      const messages = []

      if (data?.message) {
        messages.push(data?.message)
      } else {
        messages.push('Что-то пошло не так')
      }

      let md = messages.join('\n')

      switch (data.code) {
        // case EAPICode.UserExists:
        default:
          md += `\n\n[${targetData.uiName}](${targetData.link})`
          break
      }

      return replyWithMarkdown(md)
    } catch (err) {
      deleteMessage()
      return reply(`ERR: ${err.message || 'Fuckup'}`)
    }
  })
}
