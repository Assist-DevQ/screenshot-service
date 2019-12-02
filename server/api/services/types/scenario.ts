import { IEvent } from './events'
import { IScreenMeta, IDiffMeta } from './code-meta';

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

export interface IEventFile {
  eventId: number,
  fileUrl: string
}

export interface IDiffFile {
  eventId: number,
  baseFileUrl: string,
  diffFileUrl: string
}

export interface IScenarioDiff {
  meta: IDiffMeta,
  files: IDiffFile[]
}

export interface IScenarioFiles {
  meta: IScreenMeta,
  files: IEventFile[]
}

export interface IGenerateResult {
  screens: IScenarioFiles[],
  outDir: string,
  commitId: string,
}