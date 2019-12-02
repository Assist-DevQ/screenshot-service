import { PixelDiff } from './PixelDiff'
import { GCStorage } from './GCStorage.service'
import { BackEndAPI } from './BackEndApi.sevice'

export class DiffOrchestrator {
  private readonly storage: GCStorage
  private readonly backApi: BackEndAPI
  private readonly pixDiff: PixelDiff

  constructor(storage: GCStorage, backApi: BackEndAPI, pixDiff: PixelDiff) {
    this.storage = storage
    this.backApi = backApi
    this.pixDiff = pixDiff
  }

  public async generateDiff(projectId: number): Promise<any> {}
}
