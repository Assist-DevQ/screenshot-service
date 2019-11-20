import { exec, ChildProcess, PromiseWithChild } from 'child_process'
import util from 'util'
import logger from '../../common/logger'
const execP = util.promisify(exec)

export class DockerService {
  public static build(cwd: string, serviceName: string, version: string): Promise<any> {
    console.info('Building in:', cwd)
    return execP(this.buildCommand(serviceName, version), { cwd })
  }

  public static run(cwd: string, serviceName: string, version: string): ChildProcess {
    logger.info('Running:', cwd)
    return exec(this.runCommand(serviceName, version), { cwd })
  }

  private static dockerBuildCommand: string = 'docker build -t'
  private static dockerRunCommand: string = 'docker run -v ${PWD}:/app -v /app/node_modules -p 3010:3000 --rm'
  private static buildCommand(serviceName: string, version: string): string {
    return `${this.dockerBuildCommand} ${serviceName}:${version} .`
  }

  private static runCommand(serviceName: string, version: string): string {
    return `${this.dockerRunCommand} ${serviceName}:${version}`
  }
}
