import express, { Router } from 'express'
import { DiffController } from './controller'
import { DiffOrchestrator } from '../../services/DiffOrchestrator.service'
export default (o: DiffOrchestrator): Router => {
  const controller = new DiffController(o)
  return express.Router().post('/', controller.startFlow.bind(controller))
}
