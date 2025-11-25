import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersService } from 'src/users/users.service';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
    constructor(
    private configService: ConfigService,
    private usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET')!,
    });
    }
    async validate(payload: { sub: number; email: string; role: string }): Promise<User>{
        const user = await this.usersService.findOneById(payload.sub); 

    if (!user) {
      throw new UnauthorizedException('Invalid token or user not found.'); 
        }
        const { passwordHash, refreshTokenHash, ...result } = user;
        return result as User;
    }
}