import nodemailer from 'nodemailer';

function getTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_PORT === '465',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });
}

export async function sendVerificationEmail(email: string, code: string) {
  try {
    const transporter = getTransporter();
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: email,
      subject: 'Email Verification Code',
      html: `
        <h2>Email Verification</h2>
        <p>Your verification code is:</p>
        <h1 style="color: #3b82f6; font-size: 32px; letter-spacing: 4px;">${code}</h1>
        <p>This code is valid for 15 minutes.</p>
      `,
    });
    console.log('✅ Email sent to:', email);
  } catch (error) {
    console.error('Failed to send verification email:', error);
    throw error;
  }
}

export async function sendAbsenceNotification(email: string, employeeName: string, date: string) {
  try {
    const transporter = getTransporter();
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: email,
      subject: 'Attendance Reminder - Missing Check-in',
      html: `
        <h2>Attendance Reminder</h2>
        <p>Hi ${employeeName},</p>
        <p>You have not marked your attendance for <strong>${date}</strong>.</p>
      `,
    });
  } catch (error) {
    console.error('Failed to send absence notification:', error);
    throw error;
  }
}