import { Injectable } from '@nestjs/common';
import formData from 'form-data';
import Mailgun from 'mailgun.js';

@Injectable()
export class MailService {
  private mg;

  constructor() {
    const mailgun = new Mailgun(formData);
    this.mg = mailgun.client({
      username: 'api',
      key: process.env.MAILGUN_API_KEY!, // store this in `.env`
    });
  }

  async sendEmail(to: string, subject: string, text: string) {
    const domain = process.env.MAILGUN_DOMAIN; // e.g., mg.yourdomain.com

    return this.mg.messages.create(domain, {
      from: `Your App <noreply@${domain}>`,
      to,
      subject,
      text,
    });
  }
}
