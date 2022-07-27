import { Markup } from 'telegraf'

export const exitKeyboard = Markup.keyboard(['exit']).oneTime().resize().extra()
