import nodemailer from 'nodemailer';
import { config } from '../config/index.js';
import AppError from '../utils/AppError.js';

const getMissingSmtpKeys = () => {
  const missing = [];
  if (!config.smtp.host) missing.push('SMTP_HOST');
  if (!config.smtp.user) missing.push('SMTP_USER');
  if (!config.smtp.password) missing.push('SMTP_PASSWORD');
  if (!config.smtp.from) missing.push('SMTP_FROM');
  return missing;
};

export const assertSmtpConfigured = () => {
  const missing = getMissingSmtpKeys();
  if (missing.length > 0) {
    throw new AppError(`Konfigurasi email pemulihan belum lengkap: ${missing.join(', ')}`, 503);
  }
  if (config.smtp.from.includes('.local')) {
    throw new AppError('SMTP_FROM harus menggunakan email/domain pengirim yang sudah terverifikasi di provider SMTP.', 503);
  }
};

const createTransporter = () => {
  assertSmtpConfigured();

  return nodemailer.createTransport({
    host: config.smtp.host,
    port: config.smtp.port,
    secure: config.smtp.secure,
    auth: {
      user: config.smtp.user,
      pass: config.smtp.password,
    },
  });
};

export const sendPasswordResetEmail = async ({ to, resetUrl, expiresMinutes }) => {
  const transporter = createTransporter();

  await transporter.sendMail({
    from: config.smtp.from,
    to,
    subject: 'Reset Kata Sandi CakapKarier AI',
    text: [
      'Anda menerima email ini karena ada permintaan pemulihan kata sandi akun CakapKarier AI.',
      `Buka link berikut untuk membuat kata sandi baru: ${resetUrl}`,
      `Link ini berlaku selama ${expiresMinutes} menit dan hanya dapat digunakan satu kali.`,
      'Jika Anda tidak meminta pemulihan kata sandi, abaikan email ini.',
    ].join('\n\n'),
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#1f2937">
        <h2 style="color:#004A7C">Reset Kata Sandi CakapKarier AI</h2>
        <p>Anda menerima email ini karena ada permintaan pemulihan kata sandi akun CakapKarier AI.</p>
        <p>
          <a href="${resetUrl}" style="display:inline-block;background:#004A7C;color:#ffffff;text-decoration:none;padding:12px 18px;border-radius:10px;font-weight:700">
            Buat Kata Sandi Baru
          </a>
        </p>
        <p>Link ini berlaku selama ${expiresMinutes} menit dan hanya dapat digunakan satu kali.</p>
        <p>Jika tombol tidak bisa dibuka, salin link berikut ke browser:</p>
        <p style="word-break:break-all;color:#475569">${resetUrl}</p>
        <p>Jika Anda tidak meminta pemulihan kata sandi, abaikan email ini.</p>
      </div>
    `,
  });
};
