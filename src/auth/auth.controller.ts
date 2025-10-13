import { Controller, Post, Body, UseGuards, Request, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto'; 
import { User } from 'src/users/entities/user.entity';
import { LoginUserDto } from './dto/login-user.dto'; 
import { RefreshTokenDto } from './dto/refresh-token.dto'; 

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Post('register')
    async register(@Body() createUserDto: CreateUserDto) {
        return this.authService.register(createUserDto); 
    }

    @HttpCode(HttpStatus.OK)
    @UseGuards(AuthGuard('local')) 
    async loginLocal(@Request() req: { user: User }, @Body() loginDto: LoginUserDto) {
        return this.authService.login(req.user); 
    }

    @HttpCode(HttpStatus.OK)
    @UseGuards(AuthGuard('google-token')) 
    @Post('login/google')
    async loginGoogle(@Request() req: { user: User }){
        return this.authService.login(req.user);
    }

    @HttpCode(HttpStatus.OK)
    @UseGuards(AuthGuard('jwt-refresh')) 
    @Post('refresh')
    async refreshTokens(@Request() req: { user: any }, @Body() refreshDto: RefreshTokenDto) {
        const userId = req.user.userId;
        const refreshToken = req.user.refreshToken; 

        return this.authService.refreshTokens(userId, refreshToken);
    }
}
