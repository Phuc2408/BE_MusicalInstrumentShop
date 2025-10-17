import { Injectable } from '@nestjs/common';
import { MailerService as NestMailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailerService {
    constructor(private readonly nestMailerService: NestMailerService) {}
    
    async sendPasswordResetEmail(
        toEmail: string,
        name: string,
        resetLink: string,
    ): Promise<void> {
        const subject = 'Đặt lại Mật khẩu Tài khoản của bạn';
        const templatePath = 'reset-password'; 

        await this.nestMailerService.sendMail({
            to: toEmail,
            from: 'Ứng dụng của bạn <noreply@yourapp.com>',
            subject: subject,
            template: templatePath,
            context: {
                name: name,
                resetLink: resetLink,
            },
        });
    }
}