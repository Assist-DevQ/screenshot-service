import { ScreenService } from './screen.service'
import { GithubService } from './github.service'
import { DockerService } from './docker.service'
import { GCStorage } from './GCStorage.service'
import { IRepoConfig } from './types/repo-config'
import { TarService } from './tar.service'
import path from 'path'
import getPort from 'get-port'
import logger from '../../common/logger'
import { BackEndAPI } from './BackEndApi.sevice'
import { IScenarioFiles, IScenarioMeta } from './types/scenario'

export class Orchestrator {
  private readonly github: GithubService
  private readonly tar: TarService
  private readonly screens: ScreenService
  private readonly storage: GCStorage
  private readonly backApi: BackEndAPI

  constructor(github: GithubService, tar: TarService, screens: ScreenService, storage: GCStorage, backApi: BackEndAPI) {
    this.github = github
    this.tar = tar
    this.screens = screens
    this.storage = storage
    this.backApi = backApi
  }

  public async generateFlow(repo: IRepoConfig): Promise<IScenarioFiles[]> {
    const gitRes = await this.github.repoReadStreamAxios(repo)
    const dir = await this.tar.extract(gitRes.codeStream, repo)
    const codeDir = path.normalize([dir, gitRes.folderName].join('/'))
    await DockerService.build(codeDir, repo.repo, gitRes.commitId)
    const freePort = await getPort()
    const runningProc = await DockerService.run(codeDir, freePort, repo.repo, gitRes.commitId)
    try {
      const screens = await this.generateScreens(repo.projectId, freePort)
      return screens
    } finally {
      logger.warn('Screens done, killing the test server:', runningProc.pid)
      runningProc.kill()
      this.cleanUp(codeDir, 'screens/')
    }
  }

  private async generateScreens(projectId: number, freePort: number): Promise<IScenarioFiles[]> {
    const scenarios = await this.backApi.getScenarios(projectId)
    return Promise.all(scenarios.map((s: IScenarioMeta) => this.generateAndStore(projectId, s.id, freePort)))
  }

  private async generateAndStore(projectId: number, scenarioId: number, freePort: number): Promise<IScenarioFiles> {
    const scenarioData = await this.backApi.getScenarioEvents(projectId, scenarioId)
    const images = await this.screens.generateScreens(scenarioData.events.reverse(), freePort)
    const files = await this.storage.uploadAll(images)
    return {scenarioId, files}
  }

  private async cleanUp(codeDir: string, screensDir: string): Promise<void> {
    fs
  }
}
