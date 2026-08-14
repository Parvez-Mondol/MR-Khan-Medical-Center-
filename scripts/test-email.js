const nodemailer = require('nodemailer');
require('dotenv').config();

async function main() {
  let transporter;
  if (process.env.SMTP_HOST) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
    });
    console.log('Using SMTP from .env');
  } else {
    console.log('No SMTP configured — creating Ethereal test account');
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      auth: { user: testAccount.user, pass: testAccount.pass },
    });
    console.log('Ethereal account created. Preview messages at the URL logged after send.');
  }

  const to = process.argv[2] || process.env.TEST_EMAIL_TO || 'recipient@example.com';
  const info = await transporter.sendMail({
    from: process.env.SMTP_FROM || 'no-reply@khan-medical-center.local',
    to,
    subject: 'Test email from MR. Khan Medical Center backend',
    text: 'This is a test email sent from the project test script.',
    html: '<p>This is a <strong>test</strong> email sent from the project test script.</p>',
  });

  console.log('Message sent:', info.messageId);
  if (nodemailer.getTestMessageUrl) {
    const preview = nodemailer.getTestMessageUrl(info);
    if (preview) console.log('Preview URL:', preview);
  }
}

main().catch((err) => {
  console.error('Failed to send test email:', err);
  process.exit(1);
});
