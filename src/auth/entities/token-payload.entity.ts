export interface TokenPayload {
    iat: number
    exp: number
    username: string
    isTwoFactorAuthenticated?: boolean
    isTwoFactorAuthenticationEnabled?: boolean
}
