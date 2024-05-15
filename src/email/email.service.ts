import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
    //Sends an email, for the purpose of resetting passwords.
  async sendEmail(to: string, subject: string, body: string) {
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
          user: process.env.EMAILUSERNAME,
          pass: process.env.EMAILPASSWORD,
        },
        tls: {
          rejectUnauthorized: false
        }
    });

    try {
      await transporter.sendMail({
        from: 'platocraticmap@gmail.com',
        to: to,
        subject: subject,
        text: body,
      });
    }catch (err) {
      console.error(err);
    }
    
  }
}