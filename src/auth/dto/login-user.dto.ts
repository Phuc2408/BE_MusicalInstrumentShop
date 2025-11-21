import { IsBoolean, IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class LoginUserDto {

  @ApiProperty({
    example: 'jane.doe@example.com',
    description: "The user's email address used for authentication."
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: 'P@ssw0rd123!',
    description: "The user's account password."
  })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Flag indicating whether to extend the authentication session (remember me).'
  })
  @IsOptional()
  @IsBoolean()
  rememberMe?: boolean;
}