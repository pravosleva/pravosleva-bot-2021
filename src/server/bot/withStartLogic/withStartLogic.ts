// import { Telegraf, Markup, Extra } from 'telegraf'
import { Context } from 'telegraf/typings'
import e from 'express'
import { localStateInstance, EScopeParams, ETargetParams } from './utils'
import { httpClient as expressHttpClient } from '~/bot/withExpressChatHelper/utils/httpClient'
import {
  EAPIRoomCode,
  EAPIUserCode,
} from '~/bot/withExpressChatHelper/utils/types'

const { NODE_ENV } = process.env
const isDev = NODE_ENV === 'development'

// NOTE: https://github.com/LetItCode/telegraf

export const withStartLogic = (bot) => {
  bot.command('help', (ctx: Context) => {
    const { replyWithMarkdown, deleteMessage } = ctx
    try {
      deleteMessage()
    } catch (err) {
      console.log(err)
    }

    const messages = [
      '*Список команд:*',
      '',
      '💬 Зарегистрироваться в чате - /invite',
      '',
      '🏠 Найти съемное жилье, используя Циан API - /cian',
    ]

    replyWithMarkdown(messages.join('\n'))
  })

  bot.command('start', async (ctx) => {
    const { reply, deleteMessage, replyWithMarkdown } = ctx

    // -- NOTE base64
    // Encoder: https://base64.alanreed.org/
    // Decoder: https://www.base64decode.org/
    // --

    const {
      text,
      from: { id: chatId, username },
    } = ctx.update.message
    // '/start chat-invite_sp'
    // chat-invite_sp

    const messages = [
      'Доброго времени суток!',
      '',
      'ℹ️ Для справки выполните /help',
    ]
    try {
      const parsedEntry = text.split(' ')
      // SAMPLES:
      // [ '/start', 'chat-invite_sp' ] -> scopeParam_targetParam
      // [ '/start' ]

      if (parsedEntry[1]) {
        const parsedParam = parsedEntry[1].split('_')
        const scopeParam = parsedParam[0]
        const targetParam: string | undefined = parsedParam[1]

        switch (scopeParam) {
          case EScopeParams.InviteChat:
            if (targetParam) {
              switch (targetParam) {
                case ETargetParams.SP:
                case ETargetParams.UXTest:
                case ETargetParams.MFES:
                  // NOTE: Others...
                  localStateInstance.set(chatId, {
                    targetParam,
                    link: 'http://pravosleva.ru/express-helper/chat/',
                  })
                  // messages.push(`targetParam detected: ${targetParam} (set to store if room exists / [or special case like this])`)
                  break
                default: {
                  // 1. Check room
                  const roomInfo = await expressHttpClient
                    .checkRoom({ room_id: targetParam })
                    .then((_data) => _data)
                    .catch((msg) => msg)

                  switch (roomInfo.code) {
                    case EAPIRoomCode.RoomExists:
                      localStateInstance.set(chatId, {
                        targetParam,
                        link:
                          roomInfo.link ||
                          `http://pravosleva.ru/express-helper/chat/#/${targetParam}`,
                      })
                      if (isDev) messages.push(`Room ${targetParam} exists`)
                      break
                    case EAPIRoomCode.NotFound:
                      messages.push(
                        `\n⛔ Room ${targetParam} - комната не существует`
                      )
                      break
                    default:
                      messages.push(
                        `E-Helper res: ${
                          typeof roomInfo === 'string'
                            ? roomInfo
                            : roomInfo.code || 'No data.code'
                        }`
                      )
                      break
                  }

                  // 2. Check user
                  const userInfoParams: any = { chatId }
                  if (username) userInfoParams.username = username
                  const userInfo = await expressHttpClient
                    .checkUser(userInfoParams)
                    .then((_data) => _data)
                    .catch((msg) => msg)
                  // console.log(userInfo)
                  switch (true) {
                    case userInfo.code === EAPIUserCode.UserExists &&
                      roomInfo.code === EAPIRoomCode.RoomExists:
                      try {
                        deleteMessage()
                      } catch (err) {
                        console.log(err)
                      }
                      if (isDev)
                        messages.push(`User ${username} exists: Go /invite`)
                      if (roomInfo.link) {
                        messages.push(
                          `\n✅ Hello, ${username}! Lets go to room:\n${roomInfo.link}\n`
                        )
                      } else {
                        messages.push(
                          `\n✅ Hello, ${username}! Lets go to chat:\n${
                            roomInfo.link ||
                            'http://pravosleva.ru/express-helper/chat/'
                          }\n`
                        )
                      }
                      break
                    case userInfo.code === EAPIUserCode.NotFound:
                      messages.push(
                        `\n⛔ Пользователь ${username} не найден: Регистрация здесь 👉 /invite`
                      )
                      break
                    case roomInfo.code === EAPIRoomCode.RoomExists &&
                      userInfo.code !== EAPIUserCode.UserExists:
                      messages.push(
                        `⚠️ Oops... Комната ${targetParam} существует, но Вы не зарегистрированы в чате. Регистрация здесь 👉 /invite`
                      )
                      break

                    // Room not found, user exists
                    case userInfo.code === EAPIUserCode.UserExists:
                      // messages.push('http://pravosleva.ru/express-helper/chat/')
                      break

                    default:
                      messages.push(
                        `⚠️ E-Helper res: ${
                          typeof userInfo === 'string'
                            ? userInfo
                            : userInfo.code || 'No data.code'
                        }`
                      )
                      break
                  }
                  break
                }
              }
            } else if (isDev) messages.push('W/O params')
            // messages.push(
            //   'Для регистрации в чате или сброса пароля выполните /invite'
            // )
            break
          default:
            if (isDev) messages.push('Unknown scopeParam')
            messages.push(
              'Для регистрации в чате или сброса пароля выполните /invite'
            )
            break
        }
      }
    } catch (err) {
      messages.push(err.message || 'Server error')
    }

    // console.log(messages)

    reply(messages.join('\n'))
  })
}
