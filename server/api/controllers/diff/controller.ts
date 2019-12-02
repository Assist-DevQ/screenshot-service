import { Request, Response } from 'express'
import logger from '../../../common/logger'
import { DiffOrchestrator } from '../../services/DiffOrchestrator.service'

export class DiffController {
  private readonly orchestrator: DiffOrchestrator
  constructor(orchestrator: DiffOrchestrator) {
    this.orchestrator = orchestrator
  }

  public async startFlow(req: Request, res: Response): Promise<void> {
    try {
      const files = await this.orchestrator.generateDiff(req.body.projectId)
      res.status(200).json({ files })
    } catch (err) {
      logger.error('Something blew up:', err.message, err.stack)
      res.status(500).json({ error: err.message })
    }
  }
}
export default DiffController
