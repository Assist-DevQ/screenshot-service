import { Request, Response } from 'express'
import { ScreenService } from '../../services/screen.service'

import events from '../../../../test-events.json'
import { IEvent } from '../../services/types/events'
import { GithubService } from '../../services/github.service'
import { TarService } from '../../services/tar.service'
import { IRepoConfig } from '../../services/types/repo-config'
import logger from '../../../common/logger'
import path from 'path'
import { DockerService } from '../../services/docker.service'
import { GCStorage } from '../../services/GCStorage.service'

export class Controller {
  public async create(req: Request, res: Response): Promise<void> {
    const serv = await ScreenService.build()
    serv.generateScreens((events as IEvent[]).reverse()).then(() =>
      res
        .status(201)
        .location(`/api/v1/generate/${req.body.id}`)
        .json({ working: true })
    )
  }

  public async gcs(req: Request, res: Response): Promise<void> {
    const gcs = new GCStorage()
    try {
      // await gcs.upload('./screens/1573921915949-start-.png')
      const url = await gcs.signUrl('1573921915949-start-.png')
      res.status(200).json({url})
    } catch (e) {
      res.status(500).json({ Err: e.message })
    }
  }

  public async download(req: Request, res: Response): Promise<void> {
    const git = new GithubService({ baseUrl: process.env.GITHUB_BASE, archiveType: process.env.GITHUB_FORMAT })
    const tar = new TarService(process.env.CODE_DIR)
    const repo = req.body as IRepoConfig
    logger.info('Down for:', repo)
    try {
      const gitRes = await git.repoReadStreamAxios(repo)
      const dir = await tar.extract(gitRes.codeStream, repo)
      const codeDir = path.normalize([dir, gitRes.folderName].join('/'))
      await DockerService.build(codeDir, repo.repo, gitRes.commitId)
      const runningPid = DockerService.run(codeDir, repo.repo, gitRes.commitId)
      runningPid.stdout.pipe(process.stdout)
      runningPid.stderr.pipe(process.stderr)
      setTimeout(() => {
        logger.info('Stopping docker run')
        runningPid.kill()
      }, 30000)
      res.status(200).json({ path: codeDir, pid: runningPid.pid })
    } catch (e) {
      res.status(500).json({ Err: e.message })
    }
  }
}
export default new Controller()
