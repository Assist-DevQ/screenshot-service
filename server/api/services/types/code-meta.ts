import { IncomingMessage } from 'http'

export interface ICodeMeta {
  folderName: string
  commitId: string
  codeStream: IncomingMessage
}
