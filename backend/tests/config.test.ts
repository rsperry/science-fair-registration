/* eslint-disable @typescript-eslint/no-require-imports */
describe('Config Module', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // Clear module cache and reset environment
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    // Restore original environment
    process.env = originalEnv;
    jest.resetModules();
  });

  it('should load config with all environment variables set', () => {
    process.env.NODE_ENV = 'test';
    process.env.PORT = '5000';
    process.env.FRONTEND_ORIGIN = 'http://localhost:3000';
    process.env.GOOGLE_SHEETS_ID = 'test-sheet-id';
    process.env.GOOGLE_SERVICE_ACCOUNT_KEY_BASE64 = 'test-key-base64';
    process.env.RECAPTCHA_SECRET = 'test-recaptcha-secret';
    process.env.RATE_LIMIT_WINDOW = '7200000';
    process.env.RATE_LIMIT_MAX = '20';
    process.env.SENTRY_DSN = 'https://sentry.io/test';

    const { config } = require('../src/config');

    expect(config.nodeEnv).toBe('test');
    expect(config.port).toBe(5000);
    expect(config.frontendOrigin).toBe('http://localhost:3000');
    expect(config.googleSheetsId).toBe('test-sheet-id');
    expect(config.googleServiceAccountKey).toBe('test-key-base64');
    expect(config.recaptchaSecret).toBe('test-recaptcha-secret');
    expect(config.rateLimitWindow).toBe(7200000);
    expect(config.rateLimitMax).toBe(20);
    expect(config.sentryDsn).toBe('https://sentry.io/test');
  });

  it('should use default values when environment variables are not set', () => {
    // Mock dotenv to not load .env file
    jest.doMock('dotenv', () => ({
      config: jest.fn(),
    }));

    // Set only required env vars, clear all others
    process.env = {
      GOOGLE_SHEETS_ID: 'test-sheet-id',
      GOOGLE_SERVICE_ACCOUNT_KEY_BASE64: 'test-key',
    };

    jest.isolateModules(() => {
      const { config } = require('../src/config');

      expect(config.nodeEnv).toBe('development');
      expect(config.port).toBe(4000);
      expect(config.frontendOrigin).toBe('http://localhost:4173');
      expect(config.rateLimitWindow).toBe(3600000);
      expect(config.rateLimitMax).toBe(10);
    });

    jest.dontMock('dotenv');
  });

  it('should throw error when GOOGLE_SHEETS_ID is missing', () => {
    // Mock dotenv to not load .env file
    jest.doMock('dotenv', () => ({
      config: jest.fn(),
    }));

    process.env = {
      GOOGLE_SERVICE_ACCOUNT_KEY_BASE64: 'test-key',
    };

    expect(() => {
      jest.isolateModules(() => {
        require('../src/config');
      });
    }).toThrow('GOOGLE_SHEETS_ID environment variable is required');

    jest.dontMock('dotenv');
  });

  it('should throw error when GOOGLE_SHEETS_ID is empty string', () => {
    process.env = {
      GOOGLE_SHEETS_ID: '',
      GOOGLE_SERVICE_ACCOUNT_KEY_BASE64: 'test-key',
    };

    expect(() => {
      jest.isolateModules(() => {
        require('../src/config');
      });
    }).toThrow('GOOGLE_SHEETS_ID environment variable is required');
  });

  it('should throw error when both service account key options are missing', () => {
    // Mock dotenv to not load .env file
    jest.doMock('dotenv', () => ({
      config: jest.fn(),
    }));

    process.env = {
      GOOGLE_SHEETS_ID: 'test-sheet-id',
    };

    expect(() => {
      jest.isolateModules(() => {
        require('../src/config');
      });
    }).toThrow('GOOGLE_SERVICE_ACCOUNT_KEY_BASE64 environment variable is required');

    jest.dontMock('dotenv');
  });

  it('should throw error when service account key is empty', () => {
    process.env = {
      GOOGLE_SHEETS_ID: 'test-sheet-id',
      GOOGLE_SERVICE_ACCOUNT_KEY_BASE64: '',
    };

    expect(() => {
      jest.isolateModules(() => {
        require('../src/config');
      });
    }).toThrow('GOOGLE_SERVICE_ACCOUNT_KEY_BASE64 environment variable is required');
  });

  it('should parse port as integer', () => {
    process.env = {
      PORT: '8080',
      GOOGLE_SHEETS_ID: 'test-sheet-id',
      GOOGLE_SERVICE_ACCOUNT_KEY_BASE64: 'test-key',
    };

    const { config } = require('../src/config');

    expect(config.port).toBe(8080);
    expect(typeof config.port).toBe('number');
  });

  it('should parse rate limit values as integers', () => {
    process.env = {
      RATE_LIMIT_WINDOW: '1800000',
      RATE_LIMIT_MAX: '50',
      GOOGLE_SHEETS_ID: 'test-sheet-id',
      GOOGLE_SERVICE_ACCOUNT_KEY_BASE64: 'test-key',
    };

    const { config } = require('../src/config');

    expect(config.rateLimitWindow).toBe(1800000);
    expect(config.rateLimitMax).toBe(50);
    expect(typeof config.rateLimitWindow).toBe('number');
    expect(typeof config.rateLimitMax).toBe('number');
  });
});
