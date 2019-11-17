import { Request, Response } from 'express'
import { ScreenService } from '../../services/screen.service'

import events from '../../../../test-events.json'
import { IEvent } from '../../services/types/events'
import { GithubService } from '../../services/github.service'
import { TarService } from '../../services/tar.service'
import { IRepoConfig } from '../../services/types/repo-config'
import logger from '../../../common/logger'

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
  public async download(req: Request, res: Response): Promise<void> {
    const git = new GithubService({ baseUrl: process.env.GITHUB_BASE, archiveType: process.env.GITHUB_FORMAT })
    const tar = new TarService(process.env.CODE_DIR)
    const repo = req.body as IRepoConfig
    logger.info('Down for:', repo)
    try {
      const gitRes = await git.repoReadStreamAxios(repo)
      const path = await tar.extract(gitRes.codeStream, repo)
      res.status(200).json({ path: `${path}/${gitRes.folderName}` })
    } catch (e) {
      res.status(500).json({ Err: e.message })
    }
  }
}
export default new Controller()
