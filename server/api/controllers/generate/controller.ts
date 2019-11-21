import { Request, Response } from 'express'
import events from '../../../../test-events.json'
import { IEvent } from '../../services/types/events'
import { IRepoConfig } from '../../services/types/repo-config'
import logger from '../../../common/logger'
import { Orchestrator } from '../../services/orchestrator.service'

export class ScreensController {
  private readonly orchestrator: Orchestrator
  constructor(orchestrator: Orchestrator) {
    this.orchestrator = orchestrator
  }

  // public async create(req: Request, res: Response): Promise<void> {
  //   const serv = await ScreenService.build()
  //   // serv.generateScreens((events as IEvent[]).reverse()).then(() =>
  //   res
  //     .status(201)
  //     .location(`/api/v1/generate/${req.body.id}`)
  //     .json({ working: true })
  //   // )
  // }

  public async startFlow(req: Request, res: Response): Promise<void> {
    try {
      const files = await this.orchestrator.generateFlow(req.body as IRepoConfig, (events as IEvent[]).reverse())
      res.status(200).json({ files })
    } catch (err) {
      logger.error('Something blew up:', err.message, err.stack)
      res.status(500).json({ error: err })
    }
  }
  // public async gcs(req: Request, res: Response): Promise<void> {
  //   const gcs = new GCStorage()
  //   try {
  //     // const url = await gcs.signUrl('1573921915949-start-.png')
  //     await gcs.upload('./screens/1573921915949-start-.png')
  //     res.status(200).json({})
  //   } catch (e) {
  //     res.status(500).json({ Err: e.message })
  //   }
  // }

  // public async download(req: Request, res: Response): Promise<void> {
  //   const git = new GithubService({ baseUrl: process.env.GITHUB_BASE, archiveType: process.env.GITHUB_FORMAT })
  //   const tar = new TarService(process.env.CODE_DIR)
  //   const repo = req.body as IRepoConfig
  //   logger.info('Down for:', repo)
  //   try {
  //     const gitRes = await git.repoReadStreamAxios(repo)
  //     const dir = await tar.extract(gitRes.codeStream, repo)
  //     const codeDir = path.normalize([dir, gitRes.folderName].join('/'))
  //     await DockerService.build(codeDir, repo.repo, gitRes.commitId)
  //     const freePort = await getPort()
  //     const runningPid = await DockerService.run(codeDir, freePort, repo.repo, gitRes.commitId)
  //     setTimeout(() => {
  //       logger.info('Stopping docker run')
  //       runningPid.kill()
  //     }, 30000)
  //     res.status(200).json({ path: codeDir, pid: runningPid.pid })
  //   } catch (e) {
  //     res.status(500).json({ Err: e.message })
  //   }
  // }
}
export default ScreensController
