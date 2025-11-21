import { IsEmail, IsNotEmpty, IsString, MinLength, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserDto {

    @ApiProperty({
        example: 'john.doe@example.com',
        description: "The user's email address used for authentication and communication."
    })
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @ApiProperty({
        example: 'SecureP@ss123',
        description: "Password for the user account. Must be at least 6 characters."
    })
    @IsString()
    @IsNotEmpty()
    @MinLength(6)
    password: string;

    @ApiProperty({
        example: 'John Doe',
        description: "The user's full name as displayed in the application."
    })
    @IsString()
    @IsNotEmpty()
    full_name: string;

    @ApiPropertyOptional({
        example: '+1-555-123-4567',
        description: "Primary contact phone number, including country code."
    })
    @IsOptional()
    @IsString()
    phone?: string;

    @ApiPropertyOptional({
        example: '123 Main St, Anytown, NY 12345, USA',
        description: "Physical mailing address for billing or shipping purposes."
    })
    @IsOptional()
    @IsString()
    address?: string;

    @ApiPropertyOptional({
        example: '1990-01-01',
        description: "Date of birth in ISO 8601 format (YYYY-MM-DD).",
        format: 'date'
    })
    @IsOptional()
    @IsDateString()
    dob?: string;
}