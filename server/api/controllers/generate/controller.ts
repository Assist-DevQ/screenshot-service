import ExamplesService from '../../services/code.service'
import { Request, Response } from 'express'

export class Controller {
  public create(req: Request, res: Response): void {
    ExamplesService.downloadCode(req.body.sourceCode).then(() =>
      res
        .status(201)
        .location(`/api/v1/generate/${req.body.id}`)
        .json({working: true})
    )
  }
}
export default new Controller()
