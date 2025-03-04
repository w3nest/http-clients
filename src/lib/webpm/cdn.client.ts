import {
    CallerRequestOptions,
    downloadBlob,
    HTTPResponse$,
    uploadBlob,
    RootRouter,
} from '../primitives'
import {
    QueryExplorerResponse,
    UploadResponse,
    GetLibraryInfoResponse,
    DeleteLibraryResponse,
    GetVersionInfoResponse,
    UploadBody,
    GetVersionMetadataResponse,
} from './interfaces'

import { NewAssetResponse } from '../assets-gateway'
import { Observable } from 'rxjs'

export class WebpmClient extends RootRouter {
    constructor({
        headers,
        basePath,
        hostName,
    }: {
        headers?: Record<string, string>
        basePath?: string
        hostName?: string
    } = {}) {
        super({
            basePath: basePath ?? '/api/webpm',
            headers,
            hostName,
        })
    }

    /**
     * Retrieve package's info, including available versions.
     *
     * @param libraryId
     * @param queryParameters optional semver query and max count of items returned
     * @param callerOptions
     */
    getLibraryInfo$({
        libraryId,
        queryParameters,
        callerOptions,
    }: {
        libraryId: string
        queryParameters?: { semver?: string; maxCount?: number }
        callerOptions?: CallerRequestOptions
    }): HTTPResponse$<GetLibraryInfoResponse> {
        const toKey = { semver: 'semver', maxCount: 'max-count' }
        const suffix = queryParameters
            ? Object.entries(queryParameters).reduce(
                  (acc, [k, v]: ['semver' | 'maxCount', string | number]) =>
                      `${acc}${toKey[k]}=${String(v)}&`,
                  '?',
              )
            : ''
        return this.send$({
            command: 'query',
            path: `/libraries/${libraryId}${suffix}`,
            callerOptions,
        })
    }

    /**
     * Retrieve version info of a library
     *
     * @param libraryId
     * @param version
     * @param callerOptions
     */
    getVersionInfo$({
        libraryId,
        version,
        callerOptions,
    }: {
        libraryId: string
        version: string
        callerOptions?: CallerRequestOptions
    }): HTTPResponse$<GetVersionInfoResponse> {
        return this.send$({
            command: 'query',
            path: `/libraries/${libraryId}/${version}`,
            callerOptions,
        })
    }

    /**
     * Retrieve metadata info of a library
     *
     * @param libraryId
     * @param version
     * @param callerOptions
     */
    getMetadataInfo$({
        libraryId,
        version,
        callerOptions,
    }: {
        libraryId: string
        version: string
        callerOptions?: CallerRequestOptions
    }): HTTPResponse$<GetVersionMetadataResponse> {
        return this.send$({
            command: 'query',
            path: `/metadata/${libraryId}/${version}`,
            callerOptions,
        })
    }

    /**
     * Delete library & all the versions published
     * @param libraryId
     * @param callerOptions
     */
    deleteLibrary$({
        libraryId,
        callerOptions,
    }: {
        libraryId: string
        callerOptions?: CallerRequestOptions
    }): HTTPResponse$<DeleteLibraryResponse> {
        return this.send$({
            command: 'delete',
            path: `/libraries/${libraryId}`,
            callerOptions,
        })
    }

    /**
     * Get entry point of a library.
     *
     * @param libraryId
     * @param version
     * @param callerOptions
     */
    getEntryPoint$({
        libraryId,
        version,
        callerOptions,
    }: {
        libraryId: string
        version: string
        callerOptions?: CallerRequestOptions
    }): HTTPResponse$<Blob> {
        return this.send$({
            command: 'query',
            path: `/resources/${libraryId}/${version}`,
            callerOptions,
        })
    }

    /**
     * Get a resource from the CDN.
     *
     * @param libraryId
     * @param version
     * @param restOfPath
     * @param callerOptions
     */
    getResource$<TResp = Blob>({
        libraryId,
        version,
        callerOptions,
        restOfPath,
    }: {
        libraryId: string
        version: string
        restOfPath: string
        callerOptions?: CallerRequestOptions
    }): HTTPResponse$<TResp> {
        return this.send$({
            command: 'query',
            path: `/resources/${libraryId}/${version}/${restOfPath}`,
            callerOptions,
        })
    }

    /**
     * Download a library
     *
     * @param libraryId
     * @param version
     * @param callerOptions
     * @return blob of the library's zip file
     */
    downloadLibrary$({
        libraryId,
        version,
        callerOptions,
    }: {
        libraryId: string
        version: string
        callerOptions?: CallerRequestOptions
    }): HTTPResponse$<Blob> {
        return downloadBlob(
            `${this.basePath}/download-library/${libraryId}/${version}`,
            'library',
            {},
            callerOptions,
        ) as Observable<Blob>
    }

    /**
     * Upload a zip file of a CDN package.
     *
     * @param body
     * @param body.fileName string
     * @param body.blob Blob content of the zip file
     * @param queryParameters
     * @param queryParameters.folderId if this client is used through assets-gtw, destination folderId
     * @param callerOptions
     * @return package response or asset depending on whether the client is used through assets-gtw
     */
    upload$({
        body,
        queryParameters,
        callerOptions,
    }: {
        body: UploadBody
        queryParameters?: { folderId?: string }
        callerOptions?: CallerRequestOptions
    }): HTTPResponse$<NewAssetResponse<UploadResponse> | UploadResponse> {
        const suffix = queryParameters?.folderId
            ? `?folder-id=${queryParameters.folderId}`
            : ''
        return uploadBlob(
            `${this.basePath}/publish-library${suffix}`,
            body.fileName,
            'POST',
            body.blob,
            {},
            callerOptions,
        ) as HTTPResponse$<NewAssetResponse<UploadResponse> | UploadResponse>
    }

    /**
     * Get items content of a folder in the CDN
     *
     * @param libraryName base64 encoded library's name
     * @param version version of the library
     * @param restOfPath path of the folder
     * @param callerOptions
     */
    queryExplorer$({
        libraryId,
        version,
        restOfPath,
        callerOptions,
    }: {
        libraryId: string
        version: string
        restOfPath: string
        callerOptions?: CallerRequestOptions
    }): HTTPResponse$<QueryExplorerResponse> {
        return this.send$({
            command: 'query',
            path: `/explorer/${libraryId}/${version}/${restOfPath}`,
            callerOptions,
        })
    }
}
