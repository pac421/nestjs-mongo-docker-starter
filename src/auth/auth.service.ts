import { Injectable } from '@nestjs/common'
import { UsersService } from '../users/users.service'
import { JwtService } from '@nestjs/jwt'
import { authenticator } from 'otplib'
import { User } from '../users/schemas/user.schema'
import { toDataURL } from 'qrcode'
import { compare } from 'bcrypt'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
        private configService: ConfigService
    ) {}

    async validateUser(username: string, pass: string): Promise<User> {
        const user = await this.usersService.findOne(username)
        try {
            const isMatch = await compare(pass, user.password)
            if (user && isMatch) {
                return user
            }
        } catch (e) {
            return null
        }
    }

    async login(user: User) {
        const payload = {
            username: user.username,
        }
        return {
            access_token: this.jwtService.sign(payload),
            isTwoFactorAuthenticationEnabled: user.isTwoFactorAuthenticationEnabled,
        }
    }

    async loginWith2fa(user: User) {
        const payload = {
            username: user.username,
            isTwoFactorAuthenticationEnabled: !!user.isTwoFactorAuthenticationEnabled,
            isTwoFactorAuthenticated: true,
        }

        return {
            access_token: this.jwtService.sign(payload),
            jwtMaxAgeInSecond: this.configService.get<string>('JWT_MAX_AGE_IN_SECOND'),
        }
    }

    async generateTwoFactorAuthenticationSecret(user: User) {
        const secret = authenticator.generateSecret()
        const otpAuthUrl = authenticator.keyuri(user.username, 'Sesterce OS', secret)
        await this.usersService.setTwoFactorAuthenticationSecret(secret, user.username)
        return {
            secret,
            otpAuthUrl,
        }
    }

    async generateQrCodeDataURL(otpAuthUrl: string) {
        return toDataURL(otpAuthUrl)
    }

    isTwoFactorAuthenticationCodeValid(twoFactorAuthenticationCode: string, user: User) {
        return authenticator.verify({
            token: twoFactorAuthenticationCode,
            secret: user.twoFactorAuthenticationSecret,
        })
    }
}
