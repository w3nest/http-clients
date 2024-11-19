import {
    HTTPError,
    HTTPResponse$,
    raiseHTTPErrors,
    RootRouter,
} from '../lib/primitives'
import { AssetsGatewayClient } from '../lib/assets-gateway'
import { filter, map, shareReplay, take, tap } from 'rxjs/operators'
import { merge, Observable, OperatorFunction } from 'rxjs'
import { GetDefaultDriveResponse } from '../lib/explorer-backend'

import { Local } from '../lib'
import { mergeMap } from 'rxjs/operators'
import 'isomorphic-fetch'

RootRouter.HostName = getPyYouwolBasePath()
RootRouter.Headers = { 'py-youwol-local-only': 'true' }

export function getPyYouwolBasePath() {
    const url = globalThis.youwolJestPresetGlobals.integrationUrl
    if (globalThis.youwolJestPresetGlobals.debug) {
        console.log('URL in common.ts : ', url)
    }
    return url
}

export function expectAttributes(
    resp,
    attributes: Array<string | [string, string | number | boolean]>,
) {
    attributes.forEach((att) => {
        if (Array.isArray(att)) {
            if (resp[att[0]] == undefined) {
                console.log(`expected field '${att[0]}' not found`)
            }
            expect(resp[att[0]]).toEqual(att[1])
        } else {
            if (resp[att] == undefined) {
                console.log(`expected field '${att}' not found`)
            }
            expect(resp[att] != undefined).toBeTruthy()
        }
    })
}

export function expectAssetAttributes(resp: unknown) {
    expectAttributes(resp, [
        'assetId',
        'rawId',
        // 'treeId',
        //'description',
        'name',
        'kind',
        'groupId',
        'images',
        'thumbnails',
        'tags',
        //'permissions'
    ])
}

export type ManagedError = 'ManagedError'

export class Shell<T> {
    homeFolderId: string
    defaultDriveId: string
    privateGroupId: string
    assetsGtw: AssetsGatewayClient
    context: T
    constructor(params: {
        homeFolderId: string
        privateGroupId: string
        defaultDriveId: string
        assetsGtw: AssetsGatewayClient
        context?: T
    }) {
        Object.assign(this, params)
    }
}

export function shell$<T>(context?: T) {
    const assetsGtw = new AssetsGatewayClient()
    return assetsGtw.explorer.getDefaultUserDrive$().pipe(
        raiseHTTPErrors(),
        map((resp: GetDefaultDriveResponse) => {
            expect(resp.driveName).toBe('Default drive')
            return new Shell<T>({
                homeFolderId: resp.homeFolderId,
                defaultDriveId: resp.driveId,
                privateGroupId: resp.groupId,
                assetsGtw,
                context,
            })
        }),
    )
}

export type ShellWrapperOptions<TShell, TResp> = {
    authorizedErrors?: (resp) => boolean
    sideEffects?: (resp: TResp, shell?: TShell) => void
    newShell?: (shell: TShell, resp: TResp) => TShell
}

export function wrap<TShell, TResp>({
    observable,
    authorizedErrors,
    sideEffects,
    newShell,
}: ShellWrapperOptions<TShell, TResp> & {
    observable: (shell: TShell) => HTTPResponse$<TResp>
}): OperatorFunction<TShell, TShell> {
    authorizedErrors = authorizedErrors || (() => false)
    return (source$: Observable<TShell>) => {
        return source$.pipe(
            mergeMap((shell) => {
                const response$ = observable(shell).pipe(shareReplay(1))
                const error$ = response$.pipe(
                    filter((resp) => {
                        return (
                            resp instanceof HTTPError && !authorizedErrors(resp)
                        )
                    }),
                    raiseHTTPErrors(),
                    map(() => shell),
                )
                const managedError$ = response$.pipe(
                    filter((resp) => {
                        return (
                            resp instanceof HTTPError && authorizedErrors(resp)
                        )
                    }),
                    map(() => shell),
                )
                const success$ = response$.pipe(
                    filter((resp) => {
                        return !(resp instanceof HTTPError)
                    }),
                    map((resp) => resp as TResp),
                    tap((resp) => {
                        sideEffects && sideEffects(resp, shell)
                    }),
                    map((resp) => {
                        if (!newShell) {
                            return shell
                        }
                        return newShell(shell, resp)
                    }),
                )
                return merge(error$, managedError$, success$).pipe(take(1))
            }),
        )
    }
}
export function mapToShell<T, T1>(
    shell,
    cb?: (shell: Shell<T1>, resp) => T1,
): OperatorFunction<T, Shell<T1>> {
    return (obs$: Observable<T>) => {
        return obs$.pipe(
            map((resp) => {
                if (!cb) {
                    return shell
                }
                const context = cb(shell, resp)
                return new Shell({
                    ...shell,
                    context,
                })
            }),
        )
    }
}

export function finalize<TShell, TContext, TResp>({
    shell,
    cb,
    newShell,
}: {
    shell
    cb?: (shell: TShell, resp) => TContext
    newShell: (args) => TShell
}): OperatorFunction<TResp, TShell> {
    return (obs$: Observable<TResp>) => {
        return obs$.pipe(
            map((resp) => {
                if (!cb) {
                    return shell
                }
                const context = cb(shell, resp)
                return newShell({
                    ...shell,
                    context,
                })
            }),
        )
    }
}

export function newShellFromContext<TContext, TResp>(
    shell: Shell<TContext>,
    resp: TResp,
    newContext?: (s: Shell<TContext>, r: TResp) => TContext,
) {
    return newContext
        ? new Shell({ ...shell, context: newContext(shell, resp) })
        : shell
}

export function resetPyYouwolDbs$(headers: { [k: string]: string } = {}) {
    return new Local.LocalClient(headers).admin.customCommands.doGet$({
        name: 'reset',
    })
}

export function setup$(
    {
        localOnly,
        authId,
        envId,
        pyYouwolPort,
    }: {
        localOnly?: boolean
        authId?: string
        envId?: string
        pyYouwolPort?: number
    } = {
        localOnly: true,
        authId: 'int_tests_yw-users@test-user',
        envId: 'prod',
    },
) {
    RootRouter.HostName = `http://localhost:${pyYouwolPort || 2001}`
    const headers = {
        'py-youwol-local-only': localOnly ? 'true' : 'false',
    }
    RootRouter.Headers = headers

    return Local.LocalClient.startWs$().pipe(
        mergeMap(() =>
            new Local.LocalClient().admin.environment.login$({
                body: {
                    authId: authId || 'int_tests_yw-users@test-user',
                    envId: envId || 'prod',
                },
            }),
        ),
        mergeMap(() => {
            return resetPyYouwolDbs$(headers)
        }),
    )
}
