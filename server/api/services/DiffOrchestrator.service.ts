import { PixelDiff } from './PixelDiff'
import { GCStorage } from './GCStorage.service'
import { BackEndAPI } from './BackEndApi.sevice'
import { IDiffFile } from './types/scenario'

export class DiffOrchestrator {
  private readonly storage: GCStorage
  private readonly pixDiff: PixelDiff

  constructor(storage: GCStorage, pixDiff: PixelDiff) {
    this.storage = storage
    this.pixDiff = pixDiff
  }

  public async generateDiff(files: Map<number, Map<number, IDiffFile>>): Promise<Map<number, Map<number, IDiffFile>>> {
    return files
  }
}
