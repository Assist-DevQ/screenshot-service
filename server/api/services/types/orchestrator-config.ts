import { GithubService } from '../github.service'
import { TarService } from '../tar.service'
import { ScreenService } from '../screen.service'
import { GCStorage } from '../GCStorage.service'
import { BackEndAPI } from '../BackEndApi.sevice'
import { DiffOrchestrator } from '../DiffOrchestrator.service'

export interface IOrchestratorConfig {
  github: GithubService
  tar: TarService
  screens: ScreenService
  storage: GCStorage
  backApi: BackEndAPI
  diffOrchestrator: DiffOrchestrator
}
