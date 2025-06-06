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

  async sendPasswordResetEmail(to: string, token: string) {
    const url = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
    const mailgun = new Mailgun(FormData);
    const mg = mailgun.client({
      username: 'api',
      key: process.env.MAILGUN_API_KEY!,
      url: 'https://api.eu.mailgun.net',
    });
    try {
      const data = await mg.messages.create('mg.wakapadi.io', {
        from: 'Wakapadi <postmaster@mg.wakapadi.io>',
        to: [`Samuel Egbajie <${to}>`],
        subject: 'Password Reset',
        text: `
        <p>Click below to reset your password:</p>
        <a href="${url}">${url}</a>
      `,
      });

      console.log(data); // logs response data
    } catch (error) {
      console.log(error); //logs any error
    }
  }
}
