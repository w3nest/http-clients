export interface HealthzResponse {
    status: string
}
export type Label =
    | 'Label.DONE'
    | 'Label.LOG_INFO'
    | 'Label.LOG_WARNING'
    | 'Label.LOG_ERROR'
    | 'Label.STARTED'
    | 'Label.BASH'
    | 'Label.LOG_ABORT'
    | 'Label.EXCEPTION'
    | 'Label.FAILED'
    | 'Label.STD_OUTPUT'
    | 'EnvironmentStatusResponse'
    | 'CIStatusResponse'
    | 'CIStepStatusResponse'
    | 'CIStepEvent'
    | 'ProjectStatusResponse'
    | 'PackageDownloading'
    | 'ArtifactsResponse'
    | 'CdnResponse'
    | 'CdnStatusResponse'
    | 'CdnPackageResponse'
    | 'CheckUpdateResponse'
    | 'CheckUpdatesResponse'
    | 'DownloadEvent'
    | 'Label.PACKAGE_DOWNLOADING'
    | 'DownloadedPackageResponse'
    | 'PackageEventResponse'
    | 'ProjectsLoadingResults'
    | 'Label.CI_STEP_STATUS_PENDING'
    | 'Label.CI_STEP_RUNNING'
    | 'Label.RUN_CI_STEP'
    | 'HelmPackage'
    | 'Label.PROJECT_CREATING'
    | 'InstallBackendEvent'
    | 'BackendResponse'
    | 'Label.INSTALL_BACKEND_SH'
    | 'Label.START_BACKEND_SH'
    | 'DownloadBackendEvent'
    | 'StartBackendEvent'
    | 'Label.ESM_SERVER'
    | 'Label.DISPATCH_ESM_SERVER'

export interface ContextMessage<T = unknown, TLabel = Label> {
    contextId: string
    level: 'INFO' | 'WARNING' | 'ERROR'
    text: string
    labels?: TLabel[]
    parentContextId: string | undefined
    data?: T
    attributes?: Record<string, string>
    timestamp: number
}

export type GetFileContentResponse = string
