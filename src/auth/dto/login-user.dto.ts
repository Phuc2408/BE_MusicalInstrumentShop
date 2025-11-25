import { IsBoolean, IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class LoginUserDto {
  @ApiProperty({ example: 'jane.doe@example.com', description: "The user's email address" })
  @IsEmail({}, { message: 'Invalid email format' })
  @IsNotEmpty({ message: 'Email should not be empty' })
  email: string;

  @ApiProperty({ example: 'P@ssw0rd123!', description: "The user's password" })
  @IsString()
  @IsNotEmpty({ message: 'Password should not be empty' })
  password: string;

  @ApiPropertyOptional({ example: true, description: 'Remember me flag' })
  @IsOptional()
  @IsBoolean()
  rememberMe?: boolean;
}