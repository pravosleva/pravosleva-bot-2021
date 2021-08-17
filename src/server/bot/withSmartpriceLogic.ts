import { Markup } from 'telegraf'

// NOTE: https://github.com/LetItCode/telegraf

export const withSmartpriceLogic = (bot) => {
  // 1. Menu:
  bot.command('smartprice', (ctx) => {
    const { reply } = ctx
    return reply(
      'Choose anything:',
      Markup.inlineKeyboard(
        [
          Markup.callbackButton('SSR', 'smartprice.ssr'),
          Markup.callbackButton('CRM', 'smartprice.crm'),
          Markup.callbackButton(
            'Offline Trade-In',
            'smartprice.offline_tardein'
          ),
          Markup.callbackButton('Online Trade-In', 'smartprice.online_tardein'),
          Markup.callbackButton('Ringeo', 'smartprice.ringeo'),
          Markup.callbackButton('Sentry', 'smartprice.sentry'),
        ],
        { columns: 2 }
      )
        .oneTime()
        .resize()
        .extra()
    )
  })
  // 1.1 SSR:
  bot.action('smartprice.ssr', ({ reply }) => {
    return reply(
      'Choose anything:',
      Markup.inlineKeyboard(
        [Markup.callbackButton('⚙️ Local dev', 'smartprice.ssr.local_dev')],
        { columns: 1 }
      ).extra()
    )
  })
  bot.action('smartprice.ssr.local_dev', ({ replyWithMarkdown }) => {
    return replyWithMarkdown(
      '[Local dev envs](http://code-samples.space/notes/60bcd2e0a8f340671f9da000)'
    )
  })
  // 1.2 CRM:
  bot.action('smartprice.crm', ({ reply }) => {
    return reply(
      'Choose anything:',
      Markup.inlineKeyboard(
        [Markup.callbackButton('⚙️ Local dev', 'smartprice.crm.local_dev')],
        { columns: 2 }
      ).extra()
    )
  })
  bot.action('smartprice.crm.local_dev', ({ replyWithMarkdown }) => {
    return replyWithMarkdown(
      '[CRM Local dev sevrer](http://code-samples.space/notes/60224c3a0883d4603bb0e8b1)'
    )
  })
  // 1.3 Offline Trade-In:
  bot.action('smartprice.offline_tardein', ({ reply }) => {
    return reply(
      'Choose anything:',
      Markup.inlineKeyboard(
        [
          Markup.callbackButton(
            '⚙️ Local dev',
            'smartprice.offline_tardein.local_dev'
          ),
        ],
        { columns: 2 }
      ).extra()
    )
  })
  bot.action('smartprice.offline_tardein.local_dev', ({ reply }) => {
    return reply('In progress...')
  })
  // 1.4 Onlime Trade-In:
  bot.action('smartprice.online_tardein', ({ reply }) => {
    return reply(
      'Choose anything:',
      Markup.inlineKeyboard(
        [
          Markup.callbackButton(
            '⚙️ Local dev',
            'smartprice.online_tardein.local_dev'
          ),
          Markup.callbackButton(
            '🔥 Lets test OT (Remote dev)',
            'smartprice.online_tardein.remote_ui_testing_link'
          ),
          Markup.callbackButton(
            'ℹ️ Как попасть в OT?',
            'smartprice.online_tardein.remote_ui_testing_instr'
          ),
        ],
        { columns: 1 }
      ).extra()
    )
  })
  bot.action('smartprice.online_tardein.local_dev', ({ reply }) => {
    return reply('In progress...')
  })
  bot.action(
    'smartprice.online_tardein.remote_ui_testing_link',
    ({ replyWithMarkdown }) => {
      return replyWithMarkdown(
        '[Ссылка на CRM](https://smartprice-dev.ru/api/crm/ot/svyaznoy/eval)'
      )
    }
  )
  bot.action(
    'smartprice.online_tardein.remote_ui_testing_instr',
    ({ replyWithMarkdown }) => {
      return replyWithMarkdown(
        '[Как попасть в OT?](http://code-samples.space/notes/6041e2499e0d125bf8d0e82c)'
      )
    }
  )
  // 1.5 Ringeo:
  bot.action('smartprice.ringeo', ({ reply }) => {
    return reply(
      'Choose anything:',
      Markup.inlineKeyboard(
        [Markup.callbackButton('⚙️ Local dev', 'smartprice.ringeo.local_dev')],
        { columns: 1 }
      ).extra()
    )
  })
  bot.action('smartprice.ringeo.local_dev', ({ replyWithMarkdown }) => {
    return replyWithMarkdown(
      '[Sentry access](http://code-samples.space/notes/609a6467a2e87e69a6bfbcba)'
    )
  })
  // 1.6 Sentry
  bot.action('smartprice.sentry', ({ reply }) => {
    return reply(
      'Choose anything:',
      Markup.inlineKeyboard(
        [Markup.callbackButton('⚙️ Access', 'smartprice.sentry.access')],
        { columns: 1 }
      ).extra()
    )
  })
  bot.action('smartprice.sentry.access', ({ replyWithMarkdown }) => {
    return replyWithMarkdown(
      '[Sentry access](http://code-samples.space/notes/60e6d2b95eed1167a96fea37)'
    )
  })
}
