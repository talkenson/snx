import express from 'express'
import jwt from 'jsonwebtoken'
import { JWT_KEY } from '@/config/secrets'
import { authenticatePayload } from '@/utils/authentication/authenticatePayload'

const verify = (jwtToken?: string) =>
  new Promise(res => {
    if (!jwtToken) return res(undefined)
    jwt.verify(jwtToken, JWT_KEY as jwt.Secret, (err, payload) => {
      if (!err && payload && typeof payload !== 'string') {
        res(authenticatePayload(payload))
      }
      return res(undefined)
    })
  })

export const authenticationExpressMiddleware: express.RequestHandler = (
  req,
  res,
  next,
) => {
  if (!req.headers.authorization) return next()
  verify(req.headers.authorization.split(' ')[1]).then(user => {
    res.locals.user = user
    next()
  })
}

export const authenticationSocketMiddleware = (authHeader?: string) =>
  new Promise(res => {
    if (!authHeader) return res(undefined)
    verify(authHeader.split(' ')[1]).then(result => res(result))
  })
