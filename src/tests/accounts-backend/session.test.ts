import { raiseHTTPErrors } from '../../lib/primitives'
import { AccountsClient } from '../../lib/accounts-backend'
import {
    GetUserInfoResponse,
    QueryGroupsResponse,
} from '../../lib/assets-gateway'
import '../common'
import '../mock-requests'
import { firstValueFrom } from 'rxjs'

const subject = new AccountsClient()

describe('session', () => {
    test('backward compatible with assets-gateway/user-info', () => {
        return expect(
            firstValueFrom(
                subject.getSessionDetails$().pipe(raiseHTTPErrors()),
            ).then((session) => session.userInfo as GetUserInfoResponse),
        ).resolves.toMatchObject<GetUserInfoResponse>({
            name: 'John Doe',
            groups: [
                {
                    id: 'private_51c42384-3582-494f-8c56-7405b01646ad',
                    path: 'private',
                },
                { id: 'L3lvdXdvbC11c2Vycw==', path: '/youwol-users' },
            ],
        })
    })

    test('backward compatible with assets-gateway/groups', () => {
        return expect(
            firstValueFrom(
                subject.getSessionDetails$().pipe(raiseHTTPErrors()),
            ).then(
                (session) =>
                    ({
                        groups: session.userInfo.groups,
                    }) as QueryGroupsResponse,
            ),
        ).resolves.toMatchObject<QueryGroupsResponse>({
            groups: [
                {
                    id: 'private_51c42384-3582-494f-8c56-7405b01646ad',
                    path: 'private',
                },
                { id: 'L3lvdXdvbC11c2Vycw==', path: '/youwol-users' },
            ],
        })
    })

    test('not temporary', () => {
        return expect(
            firstValueFrom(
                subject.getSessionDetails$().pipe(raiseHTTPErrors()),
            ).then((session) => session.userInfo.temp),
        ).resolves.toBeFalsy()
    })
})
