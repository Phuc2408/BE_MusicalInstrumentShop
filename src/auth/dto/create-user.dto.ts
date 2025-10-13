import { IsEmail, IsNotEmpty, IsString, MinLength, IsOptional, IsDateString } from 'class-validator';


export class CreateUserDto { 
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6) 
  password: string;

  @IsString()
  @IsNotEmpty()
  full_name: string;
  
  @IsOptional()
  @IsString()
  phone?: string; 
  
    @IsOptional()
  @IsString()
  address?: string; 

  @IsOptional()
  @IsDateString()
  dob?: string;
}
