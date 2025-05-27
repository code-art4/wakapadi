import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.DEV_EMAIL,
      pass: process.env.DEV_EMAIL_PASSWORD,
    },
  });

  async sendPasswordResetEmail(to: string, token: string) {
    const url = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

    await this.transporter.sendMail({
      from: `"Wakapadi" <${process.env.DEV_EMAIL}>`,
      to,
      subject: 'Password Reset',
      html: `
        <p>Click below to reset your password:</p>
        <a href="${url}">${url}</a>
      `,
    });
  }
}
