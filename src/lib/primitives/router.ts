import { Observable } from 'rxjs'
import {
    CallerRequestOptions,
    CommandType,
    headersInitToDict,
    HTTPError,
    NativeRequestOptions,
    send$,
    sendFormData,
} from './utils'

export class Router {
    constructor(
        public readonly headers: Record<string, string>,
        public readonly basePath: string,
    ) {}

    static defaultMethodMapping: Record<
        CommandType,
        'GET' | 'POST' | 'PUT' | 'DELETE'
    > = {
        upload: 'POST',
        download: 'GET',
        query: 'GET',
        create: 'PUT',
        update: 'POST',
        delete: 'DELETE',
    }

    send$<TResponse>({
        command,
        path,
        nativeRequestOptions,
        callerOptions,
    }: {
        command: CommandType
        path: string
        nativeRequestOptions?: NativeRequestOptions
        callerOptions?: CallerRequestOptions
    }): Observable<TResponse | HTTPError> {
        nativeRequestOptions ??= {}
        callerOptions ??= {}
        nativeRequestOptions.method ??= Router.defaultMethodMapping[command]

        const headers = {
            ...(nativeRequestOptions.headers as Record<string, string>),
            ...this.headers,
            ...(callerOptions.headers ?? {}),
        }
        return send$(
            command,
            `${this.basePath}${path}`,
            { ...nativeRequestOptions, headers },
            callerOptions.monitoring,
        )
    }

    sendFormData$({
        command,
        path,
        formData,
        queryParameters,
        nativeRequestOptions,
        callerOptions,
    }: {
        command: CommandType
        queryParameters?: Record<string, string>
        path: string
        formData: FormData
        nativeRequestOptions?: NativeRequestOptions
        callerOptions?: CallerRequestOptions
    }) {
        nativeRequestOptions ??= {}
        callerOptions ??= {}

        nativeRequestOptions.method ??= Router.defaultMethodMapping[command]

        const headers = {
            ...headersInitToDict(nativeRequestOptions.headers),
            ...this.headers,
            ...(callerOptions.headers ?? {}),
        } as Record<string, string>

        return sendFormData({
            url: `${this.basePath}${path}`,
            queryParameters,
            formData,
            method: nativeRequestOptions.method as 'POST' | 'PUT',
            headers,
            callerOptions,
        })
    }
}

export class RootRouter extends Router {
    static Headers: Record<string, string> = {}
    static HostName = '' // By default, relative resolution is used. Otherwise, protocol + hostname

    constructor(params: {
        basePath: string
        headers?: Record<string, string>
        hostName?: string
    }) {
        super(
            { ...RootRouter.Headers, ...(params.headers ?? {}) },
            `${params.hostName ?? RootRouter.HostName}${params.basePath}`,
        )
    }
}
