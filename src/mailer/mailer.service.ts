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

    const subject = 'Đặt lại mật khẩu tài khoản của bạn';

    const emailHtml = `
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 20px; }
        .container {
          max-width: 600px; margin: auto; background: #ffffff; padding: 24px;
          border-radius: 8px; border: 1px solid #e5e7eb;
        }
        h1 { color: #111827; font-size: 22px; margin-bottom: 12px; }
        p { color: #374151; font-size: 15px; line-height: 1.6; }
        .btn {
          display: inline-block; margin-top: 16px; padding: 12px 24px;
          background-color: #2563eb; color: white !important; text-decoration: none;
          border-radius: 6px; font-weight: bold; font-size: 15px;
        }
        .footer {
          margin-top: 32px; font-size: 13px; text-align: center; color: #6b7280;
        }
      </style>
    </head>

    <body>
      <div class="container">
        <h1>Xin chào, ${name} </h1>

        <p>Bạn đã yêu cầu đặt lại mật khẩu tài khoản của mình.</p>
        <p>Nhấn vào nút bên dưới để tạo mật khẩu mới:</p>

        <a href="${resetLink}" class="btn">Đặt lại mật khẩu</a>

        <p style="margin-top: 20px;">
          Liên kết này sẽ <b>hết hạn sau 1 giờ</b>.  
          Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.
        </p>

        <div class="footer">
          © Solar String – Customer Support
        </div>
      </div>
    </body>
    </html>
    `;

    await this.nestMailerService.sendMail({
        to: toEmail,
        from: 'Solar String <noreply@yourapp.com>',
        subject,
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

  const subject = `Xác nhận đơn hàng #${payload.orderId} – Solar String`;

  const formattedTotal = new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(payload.totalAmount);

  const paymentLabel =
    payload.paymentMethod === 'COD'
      ? 'Thanh toán khi nhận hàng (COD)'
      : 'Thanh toán Online';

  const emailHtml = `
  <html>
  <head>
    <style>
      body {
        font-family: Arial, sans-serif;
        background: #f4f6f8;
        padding: 24px;
      }
      .container {
        max-width: 650px;
        margin: auto;
        background: #ffffff;
        padding: 32px;
        border-radius: 12px;
        border: 1px solid #e5e7eb;
      }
      h1 {
        font-size: 22px;
        color: #1f2937;
        margin-bottom: 12px;
        font-weight: 600;
      }
      p {
        font-size: 15px;
        color: #374151;
        line-height: 1.6;
      }
      .summary {
        background: #fafafa;
        padding: 20px;
        border-radius: 8px;
        margin-top: 18px;
        border: 1px solid #e5e7eb;
      }
      .row {
        display: flex;
        justify-content: space-between;
        margin-bottom: 14px;
        font-size: 15px;
      }
      .label {
        font-weight: 600;
        color: #374151;
      }
      .value {
        color: #111827;
      }
      .footer {
        margin-top: 28px;
        text-align: center;
        font-size: 13px;
        color: #6b7280;
      }
    </style>
  </head>

  <body>
    <div class="container">
      <h1>Xin chào ${name},</h1>

      <p>
        Cảm ơn bạn đã đặt hàng tại <b>Solar String</b>.  
        Dưới đây là thông tin đơn hàng của bạn:
      </p>

      <div class="summary">
        <div class="row">
          <span class="label">Mã đơn hàng: </span>
          <span class="value">#${payload.orderId}</span>
        </div>

        <div class="row">
          <span class="label">Tổng thanh toán: </span>
          <span class="value">${formattedTotal}</span>
        </div>

        <div class="row">
          <span class="label">Phương thức thanh toán: </span>
          <span class="value">${paymentLabel}</span>
        </div>

        <div class="row" style="align-items:flex-start;">
          <span class="label">Địa chỉ giao hàng: </span>
          <span class="value" style="max-width:350px;">${payload.shippingAddress}</span>
        </div>
      </div>

      <p style="margin-top:20px;">
        Đơn hàng đang được xử lý. Chúng tôi sẽ giao hàng trong thời gian sớm nhất.
        Nếu bạn cần hỗ trợ, hãy phản hồi email này.
      </p>

      <div class="footer">
        © Solar String – Trân trọng cảm ơn bạn đã tin tưởng chúng tôi.
      </div>
    </div>
  </body>
  </html>
  `;

  await this.nestMailerService.sendMail({
    to: toEmail,
    from: 'Solar String <noreply@solarstring.com>',
    subject,
    html: emailHtml,
  });
}
}