import { IsEmail, IsNotEmpty, IsString, MinLength, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserDto {

    @ApiProperty({
        example: 'email@test.com',
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
        example: 'Nguyen Van A',
        description: "The user's full name as displayed in the application."
    })
    @IsString({ message: 'Full name must be a string' })
    @IsNotEmpty({ message: 'Full name is required' })
    full_name: string;

    @ApiPropertyOptional({
        example: '+84919421414',
        description: "Primary contact phone number, including country code."
    })
    @IsOptional()
    @IsString({ message: 'Phone number must be a valid string' })
    phone?: string;

    @ApiPropertyOptional({
        example: '284/20 Phan Huy Ich phuong 12 quan Go Vap',
        description: "Physical mailing address for billing or shipping purposes."
    })
    @IsOptional()
    @IsString({ message: 'Address must be a valid string' })
    address?: string;

    @ApiPropertyOptional({
        example: '2004-08-24',
        description: "Date of birth in ISO 8601 format (YYYY-MM-DD).",
        format: 'date'
    })
    @IsOptional()
    @IsDateString({}, { message: 'Date of birth must be in YYYY-MM-DD format' })
    dob?: string;
}