export const withDetectMembers = (bot) => {
  try {
    bot.on('text', (ctx, next) => {
      console.log('-- LOG --')
      console.log(ctx?.update?.message)
      /* NOTE: example
      {
        tg: Telegram {
          token: 'xxx-',
          options: {
            apiRoot: 'https://api.telegram.org',
            webhookReply: true,
            agent: [Agent]
          },
          response: undefined
        },
        update: {
          update_id: 501243284,
          message: {
            message_id: 1117,
            from: [Object],
            chat: [Object],
            date: 1683286787,
            message_thread_id: 1099,
            reply_to_message: [Object],
            text: '/txt',
            entities: [Array],
            is_topic_message: true
          }
        },
        options: {
          retryAfter: 1,
          handlerTimeout: 0,
          contextType: [Function: TelegrafContext],
          username: 'dev_pravosleva_bot'
        },
        updateType: 'message',
        updateSubTypes: [ 'text' ],

        ...etc
      }
      */
      console.log('-- LOG (end) --')
      next()
    })
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
