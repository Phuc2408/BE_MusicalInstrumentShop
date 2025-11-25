import { IsEmail, IsNotEmpty, IsString, MinLength, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserDto {

    @ApiProperty({
        example: 'john.doe@example.com',
        description: "The user's email address used for authentication and communication."
    })
    @IsEmail({}, { message: 'Please provide a valid email address' })
    @IsNotEmpty({ message: 'Email is required' })
    email: string;

    @ApiProperty({
        example: 'SecureP@ss123',
        description: "Password for the user account. Must be at least 6 characters."
    })
    @IsString({ message: 'Password must be a string' })
    @IsNotEmpty({ message: 'Password is required' })
    @MinLength(6, { message: 'Password must be at least 6 characters long' })
    password: string;

    @ApiProperty({
        example: 'John Doe',
        description: "The user's full name as displayed in the application."
    })
    @IsString({ message: 'Full name must be a string' })
    @IsNotEmpty({ message: 'Full name is required' })
    full_name: string;

    @ApiPropertyOptional({
        example: '+1-555-123-4567',
        description: "Primary contact phone number, including country code."
    })
    @IsOptional()
    @IsString({ message: 'Phone number must be a valid string' })
    phone?: string;

    @ApiPropertyOptional({
        example: '123 Main St, Anytown, NY 12345, USA',
        description: "Physical mailing address for billing or shipping purposes."
    })
    @IsOptional()
    @IsString({ message: 'Address must be a valid string' })
    address?: string;

    @ApiPropertyOptional({
        example: '1990-01-01',
        description: "Date of birth in ISO 8601 format (YYYY-MM-DD).",
        format: 'date'
    })
    @IsOptional()
    @IsDateString({}, { message: 'Date of birth must be in YYYY-MM-DD format' })
    dob?: string;
}