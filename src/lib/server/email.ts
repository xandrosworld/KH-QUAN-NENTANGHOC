import nodemailer from 'nodemailer';

type OtpMailOptions = {
  to: string;
  otp: string;
  purpose: 'register' | 'reset_password';
};

function hasSmtpConfig() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_FROM);
}

function getSubject(purpose: OtpMailOptions['purpose']) {
  if (purpose === 'register') return 'Ma xac thuc dang ky TronX';
  return 'Ma dat lai mat khau TronX';
}

function getBodyText(otp: string, purpose: OtpMailOptions['purpose']) {
  const action = purpose === 'register' ? 'dang ky tai khoan' : 'dat lai mat khau';
  return `Ma OTP de ${action} TronX cua ban la: ${otp}. Ma co hieu luc trong 10 phut.`;
}

export async function sendOtpEmail({ to, otp, purpose }: OtpMailOptions) {
  if (!hasSmtpConfig()) {
    console.info(`[TronX OTP] ${purpose} ${to}: ${otp}`);
    return { sent: false };
  }

  const port = Number(process.env.SMTP_PORT ?? 587);
  const secure = process.env.SMTP_SECURE === 'true' || port === 465;
  const auth = process.env.SMTP_USER
    ? {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS ?? '',
      }
    : undefined;

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure,
    auth,
  });

  const text = getBodyText(otp, purpose);

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to,
    subject: getSubject(purpose),
    text,
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111827">
        <h2 style="margin:0 0 12px;color:#16a34a">TronX OTP</h2>
        <p>${text}</p>
        <div style="font-size:28px;font-weight:700;letter-spacing:8px;margin:18px 0">${otp}</div>
        <p style="color:#6b7280;font-size:13px">Neu ban khong thuc hien thao tac nay, vui long bo qua email.</p>
      </div>
    `,
  });

  return { sent: true };
}
