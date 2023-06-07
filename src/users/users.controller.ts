import { Controller, Get, UseGuards, Request, Body } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { Jwt2faAuthGuard } from '../auth/jwt-2fa/jwt-2fa-auth.guard'
import { UsersService } from './users.service'
import { User } from './schemas/user.schema'

@Controller('users')
@ApiTags('users')
@ApiBearerAuth()
export class UsersController {
    constructor(private usersService: UsersService) {}

    @UseGuards(Jwt2faAuthGuard)
    @Get('profile')
    getProfile(@Request() req) {
        return req.user
    }

    @UseGuards(Jwt2faAuthGuard)
    @Get()
    async findAll(): Promise<{ users: User[]; count: number }> {
        return this.usersService.findAll()
    }
}
