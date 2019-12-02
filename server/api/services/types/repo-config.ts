export interface IRepoDiff {
  projectId: number,
  user: string,
  repo: string,
  baseBranch: string,
  diffBranch: string,
}
export interface IRepoConfig {
  projectId: number,
  user: string,
  repo: string,
  branch: string,
}
