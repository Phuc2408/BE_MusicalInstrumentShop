import { Controller, Post, Body, UseGuards, Request, HttpCode, HttpStatus, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { GoogleLoginDto } from './dto/google-login.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ForgetPasswordDto } from './dto/forget-password.dto';
import { User } from 'src/users/entities/user.entity';


import {
    ApiOkResponseData,
    ApiOkResponseMessage,
    ApiBadRequest,
    ApiUnauthorized,
    ApiCreatedResponseData,
    ApiConflict
} from 'src/common/decorators/swagger.decorator';

import {
    ApiTags,
    ApiOperation,
    ApiBody,
    ApiBearerAuth
} from '@nestjs/swagger';
import { AuthDataResponse, UserInfoResponse } from './dto/auth-response.dto';

@ApiTags('Authentication')
@Controller('v1/auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @ApiOperation({ summary: 'Create a new user account' })
    @ApiCreatedResponseData(UserInfoResponse)
    @ApiBadRequest(['email must be an email'])
    @ApiConflict('Email is existed')
    @Post('register')
    async register(@Body() createUserDto: CreateUserDto): Promise<UserInfoResponse> {
        return this.authService.register(createUserDto);
    }

    @HttpCode(HttpStatus.OK)
    @Post('login/local')
    @ApiOperation({ summary: 'Authenticate with username and password' })
    @ApiBody({ type: LoginUserDto })
    @ApiOkResponseData(AuthDataResponse)
    @ApiBadRequest(['email must be an email', 'password should not be empty'])
    @ApiUnauthorized('Wrong email or password')
    async loginLocal(@Request() req: { user: User }, @Body() loginDto: LoginUserDto): Promise<AuthDataResponse> {
        const user = await this.authService.validateUser(loginDto.email, loginDto.password);

        if (!user) {
            throw new UnauthorizedException('Wrong email or password');
        }

        return this.authService.login(user, loginDto.rememberMe);
    }

    @HttpCode(HttpStatus.OK)
    @Post('login/google')
    @ApiOperation({ summary: 'Authenticate using a Google token' })
    @ApiOkResponseData(AuthDataResponse)
    @ApiBadRequest('Invalid or expired Google authorization code.')
    @ApiUnauthorized('Google Authentication Failed')
    async loginGoogle(@Body() googleDto: GoogleLoginDto): Promise<AuthDataResponse> {
        const user = await this.authService.verifyGoogleCode(googleDto.code);
        return this.authService.login(user);
    }

    @HttpCode(HttpStatus.OK)
    @UseGuards(AuthGuard('jwt-refresh'))
    @Post('refresh')
    @ApiBody({ required: true, schema: { properties: { isRemember: { type: 'boolean', example: true } } } })
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Refresh access token' })
    @ApiOkResponseData(AuthDataResponse)
    @ApiUnauthorized('Invalid or expired refresh token')
    async refreshTokens(@Request() req: { user: any }, @Body('isRemember') isRemember: boolean): Promise<AuthDataResponse> {
        return this.authService.refreshTokens(req.user.userId, req.user.refreshToken, isRemember);
    }

    @HttpCode(HttpStatus.OK)
    @Post('reset-password')
    @ApiOperation({ summary: 'Reset password' })
    @ApiOkResponseMessage('Successfully changing password, please log in')
    @ApiBadRequest(['Invalid token'])

    async resetPassword(@Body() resetPasswordDto: ResetPasswordDto): Promise<string> {
        await this.authService.resetPassword(
            resetPasswordDto.token,
            resetPasswordDto.newPassword
        );
        return 'Successfully changing password, please log in';
    }

    @HttpCode(HttpStatus.OK)
    @Post('forgot-password')
    @ApiOperation({ summary: 'Request password reset' })
    @ApiOkResponseMessage('If an account with that email exists, a password reset link has been sent.')
    @ApiBadRequest('Invalid email format')

    async forgetPassword(@Body() forgetPasswordDto: ForgetPasswordDto): Promise<string> {
        await this.authService.sendResetPasswordLink(
            forgetPasswordDto.email,
        );
        return 'If an account with that email exists, a password reset link has been sent.';
    }

    @HttpCode(HttpStatus.OK)
    @UseGuards(AuthGuard('jwt'))
    @Post('logout')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Logout' })
    @ApiOkResponseMessage('Logout successful. Token invalidated.')

    async logout(@Request() req: { user: User }): Promise<string> {
        await this.authService.logout(req.user.user_id);
        return 'Logout successful. Token invalidated.';
    }
}