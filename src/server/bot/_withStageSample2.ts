/* NOTE: In future versions
import { Telegraf, session, Markup, Stage, WizardScene } from 'telegraf'

// NOTE: Применяется для нормальной обработки последовательного ввода
// BaseScene - именованные обработчики, между которыми можно переключаться
// WizardScene - именованный обработчик, имеющий свои дочерние обработчики с порядковыми номерами

const exitKeyboard = Markup.keyboard(['exit']).oneTime().resize().extra()
const removeKeyboard = Markup.removeKeyboard()

// @ts-ignore
const companyHandler = Telegraf.on('text', async (ctx: any) => {
  ctx.scene.state.company = ctx.message.text
  await ctx.replyWithMarkdown('_Enter your feedback:_', exitKeyboard)
  // return ctx.wizard.next()

  console.log(`--- ctx.wizard.cursor = ${ctx.wizard.cursor}`)
  return ctx.wizard.selectStep(ctx.wizard.cursor + 1)
})
const feebbackHandler = Telegraf.hears('text', async (ctx: any) => {
  ctx.session.company = ctx.scene.state.company
  ctx.session.feedback = ctx.message.text

  await ctx.replyWithMarkdown('Ok.', removeKeyboard)
  return ctx.scene.leave()
})
const infoScene = new WizardScene('infoScene', companyHandler, feebbackHandler)

infoScene.enter((ctx) => ctx.reply('Enter Company name:'))

const stage = new Stage([infoScene])
stage.hears('exit', (ctx) => ctx.scene.leave())

export const withStageSample2 = (bot: any) => {
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
*/
