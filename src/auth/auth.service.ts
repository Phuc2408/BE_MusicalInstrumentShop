import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from 'src/users/users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from 'src/users/entities/user.entity';
import * as bcrypt from 'bcrypt';
import { PasswordResetToken } from './entities/password-reset-token.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MailerService } from '../mailer/mailer.service';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
        private configService: ConfigService, 
        private mailService: MailerService,

        @InjectRepository(PasswordResetToken)
        private readonly tokenRepository: Repository<PasswordResetToken>,
    ) {}

    async validateUser(email: string, password: string): Promise<any> {
        const user = await this.usersService.findOneByEmail(email); 
        
        if (!user) {
            return null;
        }
        
        if (!user.passwordHash) {
            return { message: 'User is created with another method.' }; 
        }
        
        const isMatch = await bcrypt.compare(password, user.passwordHash);
        
        if (!isMatch) {
            return null; 
        }
        
        const { passwordHash, ...result } = user;
        
        return result; 
    }

    async register(createUserDto: CreateUserDto, role: string = 'customer') {
        if (await this.usersService.isEmailTaken(createUserDto.email)) {
            throw new ConflictException('Email is exist');
        }
        
        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(createUserDto.password, salt);
        
        const userToSave = {
            ...createUserDto,
            passwordHash: hashedPassword,
            loginMethod: 'local' as const, 
            role: role,
        };

        const newUser = await this.usersService.create(userToSave);
        const { passwordHash, ...result } = newUser;
        return result;
    }

    async handleSocialLogin(provider: 'google', profile: any): Promise<User> {
        const providerId = profile.id;
        const email = profile.emails[0].value;
        const fullName = profile.displayName;
        
        let user = await this.usersService.findOneBySocialId(provider, providerId); 
        if (user) return user; 

        const existingUser = await this.usersService.findOneByEmail(email);
        if (existingUser) {
            return this.usersService.updateSocialId(existingUser.user_id, provider, providerId); 
        }
        
        const newUser = await this.usersService.createUserWithProvider(fullName, email, providerId, provider);
        return newUser;
    }

    async login(user: User, rememberMe: boolean = false) {
        const JWT_SECRET = this.configService.get('JWT_SECRET')!;
        const REFRESH_EXPIRES = rememberMe 
        ? this.configService.get('JWT_REFRESH_LONG_EXPIRES') || '7d' 
        : this.configService.get('JWT_REFRESH_SHORT_EXPIRES') || '1d';
        console.log(REFRESH_EXPIRES)

        const payload = { email: user.email, sub: user.user_id, role: user.role };

        const accessToken = this.jwtService.sign(payload); 

        const refreshToken = this.jwtService.sign(payload, {
            secret: JWT_SECRET, 
            expiresIn: REFRESH_EXPIRES,
        });
        
        const refreshTokenHash = await bcrypt.hash(refreshToken, 10);
        await this.usersService.updateRefreshTokenHash(user.user_id, refreshTokenHash);
        
        return {
            user: {
                id: user.user_id,
                email: user.email,
                role: user.role,
                full_name: user.full_name,
            },
            access_token: accessToken,
            refresh_token: refreshToken,
        };
    }

    async refreshTokens(userId: number, currentRefreshToken: string): Promise<any>{
        const user = await this.usersService.findOneById(userId);
        if (!user || !user.refreshTokenHash) {
            throw new UnauthorizedException('Access Denied: Refresh token not found.');
        }
        const isMatch = await bcrypt.compare(currentRefreshToken, user.refreshTokenHash);
        if (!isMatch) {

        await this.usersService.updateRefreshTokenHash(userId, null);
        throw new UnauthorizedException('Access Denied: Invalid refresh token.');
        }
        return this.login(user);
    }

    async resetPassword(tokenString: string, newPassword: string): Promise<void>{
        const token = await this.tokenRepository.findOne({
            where: { token: tokenString },
            relations: ['user']
        })
        if (!token) {
            throw new UnauthorizedException('Invalid or missing reset token.');
        }
        if (token.expiresAt < new Date()) {
            await this.tokenRepository.remove(token); 
            throw new UnauthorizedException('Reset token has expired.');
        }
        const user = token.user;
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);
        await this.usersService.updatePassword(user.user_id, hashedPassword);
        await this.tokenRepository.remove(token);
    }

    async logout(userId: number): Promise<void> {
        await this.usersService.updateRefreshTokenHash(userId, null);
    }

    async sendResetPasswordLink(email: string): Promise<void>{
        const user = await this.usersService.findOneByEmail(email)
        if (!user) {
            console.log(`Password reset requested for non-existent email: ${email}`);
            return;
        }
            const payload = {
                sub: user.user_id,
                email: user.email 
        }
        const tokenString = this.jwtService.sign(payload, { 
        secret: this.configService.get('JWT_SECRET'), 
        expiresIn: '1h', 
        });
        const expires = new Date();
        expires.setHours(expires.getHours() + 1);
        const newToken = this.tokenRepository.create({
        token: tokenString,
        userId: user.user_id,
        expiresAt: expires,
    });
    await this.tokenRepository.save(newToken);
        try {
            const frontendUrl = this.configService.get('FRONTEND_URL') || 'http://localhost:3000';
            const resetLink = `${frontendUrl}/reset-password?token=${tokenString}`;
            await this.mailService.sendPasswordResetEmail(
                user.email,
                user.full_name || 'User', 
                resetLink,
            )
        }
        catch (err) {
            console.error(`Failed to send reset email to ${user.email}:`, err);
        }
    }
}