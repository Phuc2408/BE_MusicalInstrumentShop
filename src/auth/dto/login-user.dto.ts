import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginUserDto {
  
  @ApiProperty({ example: 'test.user@company.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'MySecretP@ssw0rd' })
  @IsString()
  @IsNotEmpty()
  password: string;
}