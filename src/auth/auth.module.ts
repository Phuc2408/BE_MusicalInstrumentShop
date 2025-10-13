import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { LocalStrategy } from './strategies/local.strategy';
import { GoogleTokenStrategy } from './strategies/google-token.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { RtStrategy } from './strategies/rt.strategy';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [
    UsersModule,
    JwtModule.registerAsync({
      imports: [ConfigModule], 
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'), 
        signOptions: { expiresIn: configService.get('JWT_ACCESS_EXPIRES') },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService,
    LocalStrategy, 
    GoogleTokenStrategy,
    JwtStrategy,
    RtStrategy,
  ]
})
export class AuthModule {}
