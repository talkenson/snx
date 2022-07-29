import express from 'express'
import jwt from 'jsonwebtoken'
import { CONTEXT_FALLBACK_CLIENT_ID, JWT_KEY } from '@/config/secrets'
import { ForeignContext } from '@/transporters/websocket/types'
import { authenticatePayload } from '@/utils/authentication/authenticatePayload'

const verify = (jwtToken?: string) =>
  new Promise<ForeignContext>(res => {
    if (!jwtToken) return res({ clientId: CONTEXT_FALLBACK_CLIENT_ID })
    jwt.verify(jwtToken, JWT_KEY as jwt.Secret, (err, payload) => {
      if (!err && payload && typeof payload !== 'string') {
        res(authenticatePayload(payload))
      }
      return res({ clientId: CONTEXT_FALLBACK_CLIENT_ID })
    })
  })

export const authenticationExpressMiddleware: express.RequestHandler = (
  req,
  res,
  next,
) => {
  if (!req.headers.authorization) {
    res.locals = { ...res.locals, clientId: CONTEXT_FALLBACK_CLIENT_ID }
    return next()
  }
  verify(req.headers.authorization.split(' ')[1]).then(context => {
    res.locals = { ...res.locals, ...context }
    next()
  })
}

export const authenticationSocketMiddleware = (authHeader?: string) =>
  new Promise<ForeignContext>(res => {
    if (!authHeader) return res({ clientId: CONTEXT_FALLBACK_CLIENT_ID })
    verify(authHeader.split(' ')[1]).then(result => res(result))
  })
