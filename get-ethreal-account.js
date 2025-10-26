import nodemailer from 'nodemailer';

async function createTestAccount() {
  try {
    console.log('Creating Ethereal test account...');
    
    // Create a test Ethereal account
    const testAccount = await nodemailer.createTestAccount();
    
    console.log('\n‚úÖ Ethereal test account created!');
    console.log('Add these to your .env file:\n');
    console.log('ETHEREAL_USER=' + testAccount.user);
    console.log('ETHEREAL_PASS=' + testAccount.pass);
    console.log('\nOr use these commands to update your .env file:');
    console.log(`echo "ETHEREAL_USER=${testAccount.user}" >> .env`);
    console.log(`echo "ETHEREAL_PASS=${testAccount.pass}" >> .env`);
    
    // Test the credentials
    const transporter = nodemailer.createTransporter({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    
    // Verify connection
    await transporter.verify();
    console.log('\n‚úÖ SMTP connection verified successfully!');
    
    // Send a test email
    const info = await transporter.sendMail({
      from: '"Test" <test@example.com>',
      to: 'test@example.com',
      subject: 'Test Email',
      text: 'This is a test email from your new Ethereal account!',
    });
    
    console.log('\nÌ≥ß Test email sent!');
    console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
    
  } catch (error) {
    console.error('‚ùå Error creating test account:', error);
  }
}

createTestAccount();
