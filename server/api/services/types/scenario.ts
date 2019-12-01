import { IEvent } from './events'

export interface IScenarioMeta {
  id: number,
  name: string,
}

export interface IScenariosResponse {
  scenarios: IScenarioMeta[]
}

export interface IScenarioEvent {
  id: number,
  name: string,
  runs: any,
  events: IEvent[]
}

export interface IScenarioEventResponse {
  scenario: IScenarioEvent
}

export interface IScenarioFiles {
  scenarioId: number,
  files: string[]
}
