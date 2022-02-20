/* eslint-disable no-case-declarations */
import { Markup } from 'telegraf'
// import { Context } from 'telegraf/typings'
import { stateInstance } from './utils/stateInstance'
import { httpClient } from './utils/httpClient'
import { localStateInstance } from '~/bot/withStartLogic/utils'
import { getTargetData } from './utils/targetMapping'
import { EAPIUserCode } from './utils/types'
import { makeDisappearingDelay } from '~/bot/utils/makeDisappearingDelay'
import { getReportMarkdown } from '~/bot/utils/getReportMarkdown'

// const isDev: boolean = process.env.NODE_ENV === 'development'

export const withExpressChatHelper = (bot: any) => {
  bot.command('invite', async (ctx: any) => {
    const delaySeconds = 30
    const { reply, replyWithMarkdown, deleteMessage } = ctx

    if (!ctx.message?.from?.username) {
      return reply('⛔ Необходимо завести username')
    }

    try {
      deleteMessage()
    } catch (err) {
      console.log(err)
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

    switch (data.code) {
      case EAPIUserCode.IncorrectUserName:
        try {
          // 1.1: Пользователь менял ник (предлагаем кнопку Пересоздать с новым ником)
          const newData = await reply(
            `Мы знали Вас ранее как ${data.oldUsername || 'ERR3'}:`,
            Markup.inlineKeyboard([
              Markup.callbackButton(
                `Пересоздать профиль ${username}`,
                'express-chat-helper.signup'
              ),
              // Markup.callbackButton('Забыл пароль', 'express-chat-helper.forgot-password'),
              Markup.callbackButton(
                'Забыл пароль',
                'express-chat-helper.signup'
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
          return reply(`ERR: ${err.messate || 'No err msg #1'}`)
        }
      case EAPIUserCode.UserExists:
        try {
          // 1.2: Пользователь не менял ник (предлагаем кнопку Сбросить пароль)
          const newData = await replyWithMarkdown(
            `Пользователь ${username} был зарегистрирован ранее`,
            Markup.inlineKeyboard([
              Markup.callbackButton(
                'Забыл пароль',
                'express-chat-helper.signup'
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
          return reply(`ERR: ${err.messate || 'No err msg #2'}`)
        }
      case EAPIUserCode.NotFound:
      default:
        // 2. NO: Предлагаем создать
        try {
          const newData = await reply(
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
          const descrData = await ctx.replyWithMarkdown(
            `_Кнопка доступна ${delaySeconds} сек..._`
          )

          return makeDisappearingDelay(() => {
            ctx.deleteMessage(newData.message_id)
            ctx.deleteMessage(descrData.message_id)
          }, delaySeconds * 1000)
        } catch (err) {
          // return reply(`ERR: ${err.messate || 'No err msg #3'}`)
          return console.log(err)
        }
    }
    // --
  })

  bot.action('express-chat-helper.signup', async (ctx: any) => {
    const { reply, answerCbQuery, deleteMessage, replyWithMarkdown } = ctx
    const { username, id } = ctx.update.callback_query.from

    // -- NOTE: На случай, если пользователь зашел с параметром
    const myState = localStateInstance.get(id)
    const targetParam = myState?.targetParam
    // --
    const targetData = myState?.link
      ? {
          link: myState?.link,
          uiName: targetParam ? targetParam.toUpperCase() : 'CHAT',
        }
      : getTargetData(targetParam || undefined)

    try {
      await answerCbQuery()

      stateInstance.setUserName({ chatId: id, username })
      try {
        deleteMessage()
      } catch (err) {
        console.log(err)
      }

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
        // case EAPIUserCode.UserExists:
        default:
          md += `\n\n[${targetData.uiName}](${targetData.link})`
          break
      }

      return replyWithMarkdown(md)
    } catch (err) {
      return reply(`ERR: ${err.message || 'Fuckup'}`)
    }
  })

  bot.command('chat_admin', async (ctx: any) => {
    const { reply, replyWithMarkdown, deleteMessage } = ctx
    const delaySeconds = 30

    if (!ctx.message?.from?.username)
      return reply('⛔ Необходимо завести username')

    try {
      deleteMessage()
    } catch (err) {
      console.log(err)
    }

    const { username, id } = ctx.update.message.from

    if (username !== 'pravosleva') {
      return reply('⛔ Доступ закрыт')
    }

    try {
      const newData = await reply(
        `Welcome, ${username}, u're admin`,
        Markup.inlineKeyboard([
          Markup.callbackButton(
            'Chat backup state',
            'express-chat-helper.backup-state'
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
      // return reply(`ERR: ${err.messate || 'No err msg #3'}`)
      return console.log(err)
    }
  })

  bot.action('express-chat-helper.backup-state', async (ctx: any) => {
    const { reply, replyWithMarkdown, deleteMessage, answerCbQuery } = ctx

    // try { deleteMessage() }
    // catch (err) { console.log(err) }

    // -- NOTE: Get data & setd to user
    const data = await httpClient
      .getBackupState()
      .then((data) => {
        // console.log(data)
        return data
      })
      .catch((msg) => msg)

    try {
      await answerCbQuery()

      if (data.ok) {
        const md = getReportMarkdown({
          cfg: {
            state: '*State*',
            latest: '*Latest backup*',
            extraInfo: '*Extra info*',
          },
          res: data,
        })
        return replyWithMarkdown(md)
      }

      return reply(`${data?.message || 'ERR: No data.message'}`)
    } catch (err) {
      return reply(`${err?.message || 'ERR: No err.message'}`)
    }
    // --
  })
}
