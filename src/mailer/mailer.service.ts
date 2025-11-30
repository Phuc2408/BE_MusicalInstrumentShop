import { Injectable } from '@nestjs/common';
import { MailerService as NestMailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailerService {
    constructor(private readonly nestMailerService: NestMailerService) { }

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

    async sendOrderConfirmationEmail(
        toEmail: string,
        name: string,
        payload: {
            orderId: number;
            totalAmount: number;
            shippingAddress: string;
            paymentMethod: string;
        },
    ): Promise<void> {
        const subject = `Xác nhận đơn hàng #${payload.orderId}`;

        // format tiền VNĐ
        const formattedTotal = new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(payload.totalAmount);

        const paymentLabel =
            payload.paymentMethod === 'COD'
                ? 'Thanh toán khi nhận hàng (COD)'
                : 'Thanh toán online';

        const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
          <title>Xác nhận đơn hàng</title>
          <style>
              .summary-card {
                  border: 1px solid #e5e7eb;
                  border-radius: 8px;
                  padding: 16px;
                  background-color: #f9fafb;
              }
              .summary-row {
                  display: flex;
                  justify-content: space-between;
                  margin-bottom: 8px;
              }
              .summary-label {
                  font-weight: 600;
                  color: #374151;
              }
              .summary-value {
                  color: #111827;
              }
          </style>
      </head>
      <body>
          <h1>Xin chào, ${name}!</h1>
          <p>Cảm ơn bạn đã đặt hàng tại Cửa hàng Nhạc cụ.</p>
          <p>Đơn hàng của bạn đã được tiếp nhận với thông tin như sau:</p>

          <div class="summary-card">
              <div class="summary-row">
                  <span class="summary-label">Mã đơn hàng:</span>
                  <span class="summary-value"> ${payload.orderId}</span>
              </div>
              <div class="summary-row">
                  <span class="summary-label">Tổng thanh toán:</span>
                  <span class="summary-value"> ${formattedTotal}</span>
              </div>
              <div class="summary-row">
                  <span class="summary-label">Hình thức thanh toán:</span>
                  <span class="summary-value"> ${paymentLabel}</span>
              </div>
              <div class="summary-row" style="align-items:flex-start;">
                  <span class="summary-label">Địa chỉ giao hàng:</span>
                  <span class="summary-value" style="max-width: 320px;">
                       ${payload.shippingAddress}
                  </span>
              </div>
          </div>

          <p>Chúng tôi sẽ sớm liên hệ và giao hàng cho bạn trong thời gian sớm nhất.</p>
          <p>Nếu có bất kỳ thắc mắc nào về đơn hàng, bạn có thể trả lời trực tiếp email này.</p>

          <br/>
          <p>Trân trọng,</p>
          <p>Đội ngũ Hỗ trợ Cửa hàng Nhạc cụ</p>
      </body>
      </html>
    `;

        await this.nestMailerService.sendMail({
            to: toEmail,
            from: 'Ứng dụng của bạn <noreply@yourapp.com>',
            subject,
            html: emailHtml,
        });
    }
}