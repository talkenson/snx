import AWS from 'aws-sdk'
import { Router } from 'express'
import multer from 'multer'
import sharp from 'sharp'
import {
  AWS_ACCESS_KEY,
  AWS_BUCKET,
  AWS_SECRET_KEY,
  AWS_SERVER,
  AWS_SSL_ENABLED,
} from '@/config/secrets'
import { FilesError } from '@/services/files/etc/files.error'
import fileTokensStore from '@/services/files/stores/fileTokens.store'
import { exists } from '@/utils/exists'

const s3 = new AWS.S3({
  endpoint: AWS_SERVER,
  accessKeyId: AWS_ACCESS_KEY,
  secretAccessKey: AWS_SECRET_KEY,
  sslEnabled: AWS_SSL_ENABLED,
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
      return reject({ reason: FilesError.UnsupportedPayload })
    }

    if (!req.params.token || req.params.token.length < 4) {
      return reject({
        reason: FilesError.InvalidPayload,
        description: 'token parameter must be provided',
      })
    }

    const fileUploadRequest = fileTokensStore.get(req.params.token)

    if (!exists(fileUploadRequest)) {
      return reject({ reason: FilesError.InvalidUploadToken })
    }

    const { file } = req as typeof req & { file: { buffer: Buffer } }

    if (!file?.buffer) {
      return reject({ reason: FilesError.MediaNotPresented })
    }
    try {
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
    } catch (e) {
      return reject({
        reason: FilesError.ImageUploadError,
        description: JSON.stringify(e),
      })
    }
  },
)
