import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class MailerService {
  private resend: Resend | null = null;
  private from: string;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('RESEND_API_KEY');

    if (apiKey) {
      this.resend = new Resend(apiKey);
    }

    this.from =
      this.configService.get<string>('EMAIL_FROM') ||
      'onboarding@resend.dev';
  }

  private async send(to: string, subject: string, html: string): Promise<void> {
    if (!this.resend) return;

    const { error } = await this.resend.emails.send({
      from: this.from,
      to,
      subject,
      html,
    });

    // Không log lỗi, chỉ silently fail
    if (error) return;
  }

  async sendPasswordResetEmail(
    toEmail: string,
    name: string,
    resetLink: string,
  ): Promise<void> {
    const subject = 'Đặt lại mật khẩu tài khoản của bạn';

    const emailHtml = `
    <html>
      <body style="font-family: Arial, sans-serif;">
        <h1>Xin chào, ${name}</h1>

        <p>Bạn đã yêu cầu đặt lại mật khẩu tài khoản của mình.</p>

        <p>
          <a href="${resetLink}"
            style="display:inline-block;padding:12px 24px;background:#2563eb;color:#fff;
            text-decoration:none;border-radius:6px;">
            Đặt lại mật khẩu
          </a>
        </p>

        <p>Liên kết sẽ hết hạn sau 1 giờ.</p>

        <p style="color:#6b7280">© Solar String – Customer Support</p>
      </body>
    </html>
    `;

    return this.send(toEmail, subject, emailHtml);
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
      <body style="font-family: Arial, sans-serif;">
        <h1>Xin chào ${name},</h1>

        <p>Cảm ơn bạn đã đặt hàng tại <b>Solar String</b>.</p>

        <div style="background:#fafafa;padding:16px;border-radius:8px;">
          <p><b>Mã đơn hàng:</b> #${payload.orderId}</p>
          <p><b>Tổng thanh toán:</b> ${formattedTotal}</p>
          <p><b>Phương thức thanh toán:</b> ${paymentLabel}</p>
          <p><b>Địa chỉ giao hàng:</b> ${payload.shippingAddress}</p>
        </div>

        <p>Đơn hàng đang được xử lý và sẽ được giao sớm nhất.</p>

        <p style="color:#6b7280">© Solar String – Trân trọng cảm ơn bạn.</p>
      </body>
    </html>
    `;

    return this.send(toEmail, subject, emailHtml);
  }
}
