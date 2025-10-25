import nodemailer from 'nodemailer';
import { Observer } from '../patterns/observer.js';

export class EmailObserver extends Observer {
  constructor() {
    super('EmailObserver');
    this.transporter = null;
    this.initializeTransporter();
  }

  async initializeTransporter() {
    try {
      const testAccount = await nodemailer.createTestAccount();
      
      this.transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        },
        connectionTimeout: 30000,
        greetingTimeout: 30000,
        socketTimeout: 30000
      });

      console.log('✅ EmailObserver initialized with Ethereal test account');
      console.log('📧 Test account:', testAccount.user);
      console.log('🔧 SMTP configured with 30s timeouts');
      
    } catch (error) {
      console.error('❌ Failed to initialize EmailObserver:', error);
    }
  }

  // ... keep all your existing methods the same ...
}