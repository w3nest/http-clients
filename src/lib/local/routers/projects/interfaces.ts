import { Package as WebpmPackage } from '../../../webpm'

export interface Failure {
    path: string
    failure: string
    message: string
}

export interface Target {
    family: 'application' | 'library' | 'service'
    execution?: { standalone: boolean }
}

export interface Link {
    name: string
    url: string
}

export interface FileListing {
    include: string[]
    ignore: string[]
}

export interface Artifacts {
    id: string
    files: FileListing
    links: Link[]
}

export interface CIStep {
    id: string
    artifacts: Artifacts[]
    view?: string
}

export interface CI {
    tags: string[]
    description: string
    steps: CIStep[]
    dag: string[]
}
export interface Project {
    ci: CI
    webpmSpec: WebpmPackage
    path: string
    name: string
    id: string
    version: string
}

export interface ProjectsLoadingResults {
    results: Project[]
    failures: Failure[]
}

export type GetProjectsStatusResponse = ProjectsLoadingResults

export type ProjectsLoadingResultsResponse = ProjectsLoadingResults

export interface ChildToParentConnections {
    id: string
    parentIds: string[]
}

export interface DependenciesResponse {
    above: string[]
    below: string[]
    dag: ChildToParentConnections[]
    simpleDag: ChildToParentConnections[]
}

export interface ProjectStatus {
    projectId: string
    projectName: string
    workspaceDependencies: DependenciesResponse[]
}
export type GetProjectStatusResponse = ProjectStatus

export interface Artifact {
    id: string
    path: string
    links: Link[]
}
export type ArtifactsResponse = Artifact

export type GetArtifactResponse = Artifact

export interface Manifest {
    succeeded: boolean
    fingerprint: string
    creationDate: string
    files: string[]
    data: Record<string, unknown>
    stdOut: string[]
}

export interface CIStepStatus {
    id: string
    path: string
    links: Link[]
}

export interface CIStepStatusResponse {
    projectId: string
    stepId: string
    artifactFolder: string
    artifacts: Artifact[]
    manifest?: Manifest
    status: 'OK' | 'KO' | 'outdated' | 'none'
}
export type GetCIStepStatusResponse = CIStepStatusResponse

export type RunStepResponse = CIStepStatusResponse

export interface CIStatus {
    projectId: string
    steps: CIStepStatusResponse[]
}

export type CIStatusResponse = CIStatus

export type ProjectStatusResponse = ProjectStatus

export type GetPipelineStatusResponse = CIStatus

export interface GetArtifactsResponse {
    artifacts: Artifact[]
}

export type CIStepEventKind = 'runStarted' | 'runDone' | 'statusCheckStarted'

export interface CIStepEvent {
    projectId: string
    stepId: string
    event: CIStepEventKind
}

export interface CreateProjectFromTemplateBody {
    type: string
    parentFolder: string
    parameters: Record<string, string>
}

export type CreateProjectFromTemplateResponse = Project
