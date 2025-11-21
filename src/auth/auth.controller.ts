import { Controller, Post, Body, UseGuards, Request, HttpCode, HttpStatus, Version } from '@nestjs/common';
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

    @ApiTags('Authentication')
    @ApiOperation({ summary: 'Create a new user account' })
    @ApiResponse({ status: 200, description: 'User registration successful.', type: User })
    @ApiResponse({ status: 400, description: 'Bad Request - invalid registration data.' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @Post('register')
    async register(@Body() createUserDto: CreateUserDto) {
        return this.authService.register(createUserDto);
    }

    @ApiTags('Authentication')
    @HttpCode(HttpStatus.OK)
    @UseGuards(AuthGuard('local'))
    @Post('login/local')
    @ApiOperation({ summary: 'Authenticate with username and password' })
    @ApiBody({ type: LoginUserDto })
    @ApiResponse({ status: 200, description: 'Login successful. Returns Access and Refresh Tokens.', type: AuthResponse })
    @ApiResponse({ status: 400, description: 'Bad Request - missing or invalid credentials.' })
    @ApiResponse({ status: 401, description: 'Unauthorized / Invalid credentials' })
    async loginLocal(@Request() req: { user: User }, @Body() loginDto: LoginUserDto) {
        return this.authService.login(req.user, loginDto.rememberMe);
    }

    @ApiTags('Authentication')
    @HttpCode(HttpStatus.OK)
    @UseGuards(AuthGuard('google-token'))
    @Post('login/google')
    @ApiOperation({ summary: 'Authenticate using a Google token' })
    @ApiResponse({ status: 200, description: 'Google login successful. Returns tokens.', type: AuthResponse })
    @ApiResponse({ status: 400, description: 'Bad Request - invalid Google token.' })
    @ApiResponse({ status: 401, description: 'Unauthorized / Invalid Google Token' })
    async loginGoogle(@Request() req: { user: User }) {
        return this.authService.login(req.user);
    }

    @ApiTags('Authentication')
    @HttpCode(HttpStatus.OK)
    @UseGuards(AuthGuard('jwt-refresh'))
    @Post('refresh')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Refresh access token using a refresh token' })
    @ApiResponse({ status: 200, description: 'Access Token successfully refreshed.', type: AuthResponse })
    @ApiResponse({ status: 400, description: 'Bad Request - missing or invalid refresh token.' })
    @ApiResponse({ status: 401, description: 'Unauthorized / Invalid Refresh Token' })
    async refreshTokens(@Request() req: { user: any }) {
        const userId = req.user.userId;
        const refreshToken = req.user.refreshToken;
        return this.authService.refreshTokens(userId, refreshToken);
    }

    @ApiTags('Authentication')
    @HttpCode(HttpStatus.OK)
    @Post('reset-password')
    @ApiOperation({ summary: 'Reset password using token and new password' })
    @ApiResponse({ status: 200, description: 'Password changed successfully. Please log in.' })
    @ApiResponse({ status: 400, description: 'Bad Request - invalid token or weak password.' })
    @ApiResponse({ status: 401, description: 'Unauthorized - invalid or expired token.' })
    async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
        await this.authService.resetPassword(
            resetPasswordDto.token,
            resetPasswordDto.newPassword
        );
        return 'Successfully changing password, please log in'
    }

    @ApiTags('Authentication')
    @HttpCode(HttpStatus.OK)
    @Post('forgot-password')
    @ApiOperation({ summary: 'Request a password reset link for an email' })
    @ApiResponse({ status: 200, description: 'If an account exists, a password reset link has been sent.' })
    @ApiResponse({ status: 400, description: 'Bad Request - invalid email format.' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async forgetPassword(@Body() forgetPasswordDto: ForgetPasswordDto) {
        await this.authService.sendResetPasswordLink(
            forgetPasswordDto.email,
        );
        return 'If an account with that email exists, a password reset link has been sent.';
    }

    @ApiTags('Authentication')
    @HttpCode(HttpStatus.OK)
    @UseGuards(AuthGuard('jwt'))
    @Post('logout')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Logout and invalidate the user refresh token' })
    @ApiResponse({ status: 200, description: 'Logout successful.' })
    @ApiResponse({ status: 400, description: 'Bad Request' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async logout(@Request() req: { user: User }) {
        await this.authService.logout(req.user.user_id);
        return 'Logout successful. Token invalidated.';
    }
}