
import { ApiProperty } from '@nestjs/swagger';

export class UserInfoResponse {
    @ApiProperty({ example: 1 })
    user_id: number;
    @ApiProperty({ example: 'Nguyen Van A' })
    full_name: string;
    @ApiProperty({ example: 'email@test.com' })
    email: string;
    @ApiProperty({ example: 'customer' })
    role: string;
    @ApiProperty({ example: 'local, google' })
    loginMethod: string;
}

export class AuthDataResponse {
    @ApiProperty({ type: () => UserInfoResponse })
    user: UserInfoResponse;

    @ApiProperty({ example: 'access_token_jwt' })
    access_token: string;
    @ApiProperty({ example: 'refresh_token_jwt' })
    refresh_token: string;
}
