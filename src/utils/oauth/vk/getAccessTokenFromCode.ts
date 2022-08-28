import axios from 'axios'
import {
  VK_CLIENT_DEFAULT_REDIRECT,
  VK_CLIENT_ID,
  VK_CLIENT_SECRET,
} from '@/config/integrations'
import { justLog } from '@/utils/justLog'

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
  return new Promise((res, rej) => {
    axios
      .get<Response>('https://oauth.vk.com/access_token', {
        params: {
          client_id: VK_CLIENT_ID,
          client_secret: VK_CLIENT_SECRET,
          redirect_uri: VK_CLIENT_DEFAULT_REDIRECT,
          code: code,
        },
      })
      .then(r => {
        if (Object.prototype.hasOwnProperty.call(r.data, 'error')) {
          return res({ status: false, data: r.data as Error })
        } else {
          return res({ status: true, data: r.data as Success })
        }
      })
      .catch(e => {
        justLog.error(e)
        return res({
          status: false,
          data: {
            error: 'internal_common_error',
            error_description: e?.message || '',
          },
        })
      })
  })
}
