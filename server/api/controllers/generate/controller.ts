import { Request, Response } from 'express'
import { IRepoConfig, IRepoDiff } from '../../services/types/repo-config'
import logger from '../../../common/logger'
import { Orchestrator } from '../../services/orchestrator.service'

export class ScreensController {
  private readonly orchestrator: Orchestrator
  constructor(orchestrator: Orchestrator) {
    this.orchestrator = orchestrator
  }

  public async startFlow(req: Request, res: Response): Promise<void> {
    try {
      const body: IRepoDiff = req.body
      const baseConf: IRepoConfig = {
        projectId: body.projectId,
        user: body.user,
        repo: body.repo,
        branch: body.baseBranch
      }
      const diffConf: IRepoConfig = {
        projectId: body.projectId,
        user: body.user,
        repo: body.repo,
        branch: body.diffBranch
      }
      const files = await this.orchestrator.generateFlow(baseConf, diffConf)
      res.status(200).json({ files })
    } catch (err) {
      logger.error('Something blew up:', err.message, err.stack)
      res.status(500).json({ error: err.message })
    }
  }
}
export default ScreensController
