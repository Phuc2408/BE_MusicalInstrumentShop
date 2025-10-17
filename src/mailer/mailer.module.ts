import { Module } from '@nestjs/common';
import { MailerModule as NestMailerModule } from '@nestjs-modules/mailer';
import { MailerService } from './mailer.service';
import { ConfigService, ConfigModule } from '@nestjs/config';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';

@Module({
    imports: [
        ConfigModule, 
        NestMailerModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: (configService: ConfigService) => ({
                transport: {
                    host: configService.get('SMTP_HOST'), 
                    port: configService.get('SMTP_PORT'), 
                    secure: configService.get('SMTP_PORT') === 465, 
                    auth: {
                        user: configService.get('SMTP_USER'),
                        pass: configService.get('SMTP_PASS'), 
                    },
                },
                defaults: {
                    from: `"Musical Instrument Shop" <${configService.get('SMTP_USER')}>`, 
                },
            }),
            inject: [ConfigService],
        }),
    ],
    providers: [MailerService],
    exports: [MailerService], 
})
export class MailerModule {}