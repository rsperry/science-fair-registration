describe('services/index', () => {
  beforeEach(() => {
    // Clear module cache before each test
    jest.resetModules();
  });

  it('should export mock service when USE_MOCK_SHEETS is true', () => {
    process.env.USE_MOCK_SHEETS = 'true';
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
    
    // Mock the googleSheets module to avoid initialization errors
    jest.mock('../src/services/googleSheets', () => ({
      googleSheetsService: {
        getNextProjectId: jest.fn(),
        appendRegistration: jest.fn(),
        getTeachers: jest.fn(),
        getFairMetadata: jest.fn(),
      },
    }));

    const { sheetsService } = require('../src/services/index');
    const { googleSheetsService } = require('../src/services/googleSheets');
    
    expect(sheetsService).toBe(googleSheetsService);
  });
});
