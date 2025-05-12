import { BehaviorSubject, Observable, Subject, filter } from 'rxjs'
import { ContextMessage, Label } from './context'

export type WebSocketResponse$<T, TLabel = Label> = Observable<
    ContextMessage<T, TLabel>
>

export function filterAttributes<T, TLabel = Label>(
    message: ContextMessage<T, TLabel>,
    withAttributes?: Record<string, string | ((attr: string) => boolean)>,
) {
    return Object.entries(withAttributes ?? {}).reduce((acc, [k, v]) => {
        if (!acc || !message.attributes?.[k]) {
            return false
        }
        if (typeof v == 'string') {
            return message.attributes[k] === v
        }

        return v(message.attributes[k])
    }, true)
}

export function filterLabels<T, TLabel = Label>(
    message: ContextMessage<T, TLabel>,
    withLabels?: TLabel[],
) {
    return (withLabels ?? []).reduce(
        (acc, label) => acc && (message.labels ?? []).includes(label),
        true,
    )
}

export function filterCtxMessage<T = unknown, TLabel = Label>({
    withAttributes,
    withLabels,
}: {
    withAttributes?: Record<string, string | ((attr: string) => boolean)>
    withLabels?: TLabel[]
}): (
    source$: WebSocketResponse$<unknown, TLabel>,
) => WebSocketResponse$<T, TLabel> {
    return (source$: Observable<ContextMessage<unknown, TLabel>>) =>
        source$.pipe(
            filter((message: ContextMessage<T, TLabel>) => {
                const attrsOk = filterAttributes<T, TLabel>(
                    message,
                    withAttributes,
                )

                const labelsOk = filterLabels<T, TLabel>(message, withLabels)

                return attrsOk && labelsOk
            }),
        ) as WebSocketResponse$<T, TLabel>
}

export interface WebSocketOptions {
    autoReconnect?: boolean
    autoReconnectDelay?: number
}

const defaultOptions = {
    autoReconnect: false,
    autoReconnectDelay: 1000,
}
export class WebSocketClient<TMessage> {
    public readonly options: Required<WebSocketOptions>
    public readonly message$: Subject<TMessage>
    public readonly connected$ = new BehaviorSubject<boolean>(false)
    public ws: WebSocket | undefined

    constructor(
        public readonly path: string,
        options: WebSocketOptions = defaultOptions,
    ) {
        this.options = { ...defaultOptions, ...options }
        this.message$ = new Subject<TMessage>()
    }

    connectWs() {
        if (this.ws) {
            this.ws.close()
        }
        const ws = new WebSocket(this.path)
        this.ws = ws
        ws.onopen = () => {
            this.connected$.next(true)
        }
        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data as string) as TMessage
                this.message$.next(data)
            } catch (e) {
                console.error('Can not parse data', { error: String(e), event })
            }
        }
        ws.onerror = (err) => {
            console.error('Socket encountered error', err)
            ws.close()
        }
        ws.onclose = () => {
            if (this.options.autoReconnect) {
                this.connected$.next(false)
                console.log(
                    `Websocket on '${this.path}' closed, auto-reconnection will be attempted in 
                        ${String(this.options.autoReconnectDelay)} ms.`,
                )
                setTimeout(() => {
                    this.connectWs()
                }, this.options.autoReconnectDelay)
            }
        }
        return this.message$
    }
}
