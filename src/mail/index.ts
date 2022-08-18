import fs from 'fs'
import path from 'path'
import nodemailer from 'nodemailer'
import Mail from 'nodemailer/lib/mailer'
import {
  MAIL_DNS_CHECK_SELECTOR,
  MAIL_LOGIN,
  MAIL_ORIGIN_DOMAIN,
  MAIL_PASSWORD,
  MAIL_PRIVATE_KEY_FILENAME,
  MAIL_SMTP_SERVER,
} from '@/config/mail'
import { MailMessage } from '@/types/mail.types'
import { addBeforeExitHook } from '@/utils/beforeExitHook'
import { justLog } from '@/utils/justLog'

const keyFilename = MAIL_PRIVATE_KEY_FILENAME
  ? path.resolve(__dirname, '../../', MAIL_PRIVATE_KEY_FILENAME)
  : path.resolve(__dirname, './privatekey.pem')

const privateKey = fs.readFileSync(keyFilename, 'utf-8')

const transporter = nodemailer.createTransport(
  {
    host: MAIL_SMTP_SERVER,
    port: 465,
    secure: true,
    auth: {
      user: MAIL_LOGIN,
      pass: MAIL_PASSWORD,
    },
    logger: true,
    transactionLog: true, // include SMTP traffic in the log
    dkim: {
      domainName: MAIL_ORIGIN_DOMAIN,
      keySelector: MAIL_DNS_CHECK_SELECTOR,
      privateKey: privateKey,
    },
  } as any,
  {
    // sender info
    from: 'Foxy <noreply@talkiiing.ru>',
  },
)

addBeforeExitHook(() => {
  justLog.log('Closing Mail connections...')
  transporter.close()
})

export const sendMessage = async (
  to: Mail.Options['to'],
  message: MailMessage,
) => {
  const builtMessage: Mail.Options = {
    to: `<${to}>`,
    ...message,
  }

  return new Promise((res, rej) =>
    transporter.sendMail(builtMessage, (error, info) => {
      if (error) {
        console.log('Error occurred')
        console.log(error.message)
        rej(error)
      }
      res(info)
    }),
  )
}

//sendMessage('vetka921@gmail.com', getFilledTemplate({ code: '34ERT6' }))
