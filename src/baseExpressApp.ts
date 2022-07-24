import cors from 'cors'
import express from 'express'

const baseExpressApp = express()

baseExpressApp.use(
  cors({
    origin: '*',
  }),
)

baseExpressApp.use(express.json())

export default baseExpressApp
