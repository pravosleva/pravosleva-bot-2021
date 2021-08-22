/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-shadow */
import { Markup, session, BaseScene, Stage, Extra } from 'telegraf'
import { SceneContextMessageUpdate } from 'telegraf/typings/stage.d'
import axios from 'axios'
import { globalStateMapInstance as gStateInstance } from './utils/globalStateMapInstance'
import { TContact } from './utils/interfaces'

const getFullName = (contact: TContact) => {
  const possibleFields = ['first_name', 'last_name', 'phone_number']
  const result = []

  possibleFields.forEach((key) => {
    if (contact[key]) result.push(contact[key])
  })
  return result.join(' ')
}
const getFinalMsg = (ctx: SceneContextMessageUpdate) => {
  const userId = ctx.from.id
  const state = gStateInstance.getUserState(userId)
  const {
    entryData: { company, contact, position, feedback },
    files,
  } = state
  const totalFiles = Object.keys(files).length
  const hasFiles = totalFiles > 0
  return `👉 *Проверьте Ваши данные*\n\n👤 ${
    typeof contact === 'string' ? contact : getFullName(contact)
  }\n*Компания: ${company}*\n*Должность: ${position}*${
    feedback ? `\n\n📨 _Текст заявки:\n---_\n${feedback}\n---` : ''
  }${
    (hasFiles && `\n\n📤 _Загружено ${totalFiles} файлов_`) ||
    '\n\n📤 _Можно приложить файлы_'
  }`
}
const tryNextPhrase = (ctx: SceneContextMessageUpdate) => {
  const userId = ctx.message.from.id
  if (!userId) return

  const hasCompany = gStateInstance.hasCompany(ctx)
  if (!hasCompany) {
    ctx.scene.leave()
    ctx.scene.enter('step1Scene')
    return
  }

  const hasPosition = gStateInstance.hasPosition(ctx)
  if (!hasPosition) {
    ctx.scene.leave()
    ctx.scene.enter('step2Scene')
    return
  }

  const hasFeedback = gStateInstance.hasFeedback(ctx)
  if (!hasFeedback) {
    ctx.scene.leave()
    ctx.scene.enter('step3Scene')
    return
  }

  const hasContact = gStateInstance.hasContact(ctx)
  if (!hasContact) {
    ctx.scene.leave()
    ctx.scene.enter('step4Scene')
    return
  }

  // ctx.scene.leave()
  // ctx.scene.enter('step5Scene')
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
}
const tryShowFinalBtns = (ctx: any): void => {
  tryNextPhrase(ctx)
}

// NOTE: https://github.com/LetItCode/telegraf

const isDev: boolean = process.env.NODE_ENV === 'development'

const exitKeyboard = Markup.keyboard(['exit']).oneTime().resize().extra()
const removeKeyboard = Markup.removeKeyboard()

// 1. Step 1:
const step1Scene = new BaseScene('step1Scene')
// @ts-ignore
step1Scene.enter((ctx) =>
  ctx.replyWithMarkdown(`👉 *Введите наименование компании*`, exitKeyboard)
)
step1Scene.on('text', (ctx: SceneContextMessageUpdate) => {
  const { text } = ctx.message

  if (text && text[0] === '/') {
    gStateInstance.setCompany(ctx, '')
    return tryShowFinalBtns(ctx)
  }

  if (text) {
    gStateInstance.setCompany(ctx, text)
    return ctx.scene.enter('step2Scene', {})
  }
  return ctx.scene.leave()
})
step1Scene.on('document', async (ctx: SceneContextMessageUpdate, next) => {
  await gStateInstance.addDocument(ctx)
  tryShowFinalBtns(ctx)
})
step1Scene.on('photo', async (ctx: SceneContextMessageUpdate, next) => {
  await gStateInstance.addPhoto(ctx)
  tryShowFinalBtns(ctx)
})
// step1Scene.leave((ctx: any) => {
//   if (!gStateInstance.hasCompany(ctx)) {
//     // removeFilesFromSession(ctx)
//     ctx.replyWithMarkdown('🚫 _Step 1: Exit._')
//   }
//   if (isDev) ctx.replyWithMarkdown('_Step 1: Шаг пройден._')
// })

// 2. Step 2:
const step2Scene = new BaseScene('step2Scene')
step2Scene.enter((ctx: SceneContextMessageUpdate) =>
  ctx.replyWithMarkdown('👉 *Введите Вашу должность*', exitKeyboard)
)
step2Scene.on('text', (ctx: SceneContextMessageUpdate) => {
  const { text } = ctx.message

  if (text && text[0] === '/') {
    gStateInstance.setPosition(ctx, '')
    return tryShowFinalBtns(ctx)
  }

  if (text) {
    gStateInstance.setPosition(ctx, text)
    return ctx.scene.enter('step3Scene', {})
  }
  return ctx.scene.leave()
})
step2Scene.on('document', async (ctx: SceneContextMessageUpdate) => {
  await gStateInstance.addDocument(ctx)
  tryShowFinalBtns(ctx)
})
step2Scene.on('photo', async (ctx: SceneContextMessageUpdate) => {
  await gStateInstance.addPhoto(ctx)
  tryShowFinalBtns(ctx)
})
// step2Scene.leave((ctx: any) => {
//   if (!gStateInstance.hasPosition(ctx)) {
//     // removeFilesFromSession(ctx)
//     ctx.replyWithMarkdown('🚫 _Step 2: Exit._')
//   }
//   if (isDev) ctx.replyWithMarkdown('_Step 2: Шаг пройден._')
// })

// 3. Step 3:
const step3Scene = new BaseScene('step3Scene')
step3Scene.enter((ctx) =>
  ctx.replyWithMarkdown('👉 *Введите текст заявки*', exitKeyboard)
)
step3Scene.on('text', (ctx: any) => {
  const { text } = ctx.message

  if (text && text[0] === '/') {
    // gStateInstance.clearUserState(ctx)
    gStateInstance.setFeedback(ctx, '')
    return tryShowFinalBtns(ctx)
  }

  if (text) {
    gStateInstance.setFeedback(ctx, text)
    return ctx.scene.enter('step4Scene', {})
  }
  return ctx.scene.leave()
})
step3Scene.on('document', async (ctx: any) => {
  await gStateInstance.addDocument(ctx)
  tryShowFinalBtns(ctx)
})
step3Scene.on('photo', async (ctx: SceneContextMessageUpdate, next) => {
  await gStateInstance.addPhoto(ctx)
  tryShowFinalBtns(ctx)
})
// step3Scene.leave((ctx: any) => {
//   if (!gStateInstance.hasFeedback(ctx)) {
//     // removeFilesFromSession(ctx)
//     ctx.replyWithMarkdown('🚫 _Step 3: Exit._')
//   }
//   if (isDev) ctx.replyWithMarkdown('_Step 3: Шаг пройден._')
// })

// 4. Step 4: User contact:
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
  const { contact } = ctx.message

  if (contact) {
    gStateInstance.setContact(ctx, contact)
    const fullName = getFullName(contact || {})
    if (isDev)
      ctx.replyWithMarkdown(
        `_Step 4: Спасибо${
          fullName ? `, ${fullName}` : ''
        }, бот получил Ваш контакт._`
      )
    return ctx.scene.enter('step5Scene', {})
  }
  return ctx.scene.leave()
})
step4Scene.on('text', (ctx, next) => {
  const { text } = ctx.message
  if ((text && text[0] === '/') || !gStateInstance.hasContact(ctx)) {
    // gStateInstance.clearUserState(ctx)
    return tryShowFinalBtns(ctx)
  }

  // TODO: Refactoring!
  if (text === 'Выйти') {
    // removeFilesFromSession(ctx)
    gStateInstance.deleteUserState(ctx.message.from.id)
    return ctx.scene.leave()
  }

  return tryShowFinalBtns(ctx)
})
step4Scene.on('document', async (ctx: any) => {
  await gStateInstance.addDocument(ctx)
  tryShowFinalBtns(ctx)
})
step4Scene.on('photo', async (ctx: any) => {
  await gStateInstance.addPhoto(ctx)
  tryShowFinalBtns(ctx)
})
// step4Scene.action('exit', (ctx) => ctx.scene.leave())
// step4Scene.leave((ctx: any) => {
//   if (!gStateInstance.hasContact(ctx)) {
//     // removeFilesFromSession(ctx)
//     ctx.replyWithMarkdown(`🚫 _Step 4: Exit._`)
//   }
//   if (isDev) ctx.replyWithMarkdown(`_Step 4: Шаг пройден._`)
// })

// 5. Target btn
const step5Scene = new BaseScene('step5Scene')
step5Scene.enter((ctx: any) => {
  tryShowFinalBtns(ctx)
})
step5Scene.on('document', async (ctx: any) => {
  await gStateInstance.addDocument(ctx)
  tryShowFinalBtns(ctx)
})
step5Scene.on('photo', async (ctx: any, next) => {
  await gStateInstance.addPhoto(ctx)
  tryShowFinalBtns(ctx)
})
step5Scene.action('exit', async (ctx) => {
  await ctx.answerCbQuery()
  gStateInstance.deleteUserState(ctx.update.callback_query.from.id)
  ctx.replyWithMarkdown('🚫 _Step 5: Вы вышли из заявки._')
  // removeFilesFromSession(ctx)
  return ctx.scene.leave()
})
step5Scene.action('send-entry', async (ctx: any) => {
  const state = gStateInstance.getUserState(ctx.update.callback_query.from.id)
  const links = Object.keys(state.files)
  const hasLinks = links.length > 0
  const msg = `Ok, this shit will be sent:\n\n\`\`\`\n${JSON.stringify(
    state.entryData,
    null,
    2
  )}\n\`\`\`\n\n${
    hasLinks
      ? links.map((link, i) => `💽 [File ${i + 1}](${link})`).join('\n')
      : ''
  }`
  ctx.replyWithMarkdown(msg, removeKeyboard)

  // --- NOTE: Target action!
  gStateInstance.sendEntryByCallbackQuery(ctx)
  // ---

  gStateInstance.deleteUserState(ctx.update.callback_query.from.id)
  await ctx.answerCbQuery()
  ctx.replyWithMarkdown('✅ _Step 5: Заявка отправлена_')
  if (!gStateInstance.getUserState(ctx.update.callback_query.from.id)) {
    ctx.replyWithMarkdown(`_Данные стерты_`)
  }

  return ctx.scene.leave()
})
// step5Scene.leave((ctx) => ctx.replyWithMarkdown('_Done._'))

// 6. Final Stage:
const stage = new Stage([
  step1Scene,
  step2Scene,
  step3Scene,
  step4Scene,
  step5Scene,
])
stage.hears('exit', (ctx) => {
  gStateInstance.deleteUserState(ctx.message.from.id)
  ctx.scene.leave()
})

export const withFeedback = (bot: any) => {
  bot.use(session())
  bot.use(stage.middleware())

  bot.command('feedback', (ctx) => ctx.scene.enter('step1Scene'))
  bot.command('mystate', (ctx: SceneContextMessageUpdate) => {
    // console.log(ctx.message.from.id)
    const state = gStateInstance.getUserState(ctx.message.from.id)
    ctx.reply(`Total keys: ${gStateInstance.size}`)
    if (gStateInstance.size > 0) {
      ctx.reply(gStateInstance.keys.join(', '))
    }

    ctx.replyWithMarkdown(`\`\`\`\n${JSON.stringify(state, null, 2)}\n\`\`\``)
  })
}
