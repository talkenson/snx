import { writeFile, readFile, mkdir } from 'fs/promises'
import path from 'path'
import { justLog } from '@/utils/justLog'

const METRICS_PATH = import.meta.env.VITE_METRICS_PATH

export const openFile = <Type extends Record<string, any>>(
  storageName: string,
) => {
  return {
    async write(data: any) {
      const dir = await mkdir(METRICS_PATH, { recursive: true })
      justLog.info(`DUMP: Writing "${storageName}" store (dir: ${dir})`)
      return writeFile(
        path.join(METRICS_PATH, `${encodeURIComponent(storageName)}.dump`),
        JSON.stringify(data),
        {
          encoding: 'utf-8',
        },
      )
    },
    async read() {
      justLog.info(`DUMP: Reading "${storageName}" store`)
      return readFile(
        path.join(METRICS_PATH, `${encodeURIComponent(storageName)}.dump`),
        {
          encoding: 'utf-8',
        },
      )
        .then(r => JSON.parse(r) as Type)
        .catch(e => {
          justLog.warn(
            `Can't load "${storageName}" (using empty store), error: ${e?.message}`,
          )
          return {} as Type
        })
    },
  }
}
