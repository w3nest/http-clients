import {
    Router,
    CallerRequestOptions,
    HTTPResponse$,
    WebSocketResponse$,
    filterCtxMessage,
} from '../../../primitives'

import {
    GetProjectsStatusResponse,
    CIStepEvent,
    CIStepStatusResponse,
    GetProjectStatusResponse,
    GetPipelineStatusResponse,
    GetArtifactsResponse,
    ArtifactsResponse,
    ProjectStatusResponse,
    CIStatusResponse,
    ProjectsLoadingResultsResponse,
    GetCIStepStatusResponse,
    RunStepResponse,
    CIStepEventKind,
    CreateProjectFromTemplateBody,
    CreateProjectFromTemplateResponse,
} from './interfaces'
import { WsRouter } from '../..'

class WebSocketAPI {
    constructor(public readonly ws: WsRouter) {}

    status$(): WebSocketResponse$<ProjectsLoadingResultsResponse> {
        return this.ws.data$.pipe(
            filterCtxMessage<ProjectsLoadingResultsResponse>({
                withLabels: ['ProjectsLoadingResults'],
            }),
        )
    }

    projectStatus$(
        filters: { projectId?: string } = {},
    ): WebSocketResponse$<ProjectStatusResponse> {
        return this.ws.data$.pipe(
            filterCtxMessage<ProjectStatusResponse>({
                withLabels: ['ProjectStatusResponse'],
                withAttributes: filters,
            }),
        )
    }

    ciStatus$(
        filters: { projectId?: string } = {},
    ): WebSocketResponse$<CIStatusResponse> {
        return this.ws.data$.pipe(
            filterCtxMessage<CIStatusResponse>({
                withLabels: ['CIStatusResponse'],
                withAttributes: filters,
            }),
        )
    }

    ciStepStatus$(
        filters: { projectId?: string; stepId?: string } = {},
    ): WebSocketResponse$<CIStepStatusResponse> {
        return this.ws.data$.pipe(
            filterCtxMessage<CIStepStatusResponse>({
                withLabels: ['CIStepStatusResponse'],
                withAttributes: filters,
            }),
        )
    }

    artifacts$(
        filters: { projectId?: string } = {},
    ): WebSocketResponse$<ArtifactsResponse> {
        return this.ws.data$.pipe(
            filterCtxMessage<ArtifactsResponse>({
                withLabels: ['ArtifactsResponse'],
                withAttributes: filters,
            }),
        )
    }

    stepEvent$(
        filters: {
            projectId?: string
            stepId?: string
            event?: CIStepEventKind
        } = {},
    ): WebSocketResponse$<CIStepEvent> {
        return this.ws.data$.pipe(
            filterCtxMessage<CIStepEvent>({
                withLabels: ['CIStepEvent'],
                withAttributes: filters,
            }),
        )
    }
}

export class ProjectsRouter extends Router {
    public readonly webSocket: WebSocketAPI

    constructor(parent: Router, ws: WsRouter) {
        super(parent.headers, `${parent.basePath}/projects`)
        this.webSocket = new WebSocketAPI(ws)
    }

    /**
     * Status
     *
     * @param callerOptions
     */
    status$({
        callerOptions,
    }: {
        callerOptions?: CallerRequestOptions
    } = {}): HTTPResponse$<GetProjectsStatusResponse> {
        return this.send$({
            command: 'query',
            path: `/status`,
            callerOptions,
        })
    }

    /**
     * Index projects.
     *
     * @param callerOptions
     */
    index$({
        callerOptions,
    }: {
        callerOptions?: CallerRequestOptions
    } = {}): HTTPResponse$<GetProjectsStatusResponse> {
        return this.send$({
            command: 'update',
            path: `/index`,
            callerOptions,
        })
    }

    getProjectStatus$({
        projectId,
        callerOptions,
    }: {
        projectId: string
        callerOptions?: CallerRequestOptions
    }): HTTPResponse$<GetProjectStatusResponse> {
        return this.send$({
            command: 'query',
            path: `/${projectId}`,
            callerOptions,
        })
    }

    getArtifacts$({
        projectId,
        callerOptions,
    }: {
        projectId: string
        callerOptions?: CallerRequestOptions
    }): HTTPResponse$<GetArtifactsResponse> {
        return this.send$({
            command: 'query',
            path: `/${projectId}/ci/artifacts`,
            callerOptions,
        })
    }

    /**
     * Pipeline status
     *
     * @param projectId
     * @param callerOptions
     */
    getCiStatus$({
        projectId,
        callerOptions,
    }: {
        projectId: string
        callerOptions?: CallerRequestOptions
    }): HTTPResponse$<GetPipelineStatusResponse> {
        return this.send$({
            command: 'query',
            path: `/${projectId}/ci`,
            callerOptions,
        })
    }

    /**
     * Flow status
     *
     * @param projectId
     * @param stepId
     * @param callerOptions
     */
    getCiStepStatus$({
        projectId,
        stepId,
        callerOptions,
    }: {
        projectId: string
        stepId: string
        callerOptions?: CallerRequestOptions
    }): HTTPResponse$<GetCIStepStatusResponse> {
        return this.send$({
            command: 'query',
            path: `/${projectId}/ci/steps/${stepId}`,
            callerOptions,
        })
    }

    /**
     * Run a step
     *
     * @param projectId
     * @param stepId
     * @param callerOptions
     */
    runStep$({
        projectId,
        stepId,
        callerOptions,
    }: {
        projectId: string
        stepId: string
        callerOptions?: CallerRequestOptions
    }): HTTPResponse$<RunStepResponse> {
        return this.send$({
            command: 'update',
            path: `/${projectId}/ci/steps/${stepId}/run`,
            callerOptions,
        })
    }

    /**
     * Create a new project from a template
     *
     * @param body
     * @param callerOptions
     */
    createProjectFromTemplate$({
        body,
        callerOptions,
    }: {
        body: CreateProjectFromTemplateBody
        callerOptions?: CallerRequestOptions
    }): HTTPResponse$<CreateProjectFromTemplateResponse> {
        return this.send$({
            command: 'create',
            path: `/create-from-template`,
            nativeRequestOptions: {
                json: body,
            },
            callerOptions,
        })
    }

    /**
     * Return the view of a step
     *
     * @param projectId project's id
     * @param stepId step's id
     * @param callerOptions
     */
    getStepView$({
        projectId,
        stepId,
        callerOptions,
    }: {
        projectId: string
        stepId: string
        callerOptions?: CallerRequestOptions
    }): HTTPResponse$<string> {
        return this.send$({
            command: 'query',
            path: `/${projectId}/ci/steps/${stepId}/view`,
            callerOptions,
        })
    }

    /**
     * Execute a GET command of a pipeline's step
     *
     * @param projectId project's id
     * @param flow flow's id
     * @param stepId step's id
     * @param commandId command's id
     * @param callerOptions
     */
    executeStepGetCommand$({
        projectId,
        stepId,
        commandId,
        callerOptions,
    }: {
        projectId: string
        stepId: string
        commandId: string
        callerOptions?: CallerRequestOptions
    }) {
        return this.send$({
            command: 'query',
            path: `/${projectId}/ci/steps/${stepId}/commands/${commandId}`,
            callerOptions,
        })
    }

    /**
     * Retrieve the configuration of a pipeline's step
     *
     * @param projectId project's id
     * @param stepId step's id
     * @param callerOptions
     */
    getStepConfiguration$({
        projectId,
        stepId,
        callerOptions,
    }: {
        projectId: string
        stepId: string
        callerOptions?: CallerRequestOptions
    }) {
        return this.send$({
            command: 'query',
            path: `/${projectId}/ci/steps/${stepId}/configuration`,
            callerOptions,
        })
    }

    /**
     * Update the configuration of a pipeline's step
     *
     * @param projectId project's id
     * @param stepId step's id
     * @param body configuration specification
     * @param callerOptions
     */
    updateStepConfiguration$({
        projectId,
        stepId,
        body,
        callerOptions,
    }: {
        projectId: string
        stepId: string
        body: unknown
        callerOptions?: CallerRequestOptions
    }) {
        return this.send$({
            command: 'update',
            path: `/${projectId}/ci/steps/${stepId}/configuration`,
            nativeRequestOptions: {
                json: body,
            },
            callerOptions,
        })
    }
}
