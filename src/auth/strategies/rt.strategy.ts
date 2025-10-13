import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy, StrategyOptions } from 'passport-jwt';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

@Injectable()
export class RtStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
    constructor(private configService: ConfigService) {
        super({
            jwtFromRequest: ExtractJwt.fromBodyField('refreshToken'),
            ignoreExpiration: false,
            secretOrKey: configService.get<string>('JWT_SECRET'),
            passReqToCallback: true,
        } as any);
    }

    async validate(req: Request, payload: any){
        const refreshToken = req.body.refreshToken;
        if (!refreshToken) {
        throw new UnauthorizedException('Refresh token not found in body.');
        }
        return { 
        userId: payload.sub, 
        email: payload.email, 
        refreshToken 
    };
    }
}