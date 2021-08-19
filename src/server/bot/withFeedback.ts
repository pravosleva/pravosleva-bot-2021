import { Markup, session, BaseScene, Stage, Extra } from 'telegraf'
import { globalStateMapInstance } from '../utils/globalStateMapInstance'
import { TDocument, TContact } from '../interfaces'

// NOTE: https://github.com/LetItCode/telegraf

const isDev: boolean = process.env.NODE_ENV === 'development'

// --- TOOLS:
const refreshUserDataInGlobalState = ({ user_id, docsMap }) => {
  globalStateMapInstance.updateUserDocsMap(user_id, docsMap)
}
const addFileToSession = async (document: TDocument, ctx: any) => {
  const fileId = document.file_unique_id
  const _fileUrl = await ctx.telegram.getFileLink(document.file_id)

  if (!ctx.session.docsMap) ctx.session.docsMap = new Map()
  const _specialTGFileName = _fileUrl.split('/').reverse()[0]
  ctx.session.docsMap.set(fileId, {
    ...ctx.message.document,
    _pravosleva_service: {
      specialTGFileName: _specialTGFileName,
      specialFileUrl: `http://pravosleva.ru/express-helper/pravosleva-bot-2021/get-file-shadow/${_specialTGFileName}`,
    },
  })
  // NOTE: Update state json:
  const docs = []
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ctx.session.docsMap.forEach((docData: TDocument, _fileIdAsKey: string) => {
    docs.push(docData)
  })
  ctx.scene.state.docs = docs

  if (isDev) ctx.replyWithMarkdown(`[FILE URL](${_fileUrl})`)

  // -- Global state
  const fromUserId = ctx.message.from.id
  if (fromUserId) {
    const { docsMap } = ctx.session
    refreshUserDataInGlobalState({
      user_id: fromUserId,
      docsMap: docsMap || new Map(),
    })
  }
  // --

  return Promise.resolve()
}
const removeFilesFromSession = async (ctx: any) => {
  if (ctx.session.docsMap) ctx.session.docsMap.clear()
  ctx.scene.state.docs = []

  try {
    const fromUserId = ctx.update.callback_query.from
    if (fromUserId) globalStateMapInstance.deleteStateForUserId(fromUserId)
  } catch (err) {
    console.log(err)
  }
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
  docs?: TDocument[]
  feedback?: string
}
const getFinalMsg = (ctx: {
  scene: { state: TState }
  session: { docsMap: Map<string, TDocument> }
}) => {
  const {
    state: { company, contact, position, feedback },
  } = ctx.scene
  const {
    session: { docsMap },
  } = ctx
  return `👉 *Проверьте Ваши данные*\n\n👤 ${getFullName(
    contact
  )}\n*Компания: ${company}*\n*Должность: ${position}*${
    feedback ? `\n\n📨 _Текст заявки:\n---_\n${feedback}\n---` : ''
  }${
    (docsMap?.size > 0 && `\n\n📤 _Загружено ${docsMap.size} файлов_`) ||
    '\n\n📤 _Можно приложить файлы_'
  }`
}
const getFinalBtns = (ctx: any) =>
  ctx.replyWithMarkdown(
    `${getFinalMsg(ctx)}\n\n👉 *Подтвердите заявку*`,
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
  ctx.replyWithMarkdown('👉 *Введите наименование компании*', exitKeyboard)
)
step1Scene.on('text', (ctx: any) => {
  const { text } = ctx.message
  ctx.scene.state.company = ctx.message.text
  if (text) {
    return ctx.scene.enter('step2Scene', { ...ctx.scene.state })
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
  ctx.replyWithMarkdown('👉 *Введите Вашу должность*', exitKeyboard)
)
step2Scene.on('text', (ctx: any) => {
  const { text } = ctx.message
  ctx.scene.state.position = text
  if (text) {
    return ctx.scene.enter('step3Scene', { ...ctx.scene.state })
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

// 3. Message from user:
const step3Scene = new BaseScene('step3Scene')
step3Scene.enter((ctx) =>
  ctx.replyWithMarkdown('👉 *Введите текст заявки*', exitKeyboard)
)
step3Scene.on('text', (ctx: any) => {
  const { text } = ctx.message
  ctx.scene.state.feedback = text

  if (text) {
    console.log(text)
    return ctx.scene.enter('step4Scene', { ...ctx.scene.state })
  }
  return ctx.scene.leave()
})
step3Scene.on('document', async (ctx: any, next) => {
  addFileToSession(ctx.message.document, ctx)

  return next()
})
step3Scene.leave((ctx: any) => {
  if (!ctx.scene.state.feedback) {
    removeFilesFromSession(ctx)
    ctx.replyWithMarkdown('🚫 _Step 3: Exit._')
  }
  if (isDev) ctx.replyWithMarkdown('_Step 3: Шаг пройден._')
})

// 4. User contact:
const step4Scene = new BaseScene('step4Scene')
step4Scene.enter((ctx) => {
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
step4Scene.on('contact', (ctx: any) => {
  const { contact, from } = ctx.message
  // const { user_id } = contact
  const { user_id } = ctx.message.from.id

  ctx.scene.state.contact = contact
  if (contact) {
    // -- Global state
    if (user_id)
      refreshUserDataInGlobalState({
        user_id,
        docsMap: ctx.session.docsMap || new Map(),
      })
    // --
    const fullName = getFullName(contact || {})
    if (isDev)
      ctx.replyWithMarkdown(
        `_Step 4: Спасибо${
          fullName ? `, ${fullName}` : ''
        }, бот получил Ваш контакт._`
      )
    return ctx.scene.enter('step5Scene', {
      ...ctx.scene.state,
      contact: { ...ctx.scene.state.contact, fromUsername: from.username },
    })
  }
  return ctx.scene.leave()
})
step4Scene.on('text', (ctx) => {
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
step4Scene.on('document', async (ctx: any, next) => {
  addFileToSession(ctx.message.document, ctx)

  return next()
})
// step4Scene.action('exit', (ctx) => ctx.scene.leave())
step4Scene.leave((ctx: any) => {
  if (!ctx.scene.state.contact) {
    removeFilesFromSession(ctx)
    ctx.replyWithMarkdown(`🚫 _Step 4: Exit._`)
  }
  if (isDev) ctx.replyWithMarkdown(`_Step 4: Шаг пройден._`)
})

// 5. Target btn
const step5Scene = new BaseScene('step5Scene')
step5Scene.enter((ctx: any) => {
  getFinalBtns(ctx)
})
step5Scene.on('document', async (ctx: any, next) => {
  await addFileToSession(ctx.message.document, ctx)
  getFinalBtns(ctx)

  return next()
})
step5Scene.action('exit', async (ctx) => {
  await ctx.answerCbQuery()
  ctx.replyWithMarkdown('🚫 _Step 5: Вы вышли из заявки._')
  removeFilesFromSession(ctx)
  return ctx.scene.leave()
})
step5Scene.action('send-entry', async (ctx: any) => {
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
  ctx.replyWithMarkdown('✅ _Step 5: Заявка отправлена_')

  return ctx.scene.leave()
})
step5Scene.leave((ctx) => ctx.replyWithMarkdown('_Done._'))

// 6. Final Stage:
const stage = new Stage([
  step1Scene,
  step2Scene,
  step3Scene,
  step4Scene,
  step5Scene,
])
stage.hears('exit', (ctx) => ctx.scene.leave())

export const withFeedback = (bot: any) => {
  // await bot.telegram.deleteWebhook()

  bot.use(session())
  bot.use(stage.middleware())

  bot.command('feedback', (ctx) => ctx.scene.enter('step1Scene'))
  bot.command('global_state', (ctx) => {
    ctx.replyWithMarkdown(
      `\`\`\`\n${JSON.stringify(
        globalStateMapInstance.getStateAsJSON(),
        null,
        2
      )}\n\`\`\``
    )
    // SAMPLE: { "432590698": { "docs": [] } }

    ctx.replyWithMarkdown(
      `\`\`\`\n${JSON.stringify(ctx.scene.state, null, 2)}\n\`\`\``
    )
  })
}
