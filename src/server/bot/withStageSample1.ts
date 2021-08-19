import { Markup, session, BaseScene, Stage, Extra } from 'telegraf'

// NOTE: https://github.com/LetItCode/telegraf

const exitKeyboard = Markup.keyboard(['exit']).oneTime().resize().extra()
const removeKeyboard = Markup.removeKeyboard()

// 1. Scene 1:
const step1Scene = new BaseScene('step1Scene')
// @ts-ignore
step1Scene.enter((ctx) =>
  ctx.replyWithMarkdown('*Введите наименование компании:*', exitKeyboard)
)
step1Scene.on('text', (ctx: any) => {
  const { text } = ctx.message
  ctx.scene.state.company = ctx.message.text
  if (text) {
    return ctx.scene.enter('step2Scene', { company: ctx.message.text })
  }
  return ctx.scene.leave()
})
step1Scene.leave((ctx: any) => {
  if (!ctx.scene.state.company) {
    return ctx.replyWithMarkdown('🚫 _Step 1: Exit._')
  }
  return ctx.replyWithMarkdown('_Step 1: Шаг пройден._')
})

// 2. Scene 2:
const step2Scene = new BaseScene('step2Scene')
step2Scene.enter((ctx) =>
  ctx.replyWithMarkdown('*Ваша должность:*', exitKeyboard)
)
step2Scene.on('text', (ctx: any) => {
  const { text } = ctx.message
  ctx.scene.state.position = text
  if (text) {
    return ctx.scene.enter('step3Scene', {
      company: ctx.scene.state.company,
      position: text,
    })
  }
  return ctx.scene.leave()
})
step2Scene.leave((ctx: any) => {
  if (!ctx.scene.state.position) {
    return ctx.replyWithMarkdown('🚫 _Step 2: Exit._')
  }
  return ctx.replyWithMarkdown('_Step 2: Шаг пройден._')
})

// 3. User contact:
const step3Scene = new BaseScene('step3Scene')
step3Scene.enter((ctx) => {
  return ctx.replyWithMarkdown(
    '*Оставьте Ваш контакт:*',
    Extra.markup((markup) => {
      return markup
        .keyboard([
          markup.contactRequestButton('🔥 Оставить контакт'),
          markup.callbackButton('Выйти'),
        ])
        .oneTime()
        .resize()
    })
  )
})
type TContact = {
  phone_number: string
  first_name?: string
  last_name?: string
}
const getFullName = (contact: TContact) => {
  const possibleFields = ['first_name', 'last_name']
  const result = []

  possibleFields.forEach((key) => {
    if (contact[key]) result.push(contact[key])
  })
  return result.join(' ')
}
step3Scene.on('contact', (ctx: any) => {
  const { contact } = ctx.message

  ctx.scene.state.contact = contact
  if (contact) {
    const fullName = getFullName(contact || {})
    ctx.replyWithMarkdown(
      `_Step 3: Спасибо${
        fullName ? `, ${fullName}` : ''
      }, бот получил Ваш контакт._`
    )
    return ctx.scene.enter('step4Scene', {
      company: ctx.scene.state.company,
      position: ctx.scene.state.position,
      contact: ctx.scene.state.contact,
    })
  }
  return ctx.scene.leave()
})
step3Scene.on('text', (ctx) => {
  if (ctx.message.text === 'Выйти') return ctx.scene.leave()

  // return next()
  // NOTE: Текста на этом шаге быть не должно
  return ctx.scene.leave()
})
// step3Scene.action('exit', (ctx) => ctx.scene.leave())
step3Scene.leave((ctx: any) => {
  if (!ctx.scene.state.contact)
    return ctx.replyWithMarkdown(`🚫 _Step 3: Exit._`)
  return ctx.replyWithMarkdown(`_Step 3: Шаг пройден._`)
})

// 4. Target btn
const step4Scene = new BaseScene('step4Scene')
type TState = {
  company: string
  position: string
  contact: TContact
}
const getFinalMsg = (state: TState) => {
  return `${getFullName(
    state.contact
  )}. Вы оставляете заявку как сотрудник компании ${
    state.company
  } на должности ${state.position}.`
}
step4Scene.enter((ctx: any) => {
  return ctx.replyWithMarkdown(
    `${getFinalMsg(ctx.scene.state)}\n\n_Уверены?_\n*Подтвердите заявку:*`,
    Markup.inlineKeyboard([
      Markup.callbackButton('📨 Отправить заявку', 'send-entry'),
      Markup.callbackButton('Выход', 'exit'),
    ])
      .oneTime()
      .resize()
      .extra()
  )
})
step4Scene.action('exit', async (ctx) => {
  await ctx.answerCbQuery()
  ctx.replyWithMarkdown('🚫 _Step 4: Вы вышли из заявки._')
  return ctx.scene.leave()
})
step4Scene.action('send-entry', async (ctx: any) => {
  // NOTE: Пока не увидел в этом смысла
  // ctx.session.company = ctx.scene.state.company
  // ctx.session.position = ctx.scene.state.position

  ctx.replyWithMarkdown(
    `Ok, this shit will be sent:\n\n\`\`\`\n${JSON.stringify(
      ctx.scene.state,
      null,
      2
    )}\n\`\`\``,
    removeKeyboard
  )
  await ctx.answerCbQuery()
  ctx.replyWithMarkdown('✅ _Step 4: Заявка отправлена_')

  return ctx.scene.leave()
})
step4Scene.leave((ctx) => ctx.replyWithMarkdown('_Done._'))

// 5. Stage:
const stage = new Stage([step1Scene, step2Scene, step3Scene, step4Scene])
stage.hears('exit', (ctx) => ctx.scene.leave())

export const withStageSample1 = (bot: any) => {
  bot.use(session())
  bot.use(stage.middleware())

  bot.command('stage_go', (ctx) => ctx.scene.enter('step1Scene'))
  bot.command('stage_state', (ctx) => {
    return ctx.replyWithMarkdown(
      `\`\`\`\n${JSON.stringify(ctx.scene.state, null, 2)}\n\`\`\``
    )
  })
}
