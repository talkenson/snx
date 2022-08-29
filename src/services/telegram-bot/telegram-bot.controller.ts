import { createController } from '@/common/createController'
import {
  onCommand,
  startBot,
  stopBot,
} from '@/services/telegram-bot/telegram-bot.handler'
import { telegramBotRepo } from '@/services/telegram-bot/telegram-bot.repo'
import { Controller } from '@/types/controllerRelated.types'
import { justLog } from '@/utils/justLog'

export const registerTelegramBotController: Controller<
  ReturnType<typeof telegramBotRepo>
> = createController({
  scope: 'telegram',
  requireAuth: false,
  repository: telegramBotRepo,
  register: (addListener, repository) => {
    startBot()

    onCommand('start', ctx => {
      Promise.all([
        ctx.replyWithHTML(
          `Привет! Я – Foxy бот! 🦊\n\n<b>Мы все еще запускаемся</b>, но можем <b>уведомить тебя сразу же</b>, как откроемся!\n\n<b>Просто нажми</b> на /notify, или введи эту команду вручную!`,
        ),
        ctx.sendSticker(
          'CAACAgIAAxkBAANjYw0eE1_z_Fudt6PvpPqYr2iGj5YAAvUNAAL10ChJxQrXMg-cYYkpBA',
        ),
      ]).catch(e => justLog.warn(`Telegram: start ${e.message}`))
      const started = repository.isStarted(ctx.from.id)
      if (!started) {
        repository.startMetrics({
          id: ctx.from.id,
          name: `${ctx.from.first_name || ''} ${ctx.from.last_name || ''}`,
          username: ctx.from.username,
        })
      }
    })

    onCommand('help', ctx => {
      Promise.all([
        ctx.replyWithHTML(
          'Нужна помощь? Все просто: \n\n/start - приветствие с актуальной информацией, \n/notify - подписаться на обновления прямо сейчас 😍',
        ),
        ctx.sendSticker(
          'CAACAgIAAxkBAANZYw0dS4nOMj_HTEmcfhSGWoV-EqkAAuYMAAKbqShJzLHHIeJdX8opBA',
        ),
      ]).catch(e => justLog.warn(`Telegram: help ${e.message}`))
    })

    onCommand('notify', ctx => {
      const subscribed = repository.isSubscribed(ctx.from.id)
      if (!subscribed) {
        Promise.all([
          ctx.replyWithHTML(
            'Это чудесно! Добро пожаловать!\n\nКак только мы запустимся - мы уведомим тебя, и ты сможешь создать аккаунт в числе первых! 🥵',
          ),
          ctx.sendSticker(
            'CAACAgIAAxkBAANhYw0dnVpzJDwqrVAnX_qz0YjG2bIAAjIUAAKPOilJ5cTrWhS4MZ8pBA',
          ),
        ]).catch(e => justLog.warn(`Telegram: notify new ${e.message}`))
        repository.subscribeMetrics({
          id: ctx.from.id,
          name: `${ctx.from.first_name || ''} ${ctx.from.last_name || ''}`,
          username: ctx.from.username,
        })
      } else {
        ctx
          .replyWithHTML(
            'Не переживай, про тебя мы помним) \n\nПока остается просто ждать 😌',
          )
          .catch(e => justLog.warn(`Telegram: notify old ${e.message}`))
      }
    })

    return () => {
      stopBot('SIGINT')
    }
  },
})
