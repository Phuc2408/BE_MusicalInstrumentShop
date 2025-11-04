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
    private googleExchangeClient: OAuth2Client;
    private googleVerifyClient: OAuth2Client; 
    constructor(
        private authService: AuthService,
        private configService: ConfigService,
    ) {
        super();
        const GOOGLE_CLIENT_ID = this.configService.get<string>('GOOGLE_CLIENT_ID');
        const GOOGLE_SECRET_ID = this.configService.get<string>('GOOGLE_SECRET_ID');

        if (!GOOGLE_CLIENT_ID || !GOOGLE_SECRET_ID) {
             throw new Error('Google environment variables (ID or Secret) are not configured.');
        }
        
        this.googleExchangeClient = new OAuth2Client(
            GOOGLE_CLIENT_ID,
            GOOGLE_SECRET_ID, 
            this.configService.get<string>('GOOGLE_REDIRECT_URI') || 'postmessage',
        );
        
        this.googleVerifyClient = new OAuth2Client(GOOGLE_CLIENT_ID);
    }
    
    async validate(req: Request): Promise<User> {
        const code = req.body.code;
        let idToken: string| null | undefined;
        
        if (!code) {
            throw new UnauthorizedException('No authorization code provided from client.');
        }

        try {
            console.log('Attempting to exchange Google code...');
            
          const { tokens } = await this.googleExchangeClient.getToken(code);
          
            idToken = tokens.id_token;

            if (!idToken) {
                console.error("Exchange succeeded but ID Token is missing.");
                throw new UnauthorizedException('Failed to retrieve ID token from Google.');
            }
          
        } catch (error) {
            console.error("Error exchanging code for token:", error.message);
            throw new UnauthorizedException('Invalid or expired Google authorization code.');
        }
        
        try {
            const GOOGLE_CLIENT_ID = this.configService.get<string>('GOOGLE_CLIENT_ID');
            
            const ticket = await this.googleVerifyClient.verifyIdToken({
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
            console.error("Error in GoogleTokenStrategy (Verification):", error.message);
            throw new UnauthorizedException('Invalid Google ID token or verification failed.');
        }
    }
}