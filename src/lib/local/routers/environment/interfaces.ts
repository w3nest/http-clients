export interface LoginResponse {
    id: string
    name: string
    email: string
    memberOf: string[]
}

export interface Command {
    name: string
}

export interface PathsBook {
    config: string
    system: string
    databases: string
    projects: string[]
    additionalPythonScrPaths: string[]
    usersInfo: string
    remotesInfo: string
    secrets?: string
    youwol: string
}

export interface DeadlinedCache {
    value: unknown
    deadline: number
    dependencies: Record<string, string>
}

export interface K8sNodeInfo {
    cpu: string
    memory: string
    architecture: string
    kernelVersion: string
    operating_system: string
    os_image: string
}

export interface K8sInstanceInfo {
    access_token: string
    nodes: K8sNodeInfo[]
    k8s_api_proxy: string
}

export interface DockerRepository {
    name: string
    pullSecret: string
}

export interface K8sDockerRepositories {
    repositories: DockerRepository[]
}

export interface K8sInstance {
    instanceInfo: K8sInstanceInfo
    configFile: string
    contextName: string
    docker: K8sDockerRepositories
    host: string
    proxyPort: string
}

export interface ProjectTemplate {
    icon?: Record<string, unknown>
    type: string
    folder: string
    parameters: Record<string, string>
}

export interface ProjectFinders {
    name: string
    fromPath: string
    lookUpDepth: number
    lookUpIgnore: string[]
    watch: boolean
}

export interface Projects {
    finders: ProjectFinders[]
    templates?: ProjectTemplate[]
}

export type AuthenticationType = 'BrowserAuth' | 'DirectAuth'

export class Authentication {
    authId: string
    type: AuthenticationType
}

export interface CloudEnvironment {
    envId: string
    host: string
    authentications: Authentication[]
    authProvider: { openidBaseUrl: string }
}

export interface Connection {
    envId: string
    authId: string
}
export interface Environment {
    commands: Record<string, Command>
    currentConnection: Connection
    customMiddlewares: unknown[]
    httpPort: number
    pathsBook: PathsBook
    projects?: Projects
    proxiedBackends: { store: ProxiedBackend[] }
    proxiedEsmServers: { store: ProxiedEsmServer[] }
    remotes: CloudEnvironment[]
}

export class ProxiedBackendConfiguration {
    build: Record<string, string>
}

export class ProxiedBackend {
    name: string
    version: string
    port: string
    partitionId: string
    uid: string
    startedAt: number
    configuration: ProxiedBackendConfiguration
}

export class ProxiedEsmServer {
    package: string
    version: string
    port: string
    uid: string
    pid?: string
    serverPid?: string
}

export interface UserInfo {
    id: string
    name: string
    email: string
    memberOf: string[]
}

export interface RemoteGatewayInfo {
    name: string
    host: string
    connected: boolean
}

export type EnvironmentStatusResponse = Environment

export type SwitchProfileResponse = Environment

export interface CustomDispatch {
    type: string
    name: string
    activated?: boolean
    parameters: Record<string, string>
}

export interface QueryCustomDispatchesResponse {
    dispatches: Record<string, CustomDispatch[]>
}

export type QueryCowSayResponse = string

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class UploadAssetResponse {}

export interface BrowserCacheItem {
    key: string
    file: string
    headers: Record<string, string>
    expirationTime: number
}
export interface BrowserCacheStatusResponse {
    sessionKey: string
    file?: string
    items: BrowserCacheItem[]
}

export interface ClearBrowserCacheBody {
    memory: boolean
    file: boolean
}

export interface ClearBrowserCacheResponse {
    deleted: number
}
