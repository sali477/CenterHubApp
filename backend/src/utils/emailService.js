import nodemailer from 'nodemailer';

const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

export const sendEmail = async ({ email, subject, message, html }) => {
  const transporter = createTransporter();

  await transporter.sendMail({
    from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
    to: email,
    subject,
    text: message,
    html: html || message,
  });
};

export const sendPasswordResetEmail = async (user, resetToken) => {
  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

  const message = `
    <h1>Password Reset Request</h1>
    <p>Hi ${user.name},</p>
    <p>You requested a password reset. Click the link below:</p>
    <a href="${resetUrl}">${resetUrl}</a>
    <p>This link expires in 10 minutes.</p>
    <p>If you didn't request this, please ignore this email.</p>
  `;

  await sendEmail({
    email: user.email,
    subject: 'CentreHub Morocco - Password Reset',
    message: `Reset your password: ${resetUrl}`,
    html: message,
  });
};
