export const withDetectMembers = (bot) => {
  try {
    bot.on('new_chat_members', (ctx) => {
      // console.log(ctx.message.new_chat_members)

      const { replyWithMarkdown, message } = ctx

      replyWithMarkdown(
        `Event *new_chat_members*\n\n\`\`\`\n${JSON.stringify(
          { message },
          null,
          2
        )}\`\`\``
      )
    })
  } catch (err) {
    console.log(err)
  }
}
