import { Telegraf, Markup, Extra } from 'telegraf'

const { NODE_ENV } = process.env
const isDev = NODE_ENV === 'development'

// NOTE: https://github.com/LetItCode/telegraf

export const withLabLogic = (bot) => {
  if (isDev) bot.use(Telegraf.log())

  bot.command('start', ({ reply }) =>
    reply('One time keyboard', Markup
      .keyboard(['/onetime'])
      .oneTime()
      .resize()
      .extra()
    )
  )

  bot.command('onetime', ({ reply }) =>
    reply('One time keyboard', Markup
      .keyboard(['/simple', '/inline', '/pyramid'])
      .oneTime()
      .resize()
      .extra()
    )
  )
  bot.command('simple', (ctx) => {
    return ctx.replyWithHTML('<b>Coke</b> or <i>Pepsi?</i>', Extra.markup(
      Markup.keyboard(['Coke', 'Pepsi'])
    ))
  })
  bot.command('inline', (ctx) => {
    return ctx.reply('<b>Coke</b> or <i>Pepsi?</i>', Extra.HTML().markup((m) =>
      m.inlineKeyboard([
        m.callbackButton('Coke', 'Coke'),
        m.callbackButton('Pepsi', 'Pepsi')
      ])))
  })
  bot.command('pyramid', (ctx) => {
    return ctx.reply('Keyboard wrap', Extra.markup(
      Markup.keyboard(['one', 'two', 'three', 'four', 'five', 'six'], {
        wrap: (btn, index, currentRow) => currentRow.length >= (index + 1) / 2
      })
    ))
  })

  bot.command('custom', ({ reply }) => {
    return reply('Custom buttons keyboard', Markup
      .keyboard([
        ['🔍 Search', '😎 Popular'], // Row1 with 2 buttons
        ['☸ Setting', '📞 Feedback'], // Row2 with 2 buttons
        ['📢 Ads', '⭐️ Rate us', '👥 Share'] // Row3 with 3 buttons
      ])
      .oneTime()
      .resize()
      .extra()
    )
  })
  bot.hears('🔍 Search', ctx => ctx.reply('Yay!'))
  bot.hears('📢 Ads', ctx => ctx.reply('Free hugs. Call now!'))

  bot.command('special', (ctx) => {
    return ctx.reply('Special buttons keyboard', Extra.markup((markup) => {
      return markup.keyboard([
          markup.contactRequestButton('Send contact'),
          markup.locationRequestButton('Send location')
        ])
        .oneTime()
        .resize()
    }))
  })

  bot.command('random', (ctx) => {
    return ctx.reply('random example',
      Markup.inlineKeyboard([
        Markup.callbackButton('Coke', 'Coke'),
        Markup.callbackButton('Dr Pepper', 'Dr Pepper', Math.random() > 0.5),
        Markup.callbackButton('Pepsi', 'Pepsi')
      ]).extra()
    )
  })
  bot.action('Dr Pepper', (ctx, next) => {
    return ctx.reply('👍').then(() => next())
  })

  bot.hears(/\/wrap (\d+)/, (ctx) => {
    return ctx.reply('Keyboard wrap', Extra.markup(
      Markup.keyboard(['one', 'two', 'three', 'four', 'five', 'six'], {
        columns: parseInt(ctx.match[1])
      })
    ))
  })

  // bot.command('qr', (ctx) => {
  //   return ctx.replyWithPhoto({ url: 'http://pravosleva.ru/static/img/covid-trash/fake-qr-pravosleva.gosuslugi.png' },
  //     Extra.load({ caption: 'QR' })
  //       .markdown()
  //       .markup((m) =>
  //         m.inlineKeyboard([
  //           m.callbackButton('Gosuslugi', 'qr.gosuslugi')
  //         ])
  //       )
  //   )
  // })
  // bot.action('qr.gosuslugi', async (ctx) => {
  //   return ctx.replyWithPhoto({ url: 'http://pravosleva.ru/static/img/covid-trash/covid-trash-v3-Screenshot_2021-06-27-14-39-58-696_com.miui.gallery.jpg' },
  //     Extra.load({ caption: 'QR' })
  //       .markdown()
  //   )
  // })

  bot.command('caption', (ctx) => {
    return ctx.replyWithPhoto({ url: 'https://picsum.photos/200/300/?random' },
      Extra.load({ caption: 'Caption' })
        .markdown()
        .markup((m) =>
          m.inlineKeyboard([
            m.callbackButton('Plain', 'plain'),
            m.callbackButton('Italic', 'italic')
          ])
        )
    )
  })
  bot.action('plain', async (ctx) => {
    // await ctx.answerCbQuery()
    await ctx.editMessageCaption('Caption', Markup.inlineKeyboard([
      Markup.callbackButton('Plain', 'plain'),
      Markup.callbackButton('Italic', 'italic')
    ]))
  })
  bot.action('italic', async (ctx) => {
    // await ctx.answerCbQuery()
    await ctx.editMessageCaption('_Caption_', Extra.markdown().markup(Markup.inlineKeyboard([
      Markup.callbackButton('Plain', 'plain'),
      Markup.callbackButton('* Italic *', 'italic')
    ])))
  })

  // bot.action(/.+/, (ctx) => {
  //   return ctx.answerCbQuery(`Oh, ${ctx.match[0]}! Great choice`)
  // })

  bot.command('sobes', ({ reply }) => {
    return reply(
      'Choose anything:',
      Markup.inlineKeyboard([
        Markup.callbackButton('JS', 'sobes.js'),
      ])
        .extra()
    )
  })
  bot.action('sobes.js', ({ replyWithMarkdown }) => {
    return replyWithMarkdown('[🎓 Собес по JS](http://code-samples.space/notes/5fcf87445c65457d8570630f)')
  })
}
