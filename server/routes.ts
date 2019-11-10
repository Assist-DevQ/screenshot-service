import { Application } from 'express'
import generateRouter from './api/controllers/generate/router'
export default function routes(app: Application): void {
  app.use('/api/v1/generate', generateRouter)
}
