import crypto from 'crypto'
import { TELEGRAM_BOT_TOKEN } from '@/config/integrations'
import { TelegramDataPayload } from '@/types/payloads/TelegramInputAuth.types'

type ReturnType<Status extends boolean> = Status extends true
  ? { status: true; data: TelegramDataPayload }
  : Status extends false
  ? { status: false; data: { error: string } }
  : never

export const getAuthStateFromPayload = async (
  payload: TelegramDataPayload,
): Promise<ReturnType<boolean>> => {
  return new Promise(res => {
    const trashKeys = ['hash']
    const checkString = Object.entries(payload)
      .filter(([key]) => !trashKeys.includes(key))
      .sort(([k1], [k2]) => k1.localeCompare(k2))
      .map(([k, v]) => `${k}=${v}`)
      .join('\n')
    const secretKey = crypto
      .createHash('sha256')
      .update(TELEGRAM_BOT_TOKEN)
      .digest()
    const hmac = crypto
      .createHmac('sha256', secretKey)
      .update(checkString)
      .digest('hex')
    if (hmac === payload.hash) {
      res({ status: true, data: payload })
    } else {
      res({ status: false, data: { error: 'Not authorized' } })
    }
  })
}
