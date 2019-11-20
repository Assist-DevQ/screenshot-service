import { Storage, GetSignedUrlConfig } from '@google-cloud/storage'
import logger from '../../common/logger'

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

  public async upload(filename: string): Promise<void> {
    try {
      await this.storageClient.bucket(this.bucketName).upload(filename, {
        gzip: true,
        metadata: {
          cacheControl: 'public, max-age=31536000'
        }
      })
      console.log('Done:', filename)
    } catch (err) {
      logger.error(err)
    }
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
}
