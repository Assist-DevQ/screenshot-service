import logger from '../../common/logger'

export class CodeService {
  public async downloadCode(ref: string): Promise<void> {
    logger.info(`downloading codebase ${ref}`)
  }
}

export default new CodeService()
