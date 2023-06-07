import { ApiProperty } from '@nestjs/swagger'

export class TwoFactorAuthDto {
    @ApiProperty()
    twoFactorAuthenticationCode: string
}
