import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { AppMailerService } from './mailer.service';

@Module({
  providers: [MailerService]
})
export class MailerModule {}
