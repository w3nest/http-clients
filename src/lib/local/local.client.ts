import {
    CallerRequestOptions,
    HTTPResponse$,
    RootRouter,
    WebSocketClient,
    WebSocketOptions,
    WebSocketResponse$,
} from '../primitives'
import { combineLatest, distinctUntilChanged, Observable } from 'rxjs'
import { map, take } from 'rxjs/operators'

import { ContextMessage, HealthzResponse } from '../primitives'
import { ApiRouter } from './routers/api.router'
import { PythonRouter } from './routers/python'

export class WsRouter {
    private readonly _log: WebSocketClient<ContextMessage>
    private readonly _data: WebSocketClient<ContextMessage>
    public readonly connected$: Observable<boolean>

    constructor(params: WebSocketOptions = {}) {
        this._log = new WebSocketClient<ContextMessage>(
            `ws://${window.location.host}/ws-logs`,
            params,
        )
        this._data = new WebSocketClient<ContextMessage>(
            `ws://${window.location.host}/ws-data`,
            params,
        )
        this.connected$ = combineLatest([
            this._log.connected$.pipe(distinctUntilChanged()),
            this._data.connected$.pipe(distinctUntilChanged()),
        ]).pipe(
            map(([logConnected, dataConnected]) => {
                return logConnected && dataConnected
            }),
        )
    }
    startWs$() {
        return combineLatest(
            [this._data, this._log].map((channel) => {
                return channel.connectWs().pipe(take(1))
            }),
        )
    }
    public get log$(): WebSocketResponse$<unknown> {
        return this._log.message$
    }
    public get data$(): WebSocketResponse$<unknown> {
        return this._data.message$
    }
}

export class LocalClient extends RootRouter {
    public readonly api: ApiRouter
    public readonly python: PythonRouter

    static ws = new WsRouter()

    constructor({
        headers,
    }: {
        headers?: Record<string, string>
    } = {}) {
        super({
            basePath: '',
            headers,
        })
        this.api = new ApiRouter(this, LocalClient.ws)
        this.python = new PythonRouter(this)
    }

    /**
     * Healthz of the service
     *
     * @param callerOptions
     * @returns response
     */
    getHealthz$(
        callerOptions: CallerRequestOptions = {},
    ): HTTPResponse$<HealthzResponse> {
        return this.send$({
            command: 'query',
            path: `/healthz`,
            callerOptions,
        })
    }

    static startWs$() {
        return LocalClient.ws.startWs$()
    }
}
