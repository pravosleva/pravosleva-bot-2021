/* eslint-disable node/no-missing-require */
import http from 'http'
import express, {
  Request as IRequest,
  Response as IResponse,
  NextFunction as INextFunction,
} from 'express'
import axios from 'axios'

const moduleAlias = require('module-alias')
const path = require('path')

require('dotenv').config({ path: path.join(__dirname, '.env') })

moduleAlias(path.join(__dirname, '../', 'package.json'))

const socketIO = require('socket.io')
const { Telegraf, session } = require('telegraf')
const {
  withStartLogic,
  // withLabLogic,
  withSmartPriceLogic,
  // withFeedback,
  // withCianHelper,
  withDetectMembers,
  withExpressChatHelper,
  // withBlackList,
  withAutoruHelper,
  withMyAutopark,
  withAuditlist2023,
} = require('./bot')
const { router } = require('./express-tools')

const isDev: boolean = process.env.NODE_ENV === 'development'
const PORT: number = process.env.PORT ? Number(process.env.PORT) : 3000
const { TG_BOT_TOKEN } = process.env

if (!TG_BOT_TOKEN)
  throw new Error('🚫 Check envs: TG_BOT_TOKEN must be provided!')

class App {
  private server: http.Server
  private port: number
  private bot: typeof Telegraf

  constructor(port: number) {
    this.port = port
    this.bot = new Telegraf(TG_BOT_TOKEN)
    const app = express()

    // app.use(express.static(path.join(__dirname, '../client')))
    // app.use('/build/three.module.js', express.static(path.join(__dirname, '../../node_modules/three/build/three.module.js')))
    app.use(
      (
        req: IRequest & { bot: typeof Telegraf },
        _res: IResponse,
        next: INextFunction
      ) => {
        req.bot = this.bot
        next()
      }
    )
    app.use('/', router)

    this.server = new http.Server(app)
    if (isDev) new socketIO.Server(this.server)
  }

  private runBot() {
    const { bot } = this

    bot.use(session())
    // bot.use(withBlackList)
    withDetectMembers(bot)

    // -- NOTE: Logs
    bot.use((ctx, next) => {
      console.log(ctx.update)
      next()
    })
    // --

    // --- TODO: Refactoring. Make as middlewares:
    withStartLogic(bot)
    // withLabLogic(bot)
    withSmartPriceLogic(bot)
    // withFeedback(bot)
    // withCianHelper(bot)
    withExpressChatHelper(bot)
    withAutoruHelper(bot)
    withMyAutopark(bot)
    withAuditlist2023(bot)
    // ---

    bot.launch()
  }

  public start() {
    this.server.listen(this.port, () => {
      console.log(`Server listening on http://localhost:${this.port}`)
      axios
        .post(
          'https://pravosleva.pro/tg-bot-2021/notify/kanban-2021/reminder/send',
          {
            resultId: new Date().getTime(),
            chat_id: 432590698, // NOTE: Den Pol
            ts: new Date().getTime(),
            eventCode: 'aux_service',
            about: `\`/tg-bot\`\n🚀 Started on TCP ${PORT}`,
            targetMD: `\`\`\`json\n${JSON.stringify(
              {
                NODE_ENV: process.env.NODE_ENV,
              },
              null,
              2
            )}\`\`\``,
          }
        )
        .then((res) => res.data)
        .catch((err) => err)
    })
    this.runBot()
  }
}

new App(PORT).start()
