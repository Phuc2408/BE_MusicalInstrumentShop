import { IsEmail, IsNotEmpty, IsString, MinLength, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto { 
    
    @ApiProperty({ example: 'john.doe@example.com' })
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @ApiProperty({ example: 'SecureP@ss123' })
    @IsString()
    @IsNotEmpty()
    @MinLength(6) 
    password: string;

    @ApiProperty({ example: 'John Doe' })
    @IsString()
    @IsNotEmpty()
    full_name: string;
    
    @ApiProperty({ example: '1234567890', required: false })
    @IsOptional()
    @IsString()
    phone?: string; 
    
    @ApiProperty({ example: '123 Main St, Anytown, USA', required: false })
    @IsOptional()
    @IsString()
    address?: string; 

    @ApiProperty({ example: '1990-01-01', required: false, format: 'date' })
    @IsOptional()
    @IsDateString()
    dob?: string;
}