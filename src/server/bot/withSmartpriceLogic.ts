import { Markup } from 'telegraf'

// NOTE: https://github.com/LetItCode/telegraf

export const withSmartpriceLogic = (bot: any) => {
  // 1. Menu:
  bot.command('smartprice', (ctx: any) => {
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
          Markup.callbackButton('Yandex Metrika', 'smartprice.yandex_metrika'),
        ],
        { columns: 2 }
      )
        .oneTime()
        .resize()
        .extra()
    )
  })
  // 1.1 SSR:
  bot.action('smartprice.ssr', async ({ reply, answerCbQuery }) => {
    await answerCbQuery()
    return reply(
      'Choose anything:',
      Markup.inlineKeyboard(
        [Markup.callbackButton('⚙️ Local dev', 'smartprice.ssr.local_dev')],
        { columns: 1 }
      ).extra()
    )
  })
  bot.action(
    'smartprice.ssr.local_dev',
    async ({ replyWithMarkdown, answerCbQuery }) => {
      await answerCbQuery()
      return replyWithMarkdown(
        '[Local dev envs](http://code-samples.space/notes/60bcd2e0a8f340671f9da000)'
      )
    }
  )
  // 1.2 CRM:
  bot.action('smartprice.crm', async ({ answerCbQuery, reply }) => {
    await answerCbQuery()
    return reply(
      'Choose anything:',
      Markup.inlineKeyboard(
        [Markup.callbackButton('⚙️ Local dev', 'smartprice.crm.local_dev')],
        { columns: 2 }
      ).extra()
    )
  })
  bot.action(
    'smartprice.crm.local_dev',
    async ({ answerCbQuery, replyWithMarkdown }) => {
      await answerCbQuery()
      return replyWithMarkdown(
        '[CRM Local dev sevrer](http://code-samples.space/notes/60224c3a0883d4603bb0e8b1)'
      )
    }
  )
  // 1.3 Offline Trade-In:
  bot.action('smartprice.offline_tardein', async ({ answerCbQuery, reply }) => {
    await answerCbQuery()
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
  bot.action(
    'smartprice.offline_tardein.local_dev',
    async ({ answerCbQuery, reply }) => {
      await answerCbQuery()
      return reply('In progress...')
    }
  )
  // 1.4 Onlime Trade-In:
  bot.action('smartprice.online_tardein', async ({ answerCbQuery, reply }) => {
    await answerCbQuery()
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
  bot.action(
    'smartprice.online_tardein.local_dev',
    async ({ answerCbQuery, reply }) => {
      await answerCbQuery()
      return reply('In progress...')
    }
  )
  bot.action(
    'smartprice.online_tardein.remote_ui_testing_link',
    async ({ answerCbQuery, replyWithMarkdown }) => {
      await answerCbQuery()
      return replyWithMarkdown(
        '[Ссылка на CRM](https://smartprice-dev.ru/api/crm/ot/svyaznoy/eval)'
      )
    }
  )
  bot.action(
    'smartprice.online_tardein.remote_ui_testing_instr',
    async ({ answerCbQuery, replyWithMarkdown }) => {
      await answerCbQuery()
      return replyWithMarkdown(
        '[Как попасть в OT?](http://code-samples.space/notes/6041e2499e0d125bf8d0e82c)'
      )
    }
  )
  // 1.5 Ringeo:
  bot.action('smartprice.ringeo', async ({ answerCbQuery, reply }) => {
    await answerCbQuery()
    return reply(
      'Choose anything:',
      Markup.inlineKeyboard(
        [Markup.callbackButton('⚙️ Local dev', 'smartprice.ringeo.local_dev')],
        { columns: 1 }
      ).extra()
    )
  })
  bot.action(
    'smartprice.ringeo.local_dev',
    async ({ answerCbQuery, replyWithMarkdown }) => {
      await answerCbQuery()
      return replyWithMarkdown(
        '**[Ringeo local dev](http://code-samples.space/notes/609a6467a2e87e69a6bfbcba)**'
      )
    }
  )
  // 1.6 Sentry
  bot.action('smartprice.sentry', async ({ answerCbQuery, reply }) => {
    await answerCbQuery()
    return reply(
      'Choose anything:',
      Markup.inlineKeyboard(
        [Markup.callbackButton('⚙️ Access', 'smartprice.sentry.access')],
        { columns: 1 }
      ).extra()
    )
  })
  bot.action(
    'smartprice.sentry.access',
    async ({ answerCbQuery, replyWithMarkdown }) => {
      await answerCbQuery()
      return replyWithMarkdown(
        '[Sentry access](http://code-samples.space/notes/60e6d2b95eed1167a96fea37)'
      )
    }
  )
  // 1.7 Yandex Metrika
  bot.action('smartprice.yandex_metrika', async ({ answerCbQuery, reply }) => {
    await answerCbQuery()
    return reply(
      'Choose anything:',
      Markup.inlineKeyboard(
        [
          Markup.callbackButton(
            'Наблюдения, особенности',
            'smartprice.yandex_metrika.notes'
          ),
        ],
        { columns: 1 }
      ).extra()
    )
  })
  bot.action(
    'smartprice.yandex_metrika.notes',
    async ({ answerCbQuery, replyWithMarkdown }) => {
      await answerCbQuery()
      return replyWithMarkdown(
        '**[Notes](http://code-samples.space/notes/611bc6cebe6ef17d5ab1d879)**'
      )
    }
  )
}
