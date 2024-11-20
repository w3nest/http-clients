import { raiseHTTPErrors } from '../../lib'
import { AccountsClient } from '../../lib/accounts'
import '../common'
import '../mock-requests'
import { firstValueFrom } from 'rxjs'

const subject = new AccountsClient()

describe('impersonation (forbidden because no admin client in IT config', () => {
    test('start visible impersonation', () => {
        return expect(
            firstValueFrom(
                subject
                    .startVisibleImpersonation$('coco')
                    .pipe(raiseHTTPErrors()),
            ),
        ).rejects.toEqual(expect.objectContaining({ status: 403 }))
    })
    test('start hidden impersonation', () => {
        return expect(
            firstValueFrom(
                subject
                    .startHiddenImpersonation$('coco')
                    .pipe(raiseHTTPErrors()),
            ),
        ).rejects.toEqual(expect.objectContaining({ status: 403 }))
    })
    test('stop visible impersonation', () => {
        return expect(
            firstValueFrom(
                subject.stopImpersonation$().pipe(raiseHTTPErrors()),
            ),
        ).rejects.toEqual(expect.objectContaining({ status: 403 }))
    })
})
