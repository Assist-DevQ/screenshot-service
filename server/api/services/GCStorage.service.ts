import { Storage, GetSignedUrlConfig } from '@google-cloud/storage'
import logger from '../../common/logger'
import { Readable } from 'stream'
import { IEventFile } from './types/scenario'

export class GCStorage {
  private readonly storageClient: Storage
  private readonly bucketName: string = 'dev-q-screens'
  private readonly signOptions: GetSignedUrlConfig = {
    version: 'v4',
    action: 'read',
    expires: Date.now() + 6 * 24 * 60 * 60 * 1000 // 7 days - MAX
  }

  constructor() {
    logger.warn('creating new GCS')
    this.storageClient = new Storage()
  }

  public async listBuckets(): Promise<void> {
    try {
      const buckets = await this.storageClient.getBuckets()
      console.log('Buckets:', buckets)
    } catch (err) {
      logger.error(err)
    }
  }

  public async uploadAll(files: IEventFile[]): Promise<IEventFile[]> {
    const ups = files.map((f: IEventFile) => this.upload(f))
    return Promise.all(ups)
  }

  public async upload(fileMeta: IEventFile): Promise<IEventFile> {
    try {
      const [file, _] = await this.storageClient.bucket(this.bucketName).upload(fileMeta.fileUrl, {
        gzip: true,
        metadata: {
          cacheControl: 'public, max-age=31536000'
        }
      })
      await file.makePublic()
      return {eventId: fileMeta.eventId, fileUrl: this.getPublicUrl(file.metadata.name)}
    } catch (err) {
      logger.error(err)
    }
  }

  public uploadStream(filename: string, file: Readable): Promise<string> {
    return new Promise((res, rej) => {
      const fileStream = this.storageClient.bucket(this.bucketName).file(filename)
      const stream = fileStream.createWriteStream({
        metadata: {
          contentType: 'image/png'
        },
        resumable: false
      })
      stream.on('error', rej)
      stream.on('finish', () => {
        fileStream
          .makePublic()
          .then(() => res(this.getPublicUrl(filename)))
          .catch(rej)
      })
      file.pipe(stream)
    })
  }

  public async signUrl(filename: string): Promise<string> {
    try {
      const [url] = await this.storageClient
        .bucket(this.bucketName)
        .file(filename)
        .getSignedUrl(this.signOptions)
      return url
    } catch (err) {
      logger.error(err)
    }
  }

  public getPublicUrl(filename) {
    return `https://storage.googleapis.com/${this.bucketName}/${filename}`
  }
}
