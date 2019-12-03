import { exec, ChildProcess, PromiseWithChild } from 'child_process'
import util from 'util'
import logger from '../../common/logger'
import { Transform, TransformCallback } from 'stream'
const execP = util.promisify(exec)

export class DockerService {
  public static build(cwd: string, serviceName: string, version: string): Promise<any> {
    logger.info('Building in:', cwd)
    return execP(this.buildCommand(serviceName, version), { cwd })
  }

  public static run(cwd: string, port: number, serviceName: string, version: string): Promise<ChildProcess> {
    return new Promise((res, rej) => {
      logger.info(`Running: ${cwd} on ${port}`)
      const childProcess = exec(this.runCommand(port, serviceName, version), { cwd })
      childProcess.stderr.pipe(process.stderr)
      childProcess.on('error', res)
      childProcess.stdout.pipe(
        new Transform({
          transform: (chunk: any, enc: string, cb: TransformCallback) => {
            if (chunk.toString().indexOf(this.errMarker) > -1) { rej(chunk.toString()) }
            if (chunk.toString().indexOf(this.upMarker) > -1) {
              logger.info('The testing server is up.')
              res(childProcess)
            }
            cb()
          }
        })
      )
    })
  }

  private static readonly upMarker: string = 'To create a production build, use npm run build.'
  private static readonly errMarker: string = 'Error:'
  private static dockerBuildCommand: string = 'docker build -t'
  private static dockerRunCommand = (port: number): string => {
    return `docker run -v \${PWD}:/app -v /app/node_modules -p ${port}:3000 --rm`
  }
  private static buildCommand(serviceName: string, version: string): string {
    return `${this.dockerBuildCommand} ${serviceName}:${version} .`
  }

  private static runCommand(port: number, serviceName: string, version: string): string {
    return `${this.dockerRunCommand(port)} ${serviceName}:${version}`
  }
}
