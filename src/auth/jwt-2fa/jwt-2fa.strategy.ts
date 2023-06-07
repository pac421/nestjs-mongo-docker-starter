import { ExtractJwt, Strategy } from 'passport-jwt'
import { PassportStrategy } from '@nestjs/passport'
import { Injectable, UnauthorizedException } from '@nestjs/common'
import { UsersService } from '../../users/users.service'
import { TokenPayload } from '../entities/token-payload.entity'
import { User } from '../../users/schemas/user.schema'

@Injectable()
export class Jwt2faStrategy extends PassportStrategy(Strategy, 'jwt-2fa') {
    constructor(private readonly usersService: UsersService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: process.env.JWT_SECRET,
        })
    }

    async validate(payload: TokenPayload): Promise<User> {
        const user = await this.usersService.findOne(payload.username)
        if (!user || !user.isTwoFactorAuthenticationEnabled || !payload.isTwoFactorAuthenticated) {
            throw new UnauthorizedException()
        }
        return user
    }
}
