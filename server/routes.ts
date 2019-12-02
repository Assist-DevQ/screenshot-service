import { Application } from 'express'
import generateRouter from './api/controllers/generate/router'
import { Orchestrator } from './api/services/orchestrator.service'

export default (o: Orchestrator) => function routes(app: Application): void {
  app.use('/api/v1/generate', generateRouter(o))
}
