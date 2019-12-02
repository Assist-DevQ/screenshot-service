import { IApiConf } from './types/api-conf'
import { IScenariosResponse, IScenarioEventResponse, IScenarioMeta, IScenarioEvent } from './types/scenario'
import axios, { AxiosInstance } from 'axios'

export class BackEndAPI {
  private readonly conf: IApiConf
  private readonly http: AxiosInstance

  constructor(conf: IApiConf) {
    this.conf = conf
    this.http = axios.create({
      baseURL: this.conf.baseUrl,
      timeout: 2000,
      headers: {
        'Authorization': `Basic ${this.conf.auth}`,
        'Content-Type': 'application/json'
      }
    })
  }

  public async getScenarios(projectId: number): Promise<IScenarioMeta[]> {
    return (await this.http.get<IScenariosResponse>(`${this.conf.scenarios}?project_id=${projectId}`)).data.scenarios
  }

  public async getScenarioEvents(projectId: number, scenarioId: number): Promise<IScenarioEvent> {
    const path = `${this.conf.scenarios}/${scenarioId}/?project_id=${projectId}`
    return (await this.http.get<IScenarioEventResponse>(path)).data.scenario
  }
}
