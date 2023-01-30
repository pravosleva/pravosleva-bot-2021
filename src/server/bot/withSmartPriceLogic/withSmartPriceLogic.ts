import { Markup } from 'telegraf'

// NOTE: https://github.com/LetItCode/telegraf

import { httpClient } from './utils/httpClient'
import { ENotifNamespace } from '~/express-tools/routers/sp-notify/run-extra'

export const withSmartPriceLogic = (bot: any) => {
  // 1. Menu:
  bot.command('smartprice', (ctx: any) => {
    const { reply, deleteMessage } = ctx

    try {
      deleteMessage()
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
            Markup.callbackButton(
              'Online Trade-In',
              'smartprice.online_tardein'
            ),
            Markup.callbackButton('Ringeo', 'smartprice.ringeo'),
            Markup.callbackButton('Sentry', 'smartprice.sentry'),
            Markup.callbackButton(
              'Yandex Metrika',
              'smartprice.yandex_metrika'
            ),
          ],
          { columns: 2 }
        )
          .oneTime()
          .resize()
          .extra()
      )
    } catch (err) {
      return reply('ERR')
    }
  })
  // 1.1 SSR:
  bot.action(
    'smartprice.ssr',
    async ({ reply, answerCbQuery, deleteMessage }) => {
      try {
        await answerCbQuery()
        deleteMessage()
        return reply(
          'Choose anything:',
          Markup.inlineKeyboard(
            [
              Markup.callbackButton('⚙️ Local dev', 'smartprice.ssr.local_dev'),
              Markup.callbackButton(
                '🔥 New workflow',
                'smartprice.ssr.workflow'
              ),
            ],
            { columns: 1 }
          ).extra()
        )
      } catch (err) {
        return reply('ERR')
      }
    }
  )
  bot.action(
    'smartprice.ssr.local_dev',
    async ({ replyWithMarkdown, answerCbQuery, deleteMessage }) => {
      try {
        await answerCbQuery()
        deleteMessage()
        return replyWithMarkdown(
          'Для локальной разработки нужно:\n\n1) runtime_data [Как копировать RD](http://code-samples.space/notes/615eaf85844868774d5396b1)\n\n2) Переменные среды [Local dev envs](http://code-samples.space/notes/60bcd2e0a8f340671f9da000)'
        )
      } catch (err) {
        return replyWithMarkdown('ERR')
      }
    }
  )
  bot.action(
    'smartprice.ssr.workflow',
    async ({ replyWithMarkdown, answerCbQuery, deleteMessage }) => {
      try {
        await answerCbQuery()
        deleteMessage()
        return replyWithMarkdown(
          'Перед заливкой в мастер следует сначала раскатить тестовый инстанс и получить фидбек от бизнеса\n\n[NEW WORKFLOW](http://code-samples.space/notes/60d07b5d00cc4a1dc3edbee5)'
        )
      } catch (err) {
        return replyWithMarkdown('ERR')
      }
    }
  )
  // 1.2 CRM:
  bot.action(
    'smartprice.crm',
    async ({ answerCbQuery, reply, replyWithMarkdown, deleteMessage }) => {
      try {
        await answerCbQuery()
        deleteMessage()
        return reply(
          'Choose anything:',
          Markup.inlineKeyboard(
            [Markup.callbackButton('⚙️ Local dev', 'smartprice.crm.local_dev')],
            { columns: 2 }
          ).extra()
        )
      } catch (err) {
        return replyWithMarkdown('ERR')
      }
    }
  )
  bot.action(
    'smartprice.crm.local_dev',
    async ({ answerCbQuery, replyWithMarkdown, deleteMessage }) => {
      try {
        await answerCbQuery()
        deleteMessage()
        return replyWithMarkdown(
          '[CRM Local dev sevrer](http://code-samples.space/notes/60224c3a0883d4603bb0e8b1)'
        )
      } catch (err) {
        return replyWithMarkdown('ERR')
      }
    }
  )
  // 1.3 Offline Trade-In:
  bot.action(
    'smartprice.offline_tardein',
    async ({ answerCbQuery, reply, replyWithMarkdown, deleteMessage }) => {
      try {
        await answerCbQuery()
        deleteMessage()
        return reply(
          'Choose anything:',
          Markup.inlineKeyboard(
            [
              Markup.callbackButton(
                '⚙️ Local dev',
                'smartprice.offline_tardein.local_dev'
              ),
              Markup.urlButton(
                'test.smartprice.ru/tradein',
                'https://test.smartprice.ru/tradein/'
              ),
              Markup.callbackButton(
                '🔥 Send all notifs now',
                'smartprice.offline_tardein.send_all_notifs_now'
              ),
            ],
            { columns: 1 }
          ).extra()
        )
      } catch (err) {
        return replyWithMarkdown('ERR')
      }
    }
  )
  bot.action(
    'smartprice.offline_tardein.local_dev',
    async ({ answerCbQuery, reply, replyWithMarkdown, deleteMessage }) => {
      try {
        await answerCbQuery()
        deleteMessage()
        return reply('In progress...')
      } catch (err) {
        return replyWithMarkdown('ERR')
      }
    }
  )

  bot.action(
    'smartprice.offline_tardein.send_all_notifs_now',
    async (ctx: any) => {
      const { answerCbQuery, replyWithMarkdown, deleteMessage } = ctx
      try {
        await answerCbQuery()
        deleteMessage()

        const res: any = await httpClient.runExtraNotifs({
          chat_id: ctx.update.callback_query.from.id,
          namespace: ENotifNamespace.OFFLINE_TRADEIN_UPLOAD_WIZARD,
        })

        const toClient: any = {
          ok: res?.ok || false,
        }
        if (res?.message) toClient.message = res.message

        return replyWithMarkdown(
          `\`\`\`\n${JSON.stringify(toClient, null, 2)}\n\`\`\``
        )
      } catch (err) {
        return replyWithMarkdown(`ERR: ${err.message || 'No err.message'}`)
      }
    }
  )

  // 1.4 Onlime Trade-In:
  bot.action(
    'smartprice.online_tardein',
    async ({ answerCbQuery, reply, replyWithMarkdown, deleteMessage }) => {
      try {
        await answerCbQuery()
        deleteMessage()
        return reply(
          'Choose anything:',
          Markup.inlineKeyboard(
            [
              Markup.callbackButton(
                '⚙️ Local dev',
                'smartprice.online_tardein.local_dev'
              ),
              Markup.callbackButton(
                'Test on smartprice-dev.ru',
                'smartprice.online_tardein.test_on_dev'
              ),
              Markup.urlButton(
                '🔥 test.ringeo.ru',
                'https://test.ringeo.ru/api/crm/ot/samsung_kz/eval'
              ),
              Markup.callbackButton(
                'ℹ️ Как попасть в OT?',
                'smartprice.online_tardein.remote_ui_testing_instr'
              ),
            ],
            { columns: 1 }
          ).extra()
        )
      } catch (err) {
        return replyWithMarkdown('ERR')
      }
    }
  )
  bot.action(
    'smartprice.online_tardein.local_dev',
    async ({ answerCbQuery, reply, replyWithMarkdown, deleteMessage }) => {
      try {
        await answerCbQuery()
        deleteMessage()
        return reply('In progress...')
      } catch (err) {
        return replyWithMarkdown('ERR')
      }
    }
  )
  bot.action(
    'smartprice.online_tardein.test_on_dev',
    async ({ answerCbQuery, replyWithMarkdown, deleteMessage }) => {
      try {
        await answerCbQuery()
        deleteMessage()
        return replyWithMarkdown(
          'Ссылка на получение токена с перенаправлением на Online Trade-In\n\n[Боевое тестирование на smartprice-dev.ru](https://smartprice-dev.ru/api/crm/ot/svyaznoy/eval)'
        )
      } catch (err) {
        return replyWithMarkdown('ERR')
      }
    }
  )
  bot.action(
    'smartprice.online_tardein.remote_ui_testing_instr',
    async ({ answerCbQuery, replyWithMarkdown, deleteMessage }) => {
      try {
        await answerCbQuery()
        deleteMessage()
        return replyWithMarkdown(
          '[Как попасть в OT?](http://code-samples.space/notes/6041e2499e0d125bf8d0e82c)'
        )
      } catch (err) {
        return replyWithMarkdown('ERR')
      }
    }
  )
  // 1.5 Ringeo:
  bot.action(
    'smartprice.ringeo',
    async ({ answerCbQuery, reply, replyWithMarkdown, deleteMessage }) => {
      try {
        await answerCbQuery()
        deleteMessage()
        return reply(
          'Choose anything:',
          Markup.inlineKeyboard(
            [
              Markup.callbackButton(
                '⚙️ Local dev',
                'smartprice.ringeo.local_dev'
              ),
            ],
            { columns: 1 }
          ).extra()
        )
      } catch (err) {
        return replyWithMarkdown('ERR')
      }
    }
  )
  bot.action(
    'smartprice.ringeo.local_dev',
    async ({ answerCbQuery, replyWithMarkdown, deleteMessage }) => {
      try {
        await answerCbQuery()
        deleteMessage()
        return replyWithMarkdown(
          '**[Ringeo local dev](http://code-samples.space/notes/609a6467a2e87e69a6bfbcba)**'
        )
      } catch (err) {
        return replyWithMarkdown('ERR')
      }
    }
  )
  // 1.6 Sentry
  bot.action(
    'smartprice.sentry',
    async ({ answerCbQuery, reply, replyWithMarkdown, deleteMessage }) => {
      try {
        await answerCbQuery()
        deleteMessage()
        return reply(
          'Choose anything:',
          Markup.inlineKeyboard(
            [Markup.callbackButton('⚙️ Access', 'smartprice.sentry.access')],
            { columns: 1 }
          ).extra()
        )
      } catch (err) {
        return replyWithMarkdown('ERR')
      }
    }
  )
  bot.action(
    'smartprice.sentry.access',
    async ({ answerCbQuery, replyWithMarkdown, deleteMessage }) => {
      try {
        await answerCbQuery()
        deleteMessage()
        return replyWithMarkdown(
          '[Sentry access](http://code-samples.space/notes/60e6d2b95eed1167a96fea37)'
        )
      } catch (err) {
        return replyWithMarkdown('ERR')
      }
    }
  )
  // 1.7 Yandex Metrika
  bot.action(
    'smartprice.yandex_metrika',
    async ({ answerCbQuery, reply, replyWithMarkdown, deleteMessage }) => {
      try {
        await answerCbQuery()
        deleteMessage()
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
      } catch (err) {
        return replyWithMarkdown('ERR')
      }
    }
  )
  bot.action(
    'smartprice.yandex_metrika.notes',
    async ({ answerCbQuery, replyWithMarkdown, deleteMessage }) => {
      try {
        await answerCbQuery()
        deleteMessage()
        return replyWithMarkdown(
          '**[Notes](http://code-samples.space/notes/611bc6cebe6ef17d5ab1d879)**'
        )
      } catch (err) {
        return replyWithMarkdown('ERR')
      }
    }
  )
}
