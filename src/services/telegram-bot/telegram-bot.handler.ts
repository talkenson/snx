import { Telegraf } from 'telegraf'
import { TELEGRAM_BOT_TOKEN } from '@/config/integrations'

const telegramBot = new Telegraf(TELEGRAM_BOT_TOKEN)

export const startBot = () => telegramBot.launch()

export const stopBot = (reason?: string) => telegramBot.stop(reason)

export const onCommand = (...params: Parameters<typeof telegramBot.command>) =>
  telegramBot.command(...params)

export const sendMessage = (
  ...params: Parameters<typeof telegramBot.telegram.sendMessage>
) => telegramBot.telegram.sendMessage(...params)

process.once('SIGINT', () => telegramBot.stop('SIGINT'))
process.once('SIGTERM', () => telegramBot.stop('SIGTERM'))
