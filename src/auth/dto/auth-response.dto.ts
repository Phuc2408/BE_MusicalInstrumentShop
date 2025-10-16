import { ApiProperty } from '@nestjs/swagger';

export class AuthResponse {
    @ApiProperty({ example: 'access_token_jwt_here' })
    accessToken: string;

    @ApiProperty({ example: 'refresh_token_jwt_here' })
    refreshToken: string;
}