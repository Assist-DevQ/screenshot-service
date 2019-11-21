import express, { Router } from 'express'
import ScreensController from './controller'
import { Orchestrator } from '../../services/orchestrator.service'
export default (o: Orchestrator): Router => {
  const controller = new ScreensController(o)
  return express.Router().post('/', controller.startFlow.bind(controller))
}
