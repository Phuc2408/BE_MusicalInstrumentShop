import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { LocalStrategy } from './strategies/local.strategy';
import { GoogleTokenStrategy } from './strategies/google-token.strategy';
import { MailerModule } from 'src/mailer/mailer.module'
import { PasswordResetToken } from './entities/password-reset-token.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from 'src/users/users.module';
import { JwtStrategy } from './strategies/jwt.strategy';
import { RtStrategy } from './strategies/rt.strategy';


@Module({
  imports: [
    TypeOrmModule.forFeature([PasswordResetToken]),
    MailerModule,
    UsersModule, 
    JwtModule.registerAsync({
      imports: [ConfigModule], 
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'), 
      })
    })
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
