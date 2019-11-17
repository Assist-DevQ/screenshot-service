import { IncomingMessage } from 'http'

export interface ICodeMeta {
  folderName: string
  codeStream: IncomingMessage
}
