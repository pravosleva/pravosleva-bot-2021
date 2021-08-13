import http from 'http'
import path from 'path'
import express from 'express'
import socketIO from 'socket.io'
import { Telegraf } from 'telegraf'
// import fs from 'fs'
import { withLabLogic } from './bot/withLabLogic'
require('dotenv').config({ path: path.join(__dirname, '.env') })

// const isDev = process.env.NODE_ENV === 'development'
const PORT: string = process.env.PORT
const port: any = PORT ? Number(PORT) : 3000
const { TG_BOT_TOKEN } = process.env

if (!TG_BOT_TOKEN) throw new Error('TG_BOT_TOKEN must be provided!')

class App {
  private server: http.Server
  private port: number

  constructor(port: number) {
    this.port = port
    const app = express()

    app.get('/', function(_req, res) {
      res.status(200).json({ success: true })
    });
    // app.use(express.static(path.join(__dirname, '../client')))
    // app.use('/build/three.module.js', express.static(path.join(__dirname, '../../node_modules/three/build/three.module.js')))
    
    this.server = new http.Server(app)
    new socketIO.Server(this.server)
  }

  runBot() {
    const bot = new Telegraf(TG_BOT_TOKEN)
    withLabLogic(bot)
  }

  public Start() {
    this.server.listen(this.port, () => {
      console.log(`Server listening on http://localhost:${this.port}`)
    })
    this.runBot()
  }
}

new App(port).Start()
