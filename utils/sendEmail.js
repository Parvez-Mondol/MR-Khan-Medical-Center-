let nodemailer = null;
try {
  nodemailer = require('nodemailer');
} catch (e) {
  nodemailer = null;
}

// If SMTP env vars are present and nodemailer is installed, use SMTP; otherwise
// fall back to a console logger. This keeps the app usable in development
// without requiring the dependency or SMTP configuration.
const hasSmtp = !!process.env.SMTP_HOST && nodemailer;

let transporter = null;
if (hasSmtp) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: process.env.SMTP_USER
      ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
      : undefined,
  });
} else if (!nodemailer && process.env.SMTP_HOST) {
  console.warn('SMTP configured but `nodemailer` is not installed — emails will be logged to console. Run `npm install` to enable SMTP.');
}

module.exports = async function sendEmail({ to, subject, html, text }) {
  if (transporter) {
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || 'no-reply@khan-medical-center.local',
      to,
      subject,
      text: text || undefined,
      html: html || undefined,
    });
    console.log('sendEmail: sent', info.messageId);
    return info;
  }

  // Fallback: log to console
  console.log('sendEmail (console fallback) — to:', to, 'subject:', subject);
  if (html) console.log('HTML body:', html);
  return Promise.resolve();
};

