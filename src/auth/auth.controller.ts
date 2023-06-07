import {
    Controller,
    Request,
    Post,
    UseGuards,
    UnauthorizedException,
    Body,
    Response,
    Get,
} from '@nestjs/common'
import { UsersService } from '../users/users.service'
import { AuthService } from './auth.service'
import { JwtAuthGuard } from './jwt/jwt-auth.guard'
import { LocalAuthGuard } from './local/local-auth.guard'
import { LoginAuthDto } from './dto/login-auth.dto'
import { TwoFactorAuthDto } from './dto/2fa-auth.dto'
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger'

@Controller('auth')
@ApiTags('auth')
export class AuthController {
    constructor(private authService: AuthService, private usersService: UsersService) {}

    @Post('login')
    @UseGuards(LocalAuthGuard)
    @ApiBody({ type: LoginAuthDto })
    async login(@Request() request) {
        return this.authService.login(request.user)
    }

    @Get('2fa/generate')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    async generateTwoFactorAuthentication(@Response() response, @Request() request) {
        const { otpAuthUrl } = await this.authService.generateTwoFactorAuthenticationSecret(
            request.user
        )
        return response.json(await this.authService.generateQrCodeDataURL(otpAuthUrl))
    }

    @Post('2fa/turn-on')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    async turnOnTwoFactorAuthentication(
        @Request() request,
        @Body() twoFactorAuthDto: TwoFactorAuthDto
    ) {
        const isCodeValid = this.authService.isTwoFactorAuthenticationCodeValid(
            twoFactorAuthDto.twoFactorAuthenticationCode,
            request.user
        )
        if (!isCodeValid) {
            throw new UnauthorizedException('Wrong authentication code')
        }
        await this.usersService.turnOnTwoFactorAuthentication(request.user.username)
        return this.authService.loginWith2fa(request.user)
    }

    @Post('2fa/authenticate')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    async authenticate(@Request() request, @Body() twoFactorAuthDto: TwoFactorAuthDto) {
        const isCodeValid = this.authService.isTwoFactorAuthenticationCodeValid(
            twoFactorAuthDto.twoFactorAuthenticationCode,
            request.user
        )
        if (!isCodeValid) {
            throw new UnauthorizedException('Wrong authentication code')
        }
        return this.authService.loginWith2fa(request.user)
    }
}
