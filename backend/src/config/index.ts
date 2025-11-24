import dotenv from 'dotenv';
import path from 'path';

// Load .env from root directory (parent of backend/)
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

interface Config {
  nodeEnv: string;
  port: number;
  frontendOrigin: string;
  googleSheetsId: string;
  googleServiceAccountKey: string;
  googleServiceAccountKeyPath?: string;
  recaptchaSecret?: string;
  rateLimitWindow: number;
  rateLimitMax: number;
  sentryDsn?: string;
}

function getConfig(): Config {
  const config: Config = {
    nodeEnv: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT || '4000', 10),
    frontendOrigin: process.env.FRONTEND_ORIGIN || 'http://localhost:5173',
    googleSheetsId: process.env.GOOGLE_SHEETS_ID || '',
    googleServiceAccountKey: process.env.GOOGLE_SERVICE_ACCOUNT_KEY_BASE64 || '',
    googleServiceAccountKeyPath: process.env.GOOGLE_SERVICE_ACCOUNT_KEY_PATH,
    recaptchaSecret: process.env.RECAPTCHA_SECRET,
    rateLimitWindow: parseInt(process.env.RATE_LIMIT_WINDOW || '3600000', 10),
    rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX || '10', 10),
    sentryDsn: process.env.SENTRY_DSN,
  };

  // Validate required config
  if (!config.googleSheetsId) {
    throw new Error('GOOGLE_SHEETS_ID environment variable is required');
  }

  if (!config.googleServiceAccountKey && !config.googleServiceAccountKeyPath) {
    throw new Error(
      'Either GOOGLE_SERVICE_ACCOUNT_KEY_BASE64 or GOOGLE_SERVICE_ACCOUNT_KEY_PATH must be provided'
    );
  }

  return config;
}

export const config = getConfig();
