import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';

@Injectable()
export class EmailService implements OnModuleInit {
  private readonly logger = new Logger(EmailService.name);
  private transporter: Transporter;

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    const host = this.configService.get<string>('SMTP_HOST');
    const port = this.configService.get<number>('SMTP_PORT');
    const user = this.configService.get<string>('SMTP_USER');
    const pass = this.configService.get<string>('SMTP_PASS');

    if (!user || !pass) {
      // Create Ethereal test account for development
      try {
        const testAccount = await nodemailer.createTestAccount();
        this.transporter = nodemailer.createTransport({
          host: 'smtp.ethereal.email',
          port: 587,
          secure: false,
          auth: {
            user: testAccount.user,
            pass: testAccount.pass,
          },
        });
        this.logger.log(`📧 Using Ethereal test email: ${testAccount.user}`);
      } catch {
        this.logger.warn('⚠️ Could not create Ethereal account — emails disabled');
        this.transporter = nodemailer.createTransport({ jsonTransport: true });
      }
    } else {
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure: false,
        auth: { user, pass },
      });
    }
  }

  async sendEmail(to: string, subject: string, html: string) {
    try {
      const info = await this.transporter.sendMail({
        from: this.configService.get<string>('SMTP_FROM', 'noreply@reservations.com'),
        to,
        subject,
        html,
      });

      const previewUrl = nodemailer.getTestMessageUrl(info);
      if (previewUrl) {
        this.logger.log(`📧 Preview URL: ${previewUrl}`);
      }

      this.logger.log(`Email sent to ${to}: ${subject}`);
      return info;
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}: ${error.message}`);
    }
  }
}
