import { IGithubConfig } from './types/github-config'
import { IRepoConfig } from './types/repo-config'
import axios from 'axios'
import { ICodeMeta } from './types/code-meta'

export class GithubService {
  private readonly conf: IGithubConfig
  private readonly fileMark = 'filename='
  private readonly archExt = '.tar.gz'

  constructor(c: IGithubConfig) {
    this.conf = c
  }

  public async repoReadStreamAxios(repo: IRepoConfig): Promise<ICodeMeta> {
    const res = await axios({
      method: 'get',
      url: this.archUrl(repo),
      responseType: 'stream'
    })
    const folderName = this.extractFolderName(res.headers['content-disposition'])
    return {
      commitId: this.extractCommitId(folderName),
      folderName,
      codeStream: res.data
    }
  }

  private extractFolderName(cd: string): string {
    const fileName = cd.split(' ').find((tok: string) => tok.startsWith(this.fileMark))
    return fileName.substr(this.fileMark.length, fileName.indexOf(this.archExt) - this.archExt.length - 2)
  }
  private extractCommitId(folderName: string): string {
    return folderName.substr(folderName.lastIndexOf('-') + 1)
  }
  private archUrl(repo: IRepoConfig): string {
    return `${this.conf.baseUrl}/${repo.user}/${repo.repo}/${this.conf.archiveType}/${repo.branch}`
  }
}
