// import { Telegraf, Markup, Extra } from 'telegraf'
import { Context } from 'telegraf/typings'
import { localStateInstance, EScopeParams, ETargetParams } from './utils'

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

  bot.command('start', (ctx) => {
    const { reply, deleteMessage } = ctx
    try {
      deleteMessage()
    } catch (err) {
      console.log(err)
    }

    // -- NOTE base64
    // Encoder: https://base64.alanreed.org/
    // Decoder: https://www.base64decode.org/
    // --

    const {
      text,
      from: { id: chatId },
    } = ctx.update.message
    // '/start chat-invite_sp'
    // chat-invite_sp

    if (isDev) console.log(chatId)

    const parsedEntry = text.split(' ')

    if (isDev) console.log(parsedEntry)
    // SAMPLES:
    // [ '/start', 'chat-invite_sp' ] -> scopeParam_targetParam
    // [ '/start' ]

    const messages = [
      'Доброго времени суток!',
      '',
      'ℹ️ Для справки выполните /help',
    ]

    if (parsedEntry[1]) {
      const parsedParam = parsedEntry[1].split('_')
      const scopeParam = parsedParam[0]
      const targetParam = parsedParam[1]

      switch (scopeParam) {
        case EScopeParams.InviteChat:
          if (targetParam) {
            switch (targetParam) {
              case ETargetParams.SP:
              case ETargetParams.UXTest:
                // NOTE: Others...
                localStateInstance.set(chatId, targetParam)
                // messages.push(`targetParam detected: ${targetParam} (set to store)`)
                break
              default:
                messages.push('Unknown targetParam')
                break
            }
          } else if (isDev) messages.push('W/O params')
          messages.push('Для регистрации в чате выполните /invite')
          break
        default:
          if (isDev) messages.push('Unknown scopeParam')
          messages.push('Для регистрации в чате выполните /invite')
          break
      }
    }

    reply(messages.join('\n'))
  })
}
