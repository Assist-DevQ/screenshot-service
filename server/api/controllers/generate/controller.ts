import { Request, Response } from 'express'
import { CodeService } from '../../services/code.service'

import events from '../../../../test-events.json'
import { IEvent } from '../../services/types/events'

export class Controller {
  public async create(req: Request, res: Response): Promise<void> {
    const serv = await CodeService.build()
    serv.generateScreens((events as IEvent[]).reverse()).then(() =>
      res
        .status(201)
        .location(`/api/v1/generate/${req.body.id}`)
        .json({ working: true })
    )
  }
}
export default new Controller()
