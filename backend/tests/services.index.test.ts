/* eslint-disable @typescript-eslint/no-require-imports */
describe('services/index', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    // Clear module cache before each test
    jest.resetModules();
    // Reset environment to original state
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv;
  });

  it('should export mock service when USE_MOCK_SHEETS is true', () => {
    process.env.USE_MOCK_SHEETS = 'true';
    delete process.env.CI;
    const { sheetsService } = require('../src/services/index');
    const { mockSheetsService } = require('./mockSheetsService');
    
    expect(sheetsService).toBe(mockSheetsService);
  });

  it('should export mock service when CI is true', () => {
    process.env.CI = 'true';
    delete process.env.USE_MOCK_SHEETS;
    const { sheetsService } = require('../src/services/index');
    const { mockSheetsService } = require('./mockSheetsService');
    
    expect(sheetsService).toBe(mockSheetsService);
  });

  it('should export real service when neither USE_MOCK_SHEETS nor CI is true', () => {
    delete process.env.USE_MOCK_SHEETS;
    delete process.env.CI;
    
    // The real service will be loaded - this will work because we have valid base64 in test env
    const { sheetsService } = require('../src/services/index');
    
    // Just verify it's not the mock service
    const { mockSheetsService } = require('./mockSheetsService');
    expect(sheetsService).not.toBe(mockSheetsService);
  });
});
