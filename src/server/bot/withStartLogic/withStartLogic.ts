// import { Markup, Telegraf, Extra } from 'telegraf'
import { Context } from 'telegraf/typings'
import { localStateInstance, EScopeParams, ETargetParams } from './utils'
import { httpClient as expressHttpClient } from '~/bot/withExpressChatHelper/utils/httpClient'
import {
  EAPIRoomCode,
  EAPIUserCode,
} from '~/bot/withExpressChatHelper/utils/types'

// const localStateInstance = State.getInstance()

const { NODE_ENV } = process.env
const isDev = NODE_ENV === 'development'
const CHAT_PUBLIC_BASE_URL = 'https://gosuslugi.pravosleva.pro'

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
      'AuditList 2023 - /auditlist',
      '',
      'AutoPark 2022 - /autopark',
      '',
      '💬 KanBan chat 2021 - /invite',
      // '',
      // '🏠 Найти съемное жилье, используя Циан API - /cian',
    ]

    replyWithMarkdown(messages.join('\n'))
  })

  bot.command('start', async (ctx) => {
    const { reply, deleteMessage } = ctx

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

    console.log('-')
    console.log(text)
    console.log('-')

    const messages = ['Доброго времени суток!', '', 'Опции бота /help']
    try {
      const parsedEntry = text.split(' ')

      console.log('--')
      console.log({ text, parsedEntry }) // { text: '/start chat_1', parsedEntry: [ '/start', 'chat_1' ] }
      console.log('--')

      // -- NOTE: Autopark tool
      if (parsedEntry.length === 2) {
        switch (parsedEntry[1]) {
          // case ETargetParams.UXTest:
          case ETargetParams.AutoPark: {
            const cmd = '/autopark'
            const update = {
              message: {
                ...ctx.update.message,
                text: cmd,
                entities: [
                  {
                    offset: 0,
                    length: cmd.length,
                    type: 'bot_command',
                  },
                ],
              },
            }
            // await ctx.reply('Вы зашли в Автопарк')
            // messages.push(`\n🏎️ Вы зашли в Автопарк...`)
            bot.handleUpdate(update)
            return
            // return replyWithMarkdown(
            //   Markup.urlButton(
            //     'Перейти к проектам',
            //     `http://pravosleva.pro/autopark-2022/${chatId}`
            //   ),
            // )
            // break
          }
          case ETargetParams.AuditList: {
            const cmd = '/auditlist'
            const update = {
              message: {
                ...ctx.update.message,
                text: cmd,
                entities: [
                  {
                    offset: 0,
                    length: cmd.length,
                    type: 'bot_command',
                  },
                ],
              },
            }
            // await ctx.reply('Вы зашли в Автопарк')
            // messages.push(`\n🏎️ Вы зашли в Автопарк...`)
            bot.handleUpdate(update)
            return
            // return replyWithMarkdown(
            //   Markup.urlButton(
            //     'Перейти к проектам',
            //     `http://pravosleva.pro/autopark-2022/${chatId}`
            //   ),
            // )
            // break
          }
          default:
            break
        }
      }
      // --

      // console.log('- debug 1')
      // console.log(parsedEntry[1]) // 'chat_1'
      // console.log('-')

      if (parsedEntry[1]) {
        const parsedParam = parsedEntry[1].split('_') // ['chat', '1']
        const scopeParam = parsedParam[0] // 'chat'
        const targetParam: string | undefined = parsedParam[1] // '1'
        const targetParamNormalized = Number(targetParam)

        console.log('- debug 1.1: targetParamNormalized')
        console.log(targetParamNormalized) // ?
        console.log('-')

        const chats = new Map<number, string>()
        chats.set(0, 'ux-test')
        chats.set(1, 'ui-test')
        chats.set(2, 'pravosleva.pro')
        chats.set(3, 'magaz')

        const targetChatName: string | undefined = chats.get(
          targetParamNormalized
        )

        console.log('- debug 1.2: targetChatName')
        console.log(targetChatName) // ?
        console.log('-')

        console.log('- debug 1.3: scopeParam')
        console.log(scopeParam) // ?
        console.log('-')

        switch (scopeParam) {
          case EScopeParams.InviteChat:
            messages.push('\nЗабыли пароль? /invite')
            if (targetChatName) {
              switch (targetChatName) {
                // TODO?
                default: {
                  // if (
                  //   parsedEntry.length === 2 &&
                  //   parsedEntry[1].split('_')[0] === 'chat'
                  // ) {
                  //   const cmd = '/invite'
                  //   const update = {
                  //     message: {
                  //       ...ctx.update.message,
                  //       text: cmd,
                  //       entities: [
                  //         {
                  //           offset: 0,
                  //           length: cmd.length,
                  //           type: 'bot_command',
                  //         },
                  //       ],
                  //     },
                  //   }
                  //   bot.handleUpdate(update)
                  //   return
                  // }
                  // 1. Check room
                  const roomInfo = await expressHttpClient
                    .checkRoom({ room_id: targetChatName })
                    .then((_data) => _data)
                    .catch((msg) => msg)

                  console.log('- debug 1.4: roomInfo (response)')
                  console.log(roomInfo)
                  console.log('-')

                  switch (roomInfo.code) {
                    case EAPIRoomCode.RoomExists:
                      localStateInstance.set(chatId, {
                        targetParam: targetChatName,
                        link:
                          roomInfo.link ||
                          `${CHAT_PUBLIC_BASE_URL}/express-helper/chat/#/chat?room=${targetChatName}`,
                      })
                      if (isDev) messages.push(`Room ${targetChatName} exists`)
                      break
                    case EAPIRoomCode.NotFound:
                      messages.push(
                        `\n⛔ Room ${targetParam} - комната не существует`
                      )
                      break
                    default:
                      messages.push(
                        `E-Helper res: ${typeof roomInfo === 'string'
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
                      // if (isDev) messages.push(`User ${username} exists: Go /invite`)

                      messages.push(
                        `\n✅ Hello, ${username}! Thats target chat:\n${roomInfo.link ||
                        `${CHAT_PUBLIC_BASE_URL}/express-helper/chat/#/chat`
                        }\n`
                      )
                      break
                    case userInfo.code === EAPIUserCode.NotFound:
                      messages.push(
                        `\n⛔ Пользователь ${username} не найден: Регистрация здесь 👉 /invite`
                      )
                      break
                    case roomInfo.code === EAPIRoomCode.RoomExists &&
                      userInfo.code !== EAPIUserCode.UserExists:
                      messages.push(
                        `⚠️ Oops... Комната ${targetChatName} существует, но Вы не зарегистрированы в чате. Регистрация здесь 👉 /invite`
                      )
                      break

                    // Room not found, user exists
                    case userInfo.code === EAPIUserCode.UserExists:
                      messages.push(
                        `${CHAT_PUBLIC_BASE_URL}/express-helper/chat/#/chat`
                      )
                      break

                    default:
                      messages.push(
                        `⚠️ E-Helper res: ${typeof userInfo === 'string'
                          ? userInfo
                          : userInfo.code || 'No data.code'
                        }`
                      )
                      break
                  }
                  break
                }
              }
            } else if (isDev) {
              messages.push('W/O params')
              messages.push(
                'Для регистрации в чате или сброса пароля выполните /invite'
              )
            }
            break
          default:
            if (isDev) {
              messages.push('Unknown scopeParam')
              messages.push(
                'Для регистрации в чате или сброса пароля выполните /invite'
              )
            }
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
