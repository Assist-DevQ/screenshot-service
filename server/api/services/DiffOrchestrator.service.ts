import { PixelDiff } from './PixelDiff'
import { GCStorage } from './GCStorage.service'
import { IDiffFile } from './types/scenario'
import { promises } from 'fs'

export class DiffOrchestrator {
  private readonly storage: GCStorage
  private readonly pixDiff: PixelDiff

  constructor(storage: GCStorage, pixDiff: PixelDiff) {
    this.storage = storage
    this.pixDiff = pixDiff
  }

  public async generateDiff(files: Map<number, Map<number, IDiffFile>>): Promise<Map<number, Map<number, IDiffFile>>> {
    const parProm = []
    files.forEach((sf: Map<number, IDiffFile>, sId: number) => {
      sf.forEach((df: IDiffFile, eId: number) => {
        parProm.push(this.diff(df))
      })
    })
    await Promise.all(parProm)
    return files
  }

  private async diff(df: IDiffFile): Promise<void> {
    const baseFile = await promises.readFile(df.baseFileUrl)
    const compFile = await promises.readFile(df.diffFileUrl)
    const diff = await this.pixDiff.compare(baseFile, compFile)
    const uploads = [this.storage.upload(df.baseFileUrl)]
    if (diff.hasDiff) {
      uploads.push(this.storage.uploadStream(df.diffFileUrl, diff.diff))
    } else {
      uploads.push(this.storage.upload(df.diffFileUrl))
    }
    const [baseUrl, difUrl] = await Promise.all(uploads)
    df.baseFileUrl = baseUrl
    df.diffFileUrl = difUrl
    df.hasDiff = diff.hasDiff
  }
}
