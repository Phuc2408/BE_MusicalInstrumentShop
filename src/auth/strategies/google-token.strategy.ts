import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-custom';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { OAuth2Client } from 'google-auth-library';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class GoogleTokenStrategy extends PassportStrategy(Strategy, 'google-token') {
    private googleClient: OAuth2Client;
  
    constructor(
        private authService: AuthService,
        private configService: ConfigService,
    ) {
        super();
        const GOOGLE_CLIENT_ID = this.configService.get<string>('GOOGLE_CLIENT_ID');
        if (!GOOGLE_CLIENT_ID) {
            throw new Error('GOOGLE_CLIENT_ID is not configured in environment.');
        }
        this.googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);
    }
    async validate(req: Request): Promise<User> {
    const idToken = req.body.id_token;
    const GOOGLE_CLIENT_ID = this.configService.get<string>('GOOGLE_CLIENT_ID');

    if (!idToken) {
      throw new UnauthorizedException('No ID token provided from client');
    }

    try {
      const ticket = await this.googleClient.verifyIdToken({
        idToken: idToken,
        audience: GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();
      
      if (!payload || !payload.sub || !payload.name || !payload.email) {
          throw new UnauthorizedException('Invalid Google ID token payload');
      }

      const profile = {
        id: payload.sub, 
        displayName: payload.name,
        emails: [{ value: payload.email }],
      };

      const user = await this.authService.handleSocialLogin('google', profile);
      
      return user; 
    } catch (error) {
      console.error("Error in GoogleTokenStrategy:", error.message);
      throw new UnauthorizedException('Invalid Google ID token or verification failed.');
    }
  }
}