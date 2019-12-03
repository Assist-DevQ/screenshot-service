import { IncomingMessage } from 'http'

export interface ICodeMeta {
  folderName: string
  commitId: string
  codeStream: IncomingMessage
}

export interface IDiffMeta {
  commitId: string,
  projectId: number,
  scenarioId: number,
}

export interface ICommDiffMeta extends IDiffMeta {
  diffCommitId: string,
}

export interface IScreenMeta extends IDiffMeta {
  outDir: string,
  tag: string
}
