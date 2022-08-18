import Mail from 'nodemailer/lib/mailer'

export type MailMessage = Pick<
  Mail.Options,
  'subject' | 'text' | 'html' | 'attachments'
>
