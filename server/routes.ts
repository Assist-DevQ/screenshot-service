import { Application } from 'express'
import generateRouter from './api/controllers/generate/router'
import diffRouter from './api/controllers/diff/router'
import { Orchestrator } from './api/services/orchestrator.service'
import { DiffOrchestrator } from './api/services/DiffOrchestrator.service'

export default (o: Orchestrator, dor: DiffOrchestrator) => function routes(app: Application): void {
  app.use('/api/v1/generate', generateRouter(o))
  app.use('/api/v1/diff', diffRouter(dor))
}
