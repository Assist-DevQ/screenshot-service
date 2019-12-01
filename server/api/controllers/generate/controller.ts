import { Request, Response } from 'express'
import { IRepoConfig } from '../../services/types/repo-config'
import logger from '../../../common/logger'
import { Orchestrator } from '../../services/orchestrator.service'

export class ScreensController {
  private readonly orchestrator: Orchestrator
  constructor(orchestrator: Orchestrator) {
    this.orchestrator = orchestrator
  }

  public async startFlow(req: Request, res: Response): Promise<void> {
    try {
      const files = await this.orchestrator.generateFlow(req.body as IRepoConfig)
      res.status(200).json({ files })
    } catch (err) {
      logger.error('Something blew up:', err.message, err.stack)
      res.status(500).json({ error: err.message })
    }
  }
}
export default ScreensController
