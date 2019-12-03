import { IEvent } from './events'
import { IScreenMeta, IDiffMeta, ICommDiffMeta } from './code-meta';

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
  hasDiff?: boolean,
  baseFileUrl: string,
  diffFileUrl: string
}

export interface IScenarioDiff {
  meta: ICommDiffMeta,
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