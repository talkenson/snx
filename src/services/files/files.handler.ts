import { Router } from 'express'
import multer from 'multer'
import sharp from 'sharp'
import {
  AWS_ACCESS_KEY,
  AWS_BUCKET,
  AWS_SECRET_KEY,
  AWS_SERVER,
} from '@/config/secrets'
import fileTokensStore from '@/services/files/stores/fileTokens.store'
import { exists } from '@/utils/exists'
import AWS from 'aws-sdk'

const s3 = new AWS.S3({
  endpoint: AWS_SERVER,
  accessKeyId: AWS_ACCESS_KEY,
  secretAccessKey: AWS_SECRET_KEY,
  sslEnabled: true,
  s3ForcePathStyle: true,
  signatureVersion: 'v4',
})

export const filesHandler = Router().post(
  '/upload/:token',
  multer().single('file'),
  async (req, res) => {
    const resolve = (result: any) =>
      res.json({ status: 'resolved', result: result })

    const reject = (result: any) =>
      res.json({ status: 'rejected', result: result })

    if (typeof req.body !== 'object') {
      return reject({ reason: 'UNSUPPORTED_PAYLOAD' })
    }

    if (!req.params.token || req.params.token.length < 4) {
      return reject({
        reason: 'INVALID_PAYLOAD',
        description: 'token parameter must be provided',
      })
    }

    const fileUploadRequest = fileTokensStore.get(req.params.token)

    if (!exists(fileUploadRequest)) {
      return reject({ reason: 'INVALID_UPLOAD_TOKEN' })
    }

    const { file } = req as typeof req & { file: { buffer: Buffer } }

    if (!file?.buffer) {
      return reject({ reason: 'MEDIA_NOT_PRESENTED' })
    }

    const buffer = await sharp(file.buffer)
      .jpeg({
        quality: 90,
      })
      .toBuffer()

    const uploaded = await s3
      .upload({
        Bucket: AWS_BUCKET,
        Key: fileUploadRequest.filenames[0],
        Body: buffer,
      })
      .promise()

    return resolve({
      location: `${uploaded.Bucket}/${uploaded.Key}`,
      key: uploaded.Key,
    })
  },
)
