import { Router } from 'express'
import multer from 'multer'
import filesStore from '@/services/files/stores/files.store'

export const filesHandler = Router()
  .post('/upload', multer().single('file'), async (req, res) => {
    const { file } = req as typeof req & { file: { buffer: Buffer } }
    const rawB64 = file.buffer.toString('base64')

    const createdId = filesStore.create({ content: rawB64 }).id

    res.json({ id: createdId })
  })
  .post('/save64', (req, res) => {
    const { b64content } = req.body

    const createdId = filesStore.create({
      content: b64content.split('base64,')[1],
    }).id

    res.json({ id: createdId })
  })
