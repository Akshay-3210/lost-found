import nodemailer from 'nodemailer';

function getTransportConfig() {
  const user = process.env.GMAIL_SMTP_EMAIL;
  const pass = process.env.GMAIL_APP_PASSWORD;

  if (!user || !pass) {
    throw new Error('Gmail SMTP is not configured. Add GMAIL_SMTP_EMAIL and GMAIL_APP_PASSWORD.');
  }

  return {
    service: 'gmail',
    auth: {
      user,
      pass,
    },
  };
}

export async function sendVerificationEmail({
  email,
  name,
  verificationUrl,
}: {
  email: string;
  name?: string;
  verificationUrl: string;
}) {
  const transporter = nodemailer.createTransport(getTransportConfig());
  const from = process.env.EMAIL_FROM || process.env.GMAIL_SMTP_EMAIL || 'no-reply@example.com';
  const greetingName = name?.trim() || 'there';

  await transporter.sendMail({
    from,
    to: email,
    subject: 'Verify your Lost & Found account',
    text: `Hi ${greetingName},

Please verify your Lost & Found account by opening this link within 1 hour:
${verificationUrl}

If you did not create this account, you can ignore this email.`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #18181b;">
        <h2 style="margin-bottom: 12px;">Verify your Lost &amp; Found account</h2>
        <p>Hi ${greetingName},</p>
        <p>Click the button below to verify your email address. This link stays valid for <strong>1 hour</strong>.</p>
        <p style="margin: 24px 0;">
          <a href="${verificationUrl}" style="background: #18181b; color: #ffffff; padding: 12px 20px; border-radius: 10px; text-decoration: none; display: inline-block;">
            Verify Email
          </a>
        </p>
        <p>If the button does not work, open this link:</p>
        <p><a href="${verificationUrl}">${verificationUrl}</a></p>
        <p>If you did not create this account, you can safely ignore this email.</p>
      </div>
    `,
  });
}
