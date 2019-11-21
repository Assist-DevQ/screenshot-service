import { ScreenService } from './screen.service'
import { GithubService } from './github.service'
import { DockerService } from './docker.service'
import { GCStorage } from './GCStorage.service'
import { IRepoConfig } from './types/repo-config'
import { TarService } from './tar.service'
import path from 'path'
import getPort from 'get-port'
import { IEvent } from './types/events'
import logger from '../../common/logger'

export class Orchestrator {
  private readonly github: GithubService
  private readonly tar: TarService
  private readonly screens: ScreenService
  private readonly storage: GCStorage

  constructor(github: GithubService, tar: TarService, screens: ScreenService, storage: GCStorage) {
    this.github = github
    this.tar = tar
    this.screens = screens
    this.storage = storage
  }

  public async generateFlow(repo: IRepoConfig, events: IEvent[]): Promise<string[]> {
    const gitRes = await this.github.repoReadStreamAxios(repo)
    const dir = await this.tar.extract(gitRes.codeStream, repo)
    const codeDir = path.normalize([dir, gitRes.folderName].join('/'))
    await DockerService.build(codeDir, repo.repo, gitRes.commitId)
    const freePort = await getPort()
    const runningProc = await DockerService.run(codeDir, freePort, repo.repo, gitRes.commitId)
    try {
      const imgs = await this.screens.generateScreens(events, freePort)
      const files = await this.storage.uploadAll(imgs)
      return files
    } finally {
      logger.warn('Screens done, killing the test server:', runningProc.pid)
      runningProc.kill()
    }
  }
}
