/* eslint-disable @typescript-eslint/no-require-imports */

// Mock googleapis before any imports
jest.mock('googleapis');

// Mock config before any imports to prevent GoogleSheetsService constructor from failing
jest.mock('../src/config', () => ({
  config: {
    nodeEnv: 'test',
    port: 3001,
    frontendOrigin: 'http://localhost:5173',
    googleSheetsId: 'test-sheet-id',
    googleServiceAccountKey: Buffer.from(JSON.stringify({
      type: 'service_account',
      project_id: 'test-project',
      private_key_id: 'test-key-id',
      private_key: '-----BEGIN PRIVATE KEY-----\ntest\n-----END PRIVATE KEY-----\n',
      client_email: 'test@test.iam.gserviceaccount.com',
      client_id: '123456789',
      auth_uri: 'https://accounts.google.com/o/oauth2/auth',
      token_uri: 'https://oauth2.googleapis.com/token',
      auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
      client_x509_cert_url: 'https://www.googleapis.com/robot/v1/metadata/x509/test%40test.iam.gserviceaccount.com'
    })).toString('base64'),
    rateLimitWindow: 15,
    rateLimitMax: 10
  }
}));

describe('services/index', () => {
  let originalUseMockSheets: string | undefined;
  let originalCI: string | undefined;

  beforeEach(() => {
    // Save original environment variables
    originalUseMockSheets = process.env.USE_MOCK_SHEETS;
    originalCI = process.env.CI;
    
    // Clear module cache before each test
    jest.resetModules();
    
    // Set up googleapis mock for each test
    const mockGoogle = require('googleapis').google as jest.Mocked<typeof import('googleapis').google>;
    mockGoogle.auth = {
      GoogleAuth: jest.fn().mockImplementation(() => ({})),
    } as unknown as typeof mockGoogle.auth;
    mockGoogle.sheets = jest.fn().mockReturnValue({
      spreadsheets: {
        values: {
          get: jest.fn(),
          append: jest.fn(),
        },
      },
    }) as unknown as typeof mockGoogle.sheets;
  });

  afterEach(() => {
    // Restore original environment variables
    if (originalUseMockSheets !== undefined) {
      process.env.USE_MOCK_SHEETS = originalUseMockSheets;
    } else {
      delete process.env.USE_MOCK_SHEETS;
    }
    
    if (originalCI !== undefined) {
      process.env.CI = originalCI;
    } else {
      delete process.env.CI;
    }
  });

  it('should export mock service when USE_MOCK_SHEETS is true', () => {
    process.env.USE_MOCK_SHEETS = 'true';
    delete process.env.CI;
    
    const { sheetsService } = require('../src/services/index');
    const { mockSheetsService } = require('../src/services/mockSheetsService');
    
    expect(sheetsService).toBe(mockSheetsService);
  });

  it('should export mock service when CI is true', () => {
    process.env.CI = 'true';
    delete process.env.USE_MOCK_SHEETS;
    
    const { sheetsService } = require('../src/services/index');
    const { mockSheetsService } = require('../src/services/mockSheetsService');
    
    expect(sheetsService).toBe(mockSheetsService);
  });

  it('should export real service when neither USE_MOCK_SHEETS nor CI is true', () => {
    delete process.env.USE_MOCK_SHEETS;
    delete process.env.CI;
    
    // The real service will be loaded - this will work because we have valid base64 in test env
    const { sheetsService } = require('../src/services/index');
    
    // Just verify it's not the mock service
    const { mockSheetsService } = require('../src/services/mockSheetsService');
    expect(sheetsService).not.toBe(mockSheetsService);
  });
});
