import { map } from 'rxjs'
import { AccountsClient } from '../accounts'
import { AssetsClient } from '../assets'
import { WebpmClient } from '../webpm'
import { ExplorerClient } from '../explorer'
import { FilesClient } from '../files'
import {
    CallerRequestOptions,
    HTTPResponse$,
    RootRouter,
    HTTPError,
} from '../primitives'
import { GetUserInfoResponse, QueryGroupsResponse } from './interfaces'
import { MiscRouter } from './routers'

export class AssetsGatewayClient extends RootRouter {
    public readonly misc: MiscRouter
    public readonly webpm: WebpmClient
    public readonly files: FilesClient
    public readonly explorer: ExplorerClient
    public readonly assets: AssetsClient
    public readonly accounts: AccountsClient

    constructor({
        headers,
        hostName,
    }: {
        headers?: Record<string, string>
        hostName?: string
    } = {}) {
        super({
            basePath: '/api/assets-gateway',
            headers,
            hostName,
        })
        this.misc = new MiscRouter(this)
        this.webpm = new WebpmClient({
            headers,
            basePath: `/api/assets-gateway/webpm`,
            hostName,
        })
        this.files = new FilesClient({
            headers,
            basePath: `/api/assets-gateway/files`,
            hostName,
        })
        this.explorer = new ExplorerClient({
            headers,
            basePath: `/api/assets-gateway/explorer`,
            hostName,
        })
        this.assets = new AssetsClient({
            headers,
            basePath: `/api/assets-gateway/assets`,
            hostName,
        })
        this.accounts = new AccountsClient({
            headers,
            hostName,
        })
    }

    /**
     * User infos
     *
     * @param callerOptions
     * @returns response
     *
     * @deprecated Use AccountsClient.getSessionDetails$().userInfo instead
     */
    getUserInfo$(
        callerOptions: CallerRequestOptions = {},
    ): HTTPResponse$<GetUserInfoResponse> {
        return this.accounts
            .getSessionDetails$(callerOptions)
            .pipe(
                map((resp) =>
                    resp instanceof HTTPError ? resp : resp.userInfo,
                ),
            )
    }

    /**
     * Groups in which the user belong
     * @param callerOptions
     * @returns response
     *
     * @deprecated Use AccountsClient.getSessionDetails$().userInfo.groups instead
     *
     */
    queryGroups$(
        callerOptions: CallerRequestOptions = {},
    ): HTTPResponse$<QueryGroupsResponse> {
        return this.accounts
            .getSessionDetails$(callerOptions)
            .pipe(
                map((resp) =>
                    resp instanceof HTTPError
                        ? resp
                        : { groups: resp.userInfo.groups },
                ),
            )
    }
}
