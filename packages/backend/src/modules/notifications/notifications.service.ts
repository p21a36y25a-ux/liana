import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: configService.get('SMTP_HOST', 'smtp.gmail.com'),
      port: configService.get<number>('SMTP_PORT', 587),
      secure: false,
      auth: {
        user: configService.get('SMTP_USER'),
        pass: configService.get('SMTP_PASSWORD'),
      },
    });
  }

  async sendEmail(to: string, subject: string, html: string): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: this.configService.get('SMTP_FROM', 'noreply@liana-hr.com'),
        to,
        subject,
        html,
      });
      this.logger.log(`Email sent to ${to}: ${subject}`);
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}: ${error.message}`);
    }
  }

  async sendPunchNotification(employee: { email: string; firstName: string }, punchType: string): Promise<void> {
    const type = punchType === 'check_in' ? 'Check-In' : 'Check-Out';
    const time = new Date().toLocaleTimeString();
    await this.sendEmail(
      employee.email,
      `${type} Confirmed - ${new Date().toLocaleDateString()}`,
      `<h2>Hello ${employee.firstName},</h2><p>Your ${type.toLowerCase()} was recorded at <strong>${time}</strong>.</p>`,
    );
  }

  async sendLeaveStatusNotification(employee: { email: string; firstName: string }, status: string, leaveType: string): Promise<void> {
    const statusMsg = status === 'approved' ? 'Approved ✅' : 'Rejected ❌';
    await this.sendEmail(
      employee.email,
      `Leave Request ${statusMsg}`,
      `<h2>Hello ${employee.firstName},</h2><p>Your <strong>${leaveType.replace('_', ' ')}</strong> request has been <strong>${statusMsg}</strong>.</p>`,
    );
  }
}
