import nodemailer from 'nodemailer';

export class EmailService {
  private transporter;

  constructor() {
    // Create Ethereal test account transporter
    this.transporter = nodemailer.createTransporter({
      host: 'smtp.ethereal.email',
      port: 587,
      auth: {
        user: 'your-ethreal-email@ethereal.email', // Replace with actual
        pass: 'your-ethreal-password' // Replace with actual
      }
    });
  }

  async sendWelcomeEmail(to: string, username: string): Promise<void> {
    const mailOptions = {
      from: '"Event App" <noreply@eventapp.com>',
      to,
      subject: 'Welcome to Event Management App!',
      html: `
        <div>
          <h1>Welcome, ${username}!</h1>
          <p>Thank you for registering with our Event Management Application.</p>
          <p>You can now create, manage, and RSVP to events.</p>
          <p><small>This is a mock email from Ethereal service.</small></p>
        </div>
      `
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('Welcome email sent:', info.messageId);
      console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
    } catch (error) {
      console.error('Error sending email:', error);
      throw new Error('Failed to send welcome email');
    }
  }

  async sendEventNotification(to: string, eventTitle: string, action: string): Promise<void> {
    const mailOptions = {
      from: '"Event App" <noreply@eventapp.com>',
      to,
      subject: `Event ${action}: ${eventTitle}`,
      html: `
        <div>
          <h2>Event ${action}</h2>
          <p>The event "${eventTitle}" has been ${action}.</p>
          <p><small>This is a mock notification email.</small></p>
        </div>
      `
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('Event notification sent:', info.messageId);
    } catch (error) {
      console.error('Error sending event notification:', error);
    }
  }
}
