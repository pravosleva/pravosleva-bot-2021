import { Markup, session, BaseScene, Stage, Extra } from 'telegraf'

// NOTE: https://github.com/LetItCode/telegraf

const isDev: boolean = process.env.NODE_ENV === 'development'

type TDocument = {
  file_name: string // "cs_icon.png",
  mime_type: string // "image/png",
  thumb: {
    file_id: string // "AAMCAgADGQEAAgYPYR4e9bDZxIKkgjn43LyXuEU72c4AAtUQAAKpQ_BIKIuZTj7FNpYBAAdtAAMgBA",
    file_unique_id: string // "AQAD1RAAAqlD8Ehy",
    file_size: number // 15296,
    width: number // 320,
    height: number // 320
  }
  file_id: string // "BQACAgIAAxkBAAIGD2EeHvWw2cSCpII5-Ny8l7hFO9nOAALVEAACqUPwSCiLmU4-xTaWIAQ",
  file_unique_id: string // "AgAD1RAAAqlD8Eg",
  file_size: number // 55712
}
// type TAudio = {
//   duration: 270,
//   file_name: "limp-bizkit-pollution-demo_(tetamix.org).mp3",
//   mime_type: "audio/mpeg",
//   title: "Pollution \\(Demo\\)",
//   performer: "Limp Bizkit",
//   file_id: "CQACAgIAAxkBAAIGEmEeH5GGYajNh0EkP7NCCI4JKrIcAALYEAACqUPwSG-M50LoyaH3IAQ",
//   file_unique_id: "AgAD2BAAAqlD8Eg",
//   file_size: 3783697
// }
// --- TOOLS:
const addFileToSession = async (document: TDocument, ctx: any) => {
  const fileId = document.file_unique_id
  const _fileUrl = await ctx.telegram.getFileLink(document.file_id)

  if (!ctx.session.docsMap) ctx.session.docsMap = new Map()
  ctx.session.docsMap.set(fileId, ctx.message.document)
  // NOTE: Update state json:
  const docs = []
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ctx.session.docsMap.forEach((doc: TDocument, _fileIdAsKey: string) => {
    docs.push(doc)
  })
  ctx.scene.state.docs = docs

  if (isDev) ctx.replyWithMarkdown(`[FILE URL](${_fileUrl})`)
  return Promise.resolve()
}
const removeFilesFromSession = async (ctx: any) => {
  if (ctx.session.docsMap) ctx.session.docsMap.clear()
  ctx.scene.state.docs = []
}
type TContact = {
  phone_number: string
  first_name?: string
  last_name?: string
}
const getFullName = (contact: TContact) => {
  const possibleFields = [
    'first_name',
    'last_name',
    'phone_number',
    'fromUsername',
  ]
  const result = []

  possibleFields.forEach((key) => {
    if (contact[key]) {
      switch (key) {
        case 'fromUsername':
          result.push(`(получено от @${contact[key]})`)
          break
        default:
          result.push(contact[key])
          break
      }
    }
  })
  return result.join(' ')
}
type TState = {
  company: string
  position: string
  contact: TContact
  docs: TDocument[]
}
const getFinalMsg = (ctx: {
  scene: { state: TState }
  session: { docsMap: Map<string, { document: TDocument; fileUrl: string }> }
}) => {
  const {
    state: { company, contact, position },
  } = ctx.scene
  const {
    session: { docsMap },
  } = ctx
  return `Проверьте Ваши данные.\n\n👤 ${getFullName(
    contact
  )}\n*Компания: ${company}*\n*Должность: ${position}*${
    (docsMap?.size > 0 && `\n\n📤 _Загружено ${docsMap.size} файлов_`) ||
    '\n\n📤 _Можно приложить файлы_'
  }`
}
const getFinalBtns = (ctx: any) =>
  ctx.replyWithMarkdown(
    `${getFinalMsg(ctx)}\n\n*Подтвердите заявку*`,
    Markup.inlineKeyboard([
      Markup.callbackButton('📨 Отправить заявку', 'send-entry'),
      Markup.callbackButton('Выход', 'exit'),
    ])
      .oneTime()
      .resize()
      .extra()
  )
// ---

const exitKeyboard = Markup.keyboard(['exit']).oneTime().resize().extra()
const removeKeyboard = Markup.removeKeyboard()

// 1. Scene 1:
const step1Scene = new BaseScene('step1Scene')
// @ts-ignore
step1Scene.enter((ctx) =>
  ctx.replyWithMarkdown('*Введите наименование компании*', exitKeyboard)
)
step1Scene.on('text', (ctx: any) => {
  const { text } = ctx.message
  ctx.scene.state.company = ctx.message.text
  if (text) {
    return ctx.scene.enter('step2Scene', { company: ctx.message.text })
  }
  return ctx.scene.leave()
})
step1Scene.on('document', async (ctx: any, next) => {
  addFileToSession(ctx.message.document, ctx)

  return next()
})
step1Scene.leave((ctx: any) => {
  if (!ctx.scene.state.company) {
    removeFilesFromSession(ctx)
    ctx.replyWithMarkdown('🚫 _Step 1: Exit._')
  }
  if (isDev) ctx.replyWithMarkdown('_Step 1: Шаг пройден._')
})

// 2. Scene 2:
const step2Scene = new BaseScene('step2Scene')
step2Scene.enter((ctx) =>
  ctx.replyWithMarkdown('*Введите Вашу должность*', exitKeyboard)
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
step2Scene.on('document', async (ctx: any, next) => {
  addFileToSession(ctx.message.document, ctx)

  return next()
})
step2Scene.leave((ctx: any) => {
  if (!ctx.scene.state.position) {
    removeFilesFromSession(ctx)
    ctx.replyWithMarkdown('🚫 _Step 2: Exit._')
  }
  if (isDev) ctx.replyWithMarkdown('_Step 2: Шаг пройден._')
})

// 3. User contact:
const step3Scene = new BaseScene('step3Scene')
step3Scene.enter((ctx) => {
  return ctx.replyWithMarkdown(
    '*Оставьте Ваш контакт* _(По кнопке)_',
    Extra.markup((markup) => {
      return markup
        .keyboard([
          markup.contactRequestButton('☎️ Оставить контакт ✅'),
          markup.callbackButton('Выйти'),
        ])
        .oneTime()
        .resize()
    })
  )
})
step3Scene.on('contact', (ctx: any) => {
  const { contact, from } = ctx.message

  ctx.scene.state.contact = contact
  if (contact) {
    const fullName = getFullName(contact || {})
    if (isDev)
      ctx.replyWithMarkdown(
        `_Step 3: Спасибо${
          fullName ? `, ${fullName}` : ''
        }, бот получил Ваш контакт._`
      )
    return ctx.scene.enter('step4Scene', {
      company: ctx.scene.state.company,
      position: ctx.scene.state.position,
      contact: { ...ctx.scene.state.contact, fromUsername: from.username },
    })
  }
  return ctx.scene.leave()
})
step3Scene.on('text', (ctx) => {
  // TODO: Refactoring!
  if (ctx.message.text === 'Выйти') {
    removeFilesFromSession(ctx)
    return ctx.scene.leave()
  }

  // return next()
  // NOTE: Текста на этом шаге быть не должно
  removeFilesFromSession(ctx)
  return ctx.scene.leave()
})
step3Scene.on('document', async (ctx: any, next) => {
  addFileToSession(ctx.message.document, ctx)

  return next()
})
// step3Scene.action('exit', (ctx) => ctx.scene.leave())
step3Scene.leave((ctx: any) => {
  if (!ctx.scene.state.contact) {
    removeFilesFromSession(ctx)
    ctx.replyWithMarkdown(`🚫 _Step 3: Exit._`)
  }
  if (isDev) ctx.replyWithMarkdown(`_Step 3: Шаг пройден._`)
})

// 4. Target btn
const step4Scene = new BaseScene('step4Scene')
step4Scene.enter((ctx: any) => {
  getFinalBtns(ctx)
})
step4Scene.on('document', async (ctx: any, next) => {
  await addFileToSession(ctx.message.document, ctx)
  getFinalBtns(ctx)

  return next()
})
step4Scene.action('exit', async (ctx) => {
  await ctx.answerCbQuery()
  ctx.replyWithMarkdown('🚫 _Step 4: Вы вышли из заявки._')
  removeFilesFromSession(ctx)
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
