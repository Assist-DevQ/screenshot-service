import { promises } from 'fs'
import tar from 'tar'
import { IRepoConfig } from './types/repo-config'
import logger from '../../common/logger'
import { IncomingMessage } from 'http'

export class TarService {
  private readonly outputDir: string

  constructor(outDir: string) {
    this.outputDir = outDir
  }

  public async extract(r: IncomingMessage, repo: IRepoConfig): Promise<string> {
    await this.createDir(this.outPath(repo))
    const unzip = tar.x({ cwd: this.outPath(repo) })
    return new Promise((res, rej) => {
      logger.info('Unzip')
      r.pipe(unzip)
        .on('finish', () => {
          res(this.outPath(repo))
        })
        .on('error', (err: Error) => {
          rej(err.message)
        })
    })
  }

  public async createDir(out: string): Promise<void> {
    await promises.mkdir(out, { recursive: true })
  }

  private outPath(repo: IRepoConfig): string {
    return `${this.outputDir}/${repo.user}/${repo.repo}/${repo.branch}`
  }
}
