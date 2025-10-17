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
        
        const emailHtml = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Đặt lại Mật khẩu</title>
                <style>
                    .button {
                        display: inline-block; 
                        padding: 10px 20px; 
                        background-color: #007bff; 
                        color: #ffffff !important; 
                        text-decoration: none; 
                        border-radius: 5px;
                    }
                </style>
            </head>
            <body>
                <h1>Xin chào, ${name}!</h1>
                <p>Bạn đã yêu cầu đặt lại mật khẩu. Vui lòng nhấp vào nút dưới đây để hoàn tất:</p>
                <a href="${resetLink}" class="button">
                    Đặt lại Mật khẩu
                </a>
                <p>Liên kết này sẽ hết hạn sau 1 giờ.</p>
                <p>Nếu bạn không yêu cầu hành động này, vui lòng bỏ qua email này.</p>
                <br/>
                <p>Cảm ơn,</p>
                <p>Đội ngũ Hỗ trợ Cửa hàng Nhạc cụ</p>
            </body>
            </html>
        `;

        await this.nestMailerService.sendMail({
            to: toEmail,
            from: 'Ứng dụng của bạn <noreply@yourapp.com>',
            subject: subject,
            html: emailHtml, 
            
        });
    }
}