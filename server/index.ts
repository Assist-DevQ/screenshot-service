import './common/env'
import Server from './common/server'
import routes from './routes'
import { GithubService } from './api/services/github.service'
import { TarService } from './api/services/tar.service'
import { ScreenService } from './api/services/screen.service'
import { GCStorage } from './api/services/GCStorage.service'
import { IGithubConfig } from './api/services/types/github-config'
import { Application } from 'express'
import { Orchestrator } from './api/services/orchestrator.service'
import { BackEndAPI } from './api/services/BackEndApi.sevice'
import { IApiConf } from './api/services/types/api-conf'
import { PixelDiff } from './api/services/PixelDiff'
import {readFileSync, createWriteStream} from 'fs'
import { DiffOrchestrator } from './api/services/DiffOrchestrator.service'

const boot = async (): Promise<Application> => {
  const port = Number(process.env.PORT)
  const gitConf: IGithubConfig = { baseUrl: process.env.GITHUB_BASE, archiveType: process.env.GITHUB_FORMAT }
  const apiConf: IApiConf = {
    baseUrl: process.env.BACK_API_BASE_URL,
    scenarios: process.env.SCENARIOS,
    auth: process.env.BACK_API_AUTH
  }
  const github: GithubService = new GithubService(gitConf)
  const tar: TarService = new TarService(process.env.CODE_DIR)
  const screens: ScreenService = await ScreenService.build()
  const storage: GCStorage = new GCStorage()
  const backApi: BackEndAPI = new BackEndAPI(apiConf)
  const pix = new PixelDiff()
  const diffOrchestrator = new DiffOrchestrator(storage, pix)
  const orchestrator = new Orchestrator({github, tar, screens, storage, backApi, diffOrchestrator})
  // const ff = readFileSync('./screens/1574517289787-start-.png')
  // const ff1 = readFileSync('./screens/1574517292662-click- Login.png')
  // const diff = await pix.compare(ff, ff1)
  // if(diff.diff)  {
  //   const fname = await storage.uploadStream('the-fucking-dif.png', diff.diff)
  //   console.log('NAME', fname)
  //   // diff.diff.pipe(createWriteStream('iuhuu.png'))
  // }
  return new Server().router(routes(orchestrator)).listen(port)
}
export default boot()
