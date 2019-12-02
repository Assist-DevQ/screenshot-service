import { IncomingMessage } from 'http'

export interface ICodeMeta {
  folderName: string
  commitId: string
  codeStream: IncomingMessage
}

export interface IScreenMeta {
  commitId: string,
  projectId: number,
  scenarioId: number,
}
