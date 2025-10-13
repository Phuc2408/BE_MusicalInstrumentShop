import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local') {
    constructor(private authService: AuthService) {
    super({
      usernameField: 'email',
    });
    }
    
    async validate(email: string, password: string): Promise<any>{
        const validationResult = await this.authService.validateUser(email, password); 

    if (!validationResult) {
      throw new UnauthorizedException('Wrong email or password');
        }
        if (validationResult.message) {
      throw new UnauthorizedException(validationResult.message);
    }
    
    return validationResult; 

    }

    
}