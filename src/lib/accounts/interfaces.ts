export interface Groups {
    id: string
    path: string
}

export interface UserInfos {
    name: string
    temp: boolean
    groups: Groups[]
    email?: string
}

export interface SessionBaseDetails {
    userInfo: UserInfos
    remembered: boolean
    accountManagerUrl: string
    logoutUrl: string
}

export interface UserSessionDetails extends SessionBaseDetails {
    impersonating: false
}

export interface SessionImpersonationDetails extends SessionBaseDetails {
    realUserInfo: UserInfos
    impersonating: true
}

export type SessionDetails = SessionImpersonationDetails | UserSessionDetails
