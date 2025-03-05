export type WebpmKind = 'esm' | 'webapp' | 'backend' | 'pyodide'

export interface Release {
    version: string
    version_number: number
    fingerprint: string
}

export interface FolderResponse {
    name: string
    path: string
    size: number
}

export interface UploadBody {
    fileName: string
    blob: Blob
}

export interface FileResponse {
    name: string
    encoding: string
    size: number
}

export interface QueryExplorerResponse {
    size: number
    folders: FolderResponse[]
    files: FileResponse[]
}

export interface UploadResponse {
    name: string
    id: string
    version: string
    fingerprint: string
    compressedSize: number
    url: string
}

export interface GetVersionMetadataResponse {
    icon: string
    displayName: string
}

export interface GetVersionInfoResponse {
    name: string
    version: string
    id: string
    namespace: string
    type: string
    kind: WebpmKind
    fingerprint: string
    aliases: string[]
    apiKey: string
}

export interface GetLibraryInfoResponse {
    name: string
    versions: string[]
    namespace: string
    id: string
    releases: Release[]
}

export interface DeleteLibraryResponse {
    deletedVersionsCount: number
}

export interface FileListing {
    include: string[]
    ignore: string[]
}

export interface Frontend {
    entryPoint: string
    entryDependencies?: Record<string, string>
    extraDependencies?: Record<string, string>
}

export interface AssetMatch {
    kind: string
    name: string
}

export interface OpeningRule {
    match: AssetMatch
    urlParameters: Record<string, string>
}

export interface WebAppExecution {
    standalone?: boolean
    openWidth?: OpeningRule[]
}

export interface WebApp extends Frontend {
    kind: 'webapp'
    execution?: WebAppExecution
}

export interface ESM extends Frontend {
    kind: 'esm'
    aliases?: string[]
}

export interface ReadynessProbe {
    path?: string
}

export interface Backend {
    kind: 'backend'
    deployKind: 'container' | 'shell'
    entryPoint: string
    entryDependencies: Record<string, string>
    readynessProbe: ReadynessProbe
}

export interface Distribution {
    files: FileListing
    artifacts?: string[]
}

export interface Metadata {
    icon?: string | Record<string, string>
    description?: string
    readme?: string
    documentation?: string
    license?: string
}

export interface Package {
    name: string
    version: string
    specification: WebApp | ESM | Backend
    distribution: Distribution
    metadata?: Metadata
}
