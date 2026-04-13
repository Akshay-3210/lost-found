import crypto from 'crypto';

const VERIFICATION_WINDOW_MS = 60 * 60 * 1000;

export function createEmailVerificationToken() {
  const token = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  const expiresAt = new Date(Date.now() + VERIFICATION_WINDOW_MS);

  return {
    token,
    hashedToken,
    expiresAt,
  };
}

export function hashEmailVerificationToken(token: string) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function normalizeBaseUrl(url: string) {
  return url.trim().replace(/\/+$/, '');
}

export function getAppBaseUrl(preferredBaseUrl?: string) {
  if (preferredBaseUrl) {
    return normalizeBaseUrl(preferredBaseUrl);
  }

  if (process.env.NEXT_PUBLIC_APP_URL) {
    return normalizeBaseUrl(process.env.NEXT_PUBLIC_APP_URL);
  }

  if (process.env.NEXTAUTH_URL) {
    return normalizeBaseUrl(process.env.NEXTAUTH_URL);
  }

  if (process.env.VERCEL_URL) {
    return normalizeBaseUrl(`https://${process.env.VERCEL_URL}`);
  }

  return 'http://localhost:3000';
}

export function buildVerificationUrl(token: string, email: string, redirectTo?: string, baseUrl?: string) {
  const url = new URL('/verify-email', getAppBaseUrl(baseUrl));
  url.searchParams.set('token', token);
  url.searchParams.set('email', email);

  if (redirectTo) {
    url.searchParams.set('redirectTo', redirectTo);
  }

  return url.toString();
}
