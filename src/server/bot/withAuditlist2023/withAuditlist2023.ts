import {
  Markup,
  // BaseScene, Stage, Extra,
} from 'telegraf'

const TODO_2023_BASE_URL =
  process.env.TODO_2023_BASE_URL || 'https://pravosleva.pro/subprojects/todo'

export const withAuditlist2023 = (bot: any) => {
  bot.command('auditlist', async (ctx) => {
    const {
      // reply,
      replyWithMarkdown,
      // deleteMessage,
    } = ctx

    await replyWithMarkdown(
      'Ваша ссылка',
      Markup.inlineKeyboard([
        Markup.urlButton(
          'Audit list',
          `${TODO_2023_BASE_URL}/${ctx.update.message.from.id}`
        ),
        // Markup.callbackButton(
        //   'Получить отчет',
        //   'autopark-2022.get-report'
        // ),
      ])
        .oneTime()
        .resize()
        .extra()
    )
  })
}
