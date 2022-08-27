import axios from 'axios'
import {
  VK_CLIENT_DEFAULT_REDIRECT,
  VK_CLIENT_ID,
  VK_CLIENT_SECRET,
} from '@/config/integrations'

interface Success {
  access_token: string
  expires_in: number
  user_id: number
  email?: string
}

interface Error {
  error: string //"invalid_grant"
  error_description: string
}

type Response = Success | Error

type ReturnType<Status extends boolean> = Status extends true
  ? { status: true; data: Success }
  : Status extends false
  ? { status: false; data: Error }
  : never

export const getAccessTokenFromCode = async (
  code: string,
): Promise<ReturnType<boolean>> => {
  const data = (
    await axios.get<Response>('https://oauth.vk.com/access_token', {
      params: {
        client_id: VK_CLIENT_ID,
        client_secret: VK_CLIENT_SECRET,
        redirect_url: VK_CLIENT_DEFAULT_REDIRECT,
        code: code,
      },
    })
  ).data

  if (Object.prototype.hasOwnProperty.call(data, 'error')) {
    return { status: false, data: data as Error }
  } else {
    return { status: true, data: data as Success }
  }
}
