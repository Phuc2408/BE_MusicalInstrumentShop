import { Controller, Post, Body, UseGuards, Request, HttpCode, HttpStatus, Version  } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto'; 
import { User } from 'src/users/entities/user.entity';
import { LoginUserDto } from './dto/login-user.dto'; 
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { AuthResponse } from './dto/auth-response.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ForgetPasswordDto } from './dto/forget-password.dto';

import { 
    ApiTags, 
    ApiOperation, 
    ApiResponse, 
    ApiBody, 
    ApiBearerAuth 
} from '@nestjs/swagger'; 

@ApiTags('Authentication') 
@Controller('v1/auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @ApiOperation({ summary: 'Register a new user account' })
    @ApiResponse({ 
        status: 201, 
        description: 'User registration successful.', 
        type: User 
    })
    @Post('register')
    async register(@Body() createUserDto: CreateUserDto) {
        return this.authService.register(createUserDto); 
    }

    @HttpCode(HttpStatus.OK)
    @UseGuards(AuthGuard('local')) 
    @Post('login/local')
    @ApiOperation({ summary: 'Authenticate user with username/password (Local Strategy)' })
    @ApiBody({ type: LoginUserDto }) 
    @ApiResponse({ 
        status: 200, 
        description: 'Login successful. Returns Access and Refresh Tokens.', 
        type: AuthResponse 
    })
    @ApiResponse({ status: 401, description: 'Unauthorized / Invalid credentials' })
    async loginLocal(@Request() req: { user: User }, @Body() loginDto: LoginUserDto) {
        return this.authService.login(req.user, loginDto.rememberMe); 
    }

    @HttpCode(HttpStatus.OK)
    @UseGuards(AuthGuard('google-token')) 
    @Post('login/google')
    @ApiOperation({ summary: 'Authenticate user with Google Token' })
    @ApiResponse({ 
        status: 200, 
        description: 'Google login successful. Returns tokens.', 
        type: AuthResponse 
    })
    @ApiResponse({ status: 401, description: 'Unauthorized / Invalid Google Token' })
    async loginGoogle(@Request() req: { user: User }){
        return this.authService.login(req.user);
    }

    @HttpCode(HttpStatus.OK)
    @UseGuards(AuthGuard('jwt-refresh')) 
    @Post('refresh')
    @ApiBearerAuth() 
    @ApiOperation({ summary: 'Refresh Access Token using Refresh Token' })
    @ApiResponse({ 
        status: 200, 
        description: 'Access Token successfully refreshed.', 
        type: AuthResponse 
    })
    @ApiResponse({ status: 401, description: 'Unauthorized / Invalid Refresh Token' })
    async refreshTokens(@Request() req: { user: any }, @Body() refreshDto: RefreshTokenDto) {
        const userId = req.user.userId;
        const refreshToken = req.user.refreshToken; 

        return this.authService.refreshTokens(userId, refreshToken);
    }

    @HttpCode(HttpStatus.OK)
    @Post('reset-password')
    @ApiResponse({ status: 200, description: 'Successfully changing password, please log in' })
    async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
        await this.authService.resetPassword(
        resetPasswordDto.token, 
        resetPasswordDto.newPassword
        );
        return 'Successfully changing password, please log in'
    }
    
    @HttpCode(HttpStatus.OK)
    @Post('forgot-password')
    async forgetPassword(@Body() forgetPasswordDto: ForgetPasswordDto) {
        await this.authService.sendResetPasswordLink( 
        forgetPasswordDto.email,
    );
    return 'If an account with that email exists, a password reset link has been sent.';
    }

    @HttpCode(HttpStatus.OK)
    @UseGuards(AuthGuard('jwt')) 
    @Post('logout')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Invalidates the Refresh Token for the logged-in user' })
    @ApiResponse({ status: 200, description: 'Logout successful.' })
    async logout(@Request() req: { user: User }) {
        await this.authService.logout(req.user.user_id); 
        return 'Logout successful. Token invalidated.';
    }   
}