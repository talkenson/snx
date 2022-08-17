import app from '@/base/expressApp'
import { jsonParseError } from '@/middlewares/rest/jsonParseError'
import { filesHandler } from '@/services/files/files.handler'

app.use(jsonParseError(app))

app.get('/', (req, res) => res.json({ greeting: "Hello! It's Póke!" }))

app.use('/uploads', filesHandler)

export { app }
