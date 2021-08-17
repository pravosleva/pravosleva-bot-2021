import { Markup, session, BaseScene, Stage } from 'telegraf'

// NOTE: https://github.com/LetItCode/telegraf

const exitKeyboard = Markup.keyboard(['exit']).oneTime().resize().extra()
const removeKeyboard = Markup.removeKeyboard()

// 1. Scene 1:
const step1Scene = new BaseScene('step1Scene')
// @ts-ignore
step1Scene.enter((ctx) => ctx.reply('Enter your company', exitKeyboard))
step1Scene.on('text', (ctx) => {
  return ctx.scene.enter('step2Scene', { company: ctx.message.text })
})
step1Scene.leave((ctx) => ctx.replyWithMarkdown('_Step 1: Exit (its ok)_'))

// 2. Scene 2:
const step2Scene = new BaseScene('step2Scene')
// @ts-ignore
step2Scene.enter((ctx) => ctx.reply('Enter your text', exitKeyboard))
step2Scene.on('text', (ctx: any) => {
  ctx.replyWithMarkdown(
    `New state has been set\n\n\`\`\`\n${JSON.stringify(
      ctx.session,
      null,
      2
    )}\n\`\`\``,
    removeKeyboard
  )
  ctx.session.text = ctx.message.text

  return ctx.scene.enter('step3Scene', {
    company: ctx.scene.state.company,
    text: ctx.message.text,
  })

  // return ctx.scene.leave()
})
step2Scene.leave((ctx) => ctx.replyWithMarkdown('_Step 2: Exit (its ok)_'))

// 3. Target btn
const step3Scene = new BaseScene('step3Scene')
step3Scene.enter((ctx) => {
  return ctx.reply(
    'Уверены?',
    Markup.inlineKeyboard([
      Markup.callbackButton('Отправить заявку', 'stage-sample-result'),
    ])
      .oneTime()
      .resize()
      .extra()
  )
})
step3Scene.action('stage-sample-result', (ctx: any) => {
  ctx.session.company = ctx.scene.state.company

  console.log('---')

  ctx.replyWithMarkdown(
    `Ok, this shit will be sent:\n\n\`\`\`\n${JSON.stringify(
      ctx.session,
      null,
      2
    )}\n\`\`\``,
    removeKeyboard
  )

  return ctx.scene.leave()
})
step3Scene.leave((ctx) => ctx.replyWithMarkdown('_Step 3: Exit (its ok)_'))

// 4. Stage:
const stage = new Stage([step1Scene, step2Scene, step3Scene])
stage.hears('exit', (ctx) => ctx.scene.leave())

export const withStageSample = (bot: any) => {
  bot.use(session())

  bot.use(stage.middleware())

  bot.command('stage_go', (ctx) => {
    return ctx.scene.enter('step1Scene')
  })
  bot.command('stage_state', (ctx) => {
    return ctx.replyWithMarkdown(
      `\`\`\`\n${JSON.stringify(ctx.session, null, 2)}\n\`\`\``
    )
  })
}
