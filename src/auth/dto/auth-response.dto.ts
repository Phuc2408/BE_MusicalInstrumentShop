import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AuthResponse {
    @ApiProperty({
        description: 'JWT access token used for authentication. Typically short-lived and sent in the Authorization header as a Bearer token.',
        example:
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwiaWF0IjoxNjA5NjQwMDAwLCJleHAiOjE2MDk2NDM2MDB9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
    })
    accessToken: string;

    @ApiPropertyOptional({
        description: 'JWT refresh token used to obtain new access tokens. Typically longer-lived and stored securely by the client.',
        example: '8b2f1d7e-4c9a-4b2a-9a3e-2f7a9c3d1e5f',
    })
    refreshToken?: string;
}