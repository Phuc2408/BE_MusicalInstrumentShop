import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GoogleLoginDto {
    @ApiProperty({
        example: '4/0Ab32j91H_V8YTrLaRTU9NRizba0pt5rBW_ecnxG1Z5BnuN4lCaKeD2kaivcgIFoqWHM9zA',
        description: 'Authorization Code from Google (received on client side)'
    })
    @IsString()
    @IsNotEmpty({ message: 'Google authorization code is required' })
    code: string;
}