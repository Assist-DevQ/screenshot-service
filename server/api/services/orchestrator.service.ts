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
import { IScenarioMeta, IScenarioFiles, IScenarioDiff, IDiffFile, IEventFile, IGenerateResult } from './types/scenario'
import rimraf from 'rimraf'
import { IScreenMeta, IDiffMeta } from './types/code-meta'
import { IOrchestratorConfig } from './types/orchestrator-config'
import { DiffOrchestrator } from './DiffOrchestrator.service'

export class Orchestrator {
  private readonly scrDir: string = 'screens'
  private readonly github: GithubService
  private readonly tar: TarService
  private readonly screens: ScreenService
  private readonly storage: GCStorage
  private readonly backApi: BackEndAPI
  private readonly diffOrchestrator: DiffOrchestrator

  constructor(conf: IOrchestratorConfig) {
    this.github = conf.github
    this.tar = conf.tar
    this.screens = conf.screens
    this.storage = conf.storage
    this.backApi = conf.backApi
    this.diffOrchestrator = conf.diffOrchestrator
  }

  public async generateFlow(baseRepo: IRepoConfig, diffRepo: IRepoConfig): Promise<IScenarioDiff[]> {
    const baseGen = this.generateScreensFlow(baseRepo, 'base')
    const diffGen = this.generateScreensFlow(diffRepo, 'diff')
    const [baseRes, diffRes] = await Promise.all([baseGen, diffGen])
    try {
      const grouped = this.groupByScenario(baseRes.screens, diffRes.screens)
      const diffs = await this.diffOrchestrator.generateDiff(grouped)
      const finalRes: IScenarioDiff[] = []
      diffs.forEach((v: Map<number, IDiffFile>, sId: number) => {
        const files: IDiffFile[] = []
        v.forEach((v: IDiffFile, eId: number) => {
          files.push(v)
        })
        const meta: IDiffMeta = {
          projectId: baseRepo.projectId,
          scenarioId: sId,
          commitId: baseRes.commitId
        }
        finalRes.push({ meta, files })
      })
      return finalRes
    } finally {
      this.cleanUp(`${baseRes.outDir}/**/*.png`)
      this.cleanUp(`${diffRes.outDir}/**/*.png`)
    }
  }

  private async generateScreensFlow(repo: IRepoConfig, tag: string): Promise<IGenerateResult> {
    const gitRes = await this.github.repoReadStreamAxios(repo)
    const dir = await this.tar.extract(gitRes.codeStream, repo)
    const codeDir = path.normalize([dir, gitRes.folderName].join('/'))
    await DockerService.build(codeDir, repo.repo, gitRes.commitId)
    const freePort = await getPort()
    const runningProc = await DockerService.run(codeDir, freePort, repo.repo, gitRes.commitId)
    const outDir = `${this.scrDir}/${repo.projectId}/${repo.branch}/${gitRes.commitId}`
    try {
      await this.tar.createDir(outDir)
      const screens = await this.generateScreens(gitRes.commitId, repo.projectId, outDir, freePort, tag)
      return { commitId: gitRes.commitId, outDir, screens }
    } finally {
      logger.warn('Screens done, killing the test server:', runningProc.pid)
      runningProc.kill()
      this.cleanUp(codeDir)
    }
  }

  private async generateScreens(commitId: string, projectId: number, outDir: string, freePort: number, tag: string): Promise<IScenarioFiles[]> {
    const scenarios = await this.backApi.getScenarios(projectId)
    const m: (s: IScenarioMeta) => IScreenMeta = (s: IScenarioMeta) => ({ commitId, projectId, scenarioId: s.id, outDir, tag })
    return Promise.all(scenarios.map((s: IScenarioMeta) => this.generateAndStore(m(s), freePort)))
  }

  private async generateAndStore(meta: IScreenMeta, freePort: number): Promise<IScenarioFiles> {
    const scenarioData = await this.backApi.getScenarioEvents(meta.projectId, meta.scenarioId)
    const files = await this.screens.generateScreens(meta, scenarioData.events, freePort)
    // const files = await this.storage.uploadAll(images) //TODO: remove
    return { meta, files }
  }

  private cleanUp(codeDir: string): void {
    logger.info('ready to clean :', codeDir)
    rimraf(codeDir, this.onCleanErr(codeDir))
  }

  private onCleanErr(dir: string): (err: Error) => void {
    return (err: Error) => {
      if (err) {
        logger.error(`Error removing ${dir}`, err)
      }
      logger.info('Removed :', dir)
    }
  }

  private groupByScenario(base: IScenarioFiles[], diff: IScenarioFiles[]): Map<number, Map<number, IDiffFile>> {
    const grouped = new Map<number, Map<number, IDiffFile>>()
    base.forEach((s: IScenarioFiles) => {
      const baseFiles = s.files
      const diffFiles = diff.find((d: IScenarioFiles) => d.meta.scenarioId === s.meta.scenarioId).files
      const newFiles = new Map<number, IDiffFile>()
      baseFiles.forEach((b: IEventFile) => {
        const other = diffFiles.find((f: IEventFile) => f.eventId === b.eventId)
        const newFile: IDiffFile = {
          eventId: b.eventId,
          baseFileUrl: b.fileUrl,
          diffFileUrl: other.fileUrl
        }
        newFiles.set(b.eventId, newFile)
      })
      grouped.set(s.meta.scenarioId, newFiles)
    })
    return grouped
  }
}
