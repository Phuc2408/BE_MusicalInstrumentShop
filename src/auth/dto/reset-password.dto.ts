import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
    @ApiProperty({
        description: 'Password reset token issued to the user for verification.',
        example: 'd4f8e6c2-9b7a-4f3d-8a2b-1c3e5f6a7b8c',
    })
    @IsString()
    @IsNotEmpty()
    token: string;

    @ApiProperty({
        description: 'New password for the account. Must be at least 8 characters long.',
        example: 'Str0ngP@ssw0rd!',
    })
    @IsString()
    @IsNotEmpty()
    @MinLength(8, { message: 'Password must be at least 8 characters long.' })
    newPassword: string;
}