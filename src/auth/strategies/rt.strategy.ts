import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy, StrategyOptions } from 'passport-jwt';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class RtStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
    constructor(
        private configService: ConfigService,
        private usersService: UsersService
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get<string>('JWT_SECRET'),
            passReqToCallback: true,
        } as any);
    }

    async validate(req: Request, payload: any){
        const refreshToken = req.get('Authorization')?.replace('Bearer', '').trim();
        if (!refreshToken) {
        throw new UnauthorizedException('Refresh token not found in body.');
        }
        const user = await this.usersService.findOneById(payload.sub); 

        if (!user || !user.refreshTokenHash) {
            throw new UnauthorizedException('Access Denied. Token revoked or User not found.');
        }
        
        return { 
        userId: payload.sub, 
        email: payload.email, 
        refreshToken 
    };
    }
}