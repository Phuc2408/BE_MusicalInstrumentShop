import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from 'src/users/users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from 'src/users/entities/user.entity';
import * as bcrypt from 'bcryptjs';
import { PasswordResetToken } from './entities/password-reset-token.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MailerService } from '../mailer/mailer.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
        private configService: ConfigService,
        private mailService: MailerService,

        @InjectRepository(PasswordResetToken)
        private readonly tokenRepository: Repository<PasswordResetToken>,
    ) { }

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
            throw new ConflictException('Email is existed');
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

        const jti = uuidv4();

        const payload = {
            email: user.email,
            sub: user.user_id,
            role: user.role,
            jti: jti
        };

        const accessToken = this.jwtService.sign(payload, {
            expiresIn: this.configService.get('JWT_ACCESS_EXPIRES') || '15m'
        });

        const refreshToken = this.jwtService.sign(payload, {
            secret: JWT_SECRET,
            expiresIn: REFRESH_EXPIRES,
        });

        // 3. Chỉ Hash cái JTI thôi (36 ký tự -> Bcrypt ăn tốt)
        const refreshTokenHash = await bcrypt.hash(jti, 10);

        // 4. Lưu Hash của JTI vào DB
        await this.usersService.updateRefreshTokenHash(user.user_id, refreshTokenHash);

        return {
            user: { ...user }, // (Code cũ của bạn)
            access_token: accessToken,
            refresh_token: refreshToken,
        };
    }

    async refreshTokens(userId: number, currentRefreshToken: string): Promise<any> {
        const user = await this.usersService.findOneById(userId);

        if (!user || !user.refreshTokenHash) {
            throw new UnauthorizedException('Access Denied');
        }

        // 1. Decode token để lấy payload (không cần verify lại vì Guard đã verify rồi)
        // Hoặc dùng this.jwtService.verify(currentRefreshToken) nếu muốn chắc ăn 100%
        const decoded = this.jwtService.decode(currentRefreshToken) as any;

        if (!decoded || !decoded.jti) {
            throw new UnauthorizedException('Invalid token: JTI not found');
        }

        // 2. Lấy jti từ token gửi lên
        const tokenJti = decoded.jti;

        // 3. So sánh jti này với Hash lưu trong DB
        const isMatch = await bcrypt.compare(tokenJti, user.refreshTokenHash);

        if (isMatch) {
            // Khớp -> JTI hợp lệ -> Tạo mới (Rotate)
            return await this.login(user);
        } else {
            // Không khớp -> Có thể là token cũ bị dùng lại hoặc token giả
            await this.usersService.updateRefreshTokenHash(userId, null);
            throw new UnauthorizedException('Invalid refresh token');
        }
    }

    async resetPassword(tokenString: string, newPassword: string): Promise<void> {
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

    async sendResetPasswordLink(email: string): Promise<void> {
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
            const frontendUrl = this.configService.get('FRONTEND_URL') || 'http://localhost:5173';
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