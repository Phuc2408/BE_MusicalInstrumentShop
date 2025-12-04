import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as SibApiV3Sdk from '@sendinblue/client';

@Injectable()
export class MailerService {
  private brevo: SibApiV3Sdk.TransactionalEmailsApi;
  private fromEmail: string;
  private fromName: string;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('BREVO_API_KEY');
    if (!apiKey) {
      throw new Error('BREVO_API_KEY missing');
    }

    this.brevo = new SibApiV3Sdk.TransactionalEmailsApi();
    this.brevo.setApiKey(SibApiV3Sdk.TransactionalEmailsApiApiKeys.apiKey, apiKey);

    this.fromEmail = this.configService.get<string>('BREVO_FROM_EMAIL')!;
    this.fromName = this.configService.get<string>('BREVO_FROM_NAME')!;
  }

  private async send(to: string, subject: string, html: string): Promise<void> {
    try {
      await this.brevo.sendTransacEmail({
        sender: { email: this.fromEmail, name: this.fromName },
        to: [{ email: to }],
        subject: subject,
        htmlContent: html,
      });

      console.log(`Brevo email sent → ${to}`);
    } catch (error) {
      console.error('Brevo send error:', error?.response?.body || error);
    }
  }

  async sendPasswordResetEmail(
    toEmail: string,
    name: string,
    resetLink: string,
  ): Promise<void> {
    const subject = 'Đặt lại mật khẩu tài khoản của bạn';

    const emailHtml = `
      <h2>Xin chào, ${name}</h2>
      <p>Bạn đã yêu cầu đặt lại mật khẩu.</p>

      <a href="${resetLink}"
         style="padding:10px 20px;background:#2563eb;color:white;text-decoration:none;border-radius:6px;">
         Đặt lại mật khẩu
      </a>

      <p>Liên kết hết hạn sau 1 giờ.</p>
      <p>© Solar String – Customer Support</p>
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

    const total = new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(payload.totalAmount);

    const paymentLabel =
      payload.paymentMethod === 'COD'
        ? 'Thanh toán khi nhận hàng (COD)'
        : 'Thanh toán Online';

    const html = `
      <h2>Xin chào, ${name}</h2>
      <p>Cảm ơn bạn đã đặt hàng tại Solar String.</p>

      <p><b>Mã đơn hàng:</b> #${payload.orderId}</p>
      <p><b>Tổng thanh toán:</b> ${total}</p>
      <p><b>Thanh toán:</b> ${paymentLabel}</p>
      <p><b>Địa chỉ giao hàng:</b> ${payload.shippingAddress}</p>

      <p>Chúng tôi sẽ sớm giao hàng cho bạn.</p>
      <p>© Solar String – Trân trọng cảm ơn.</p>
    `;

    return this.send(toEmail, subject, html);
  }
}
