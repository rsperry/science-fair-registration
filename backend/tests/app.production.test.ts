/* eslint-disable @typescript-eslint/no-require-imports */
// Test production mode branches separately
describe('App Production Mode', () => {
  let originalNodeEnv: string | undefined;

  beforeAll(() => {
    // Save original NODE_ENV
    originalNodeEnv = process.env.NODE_ENV;
    // Set to production before any modules are loaded
    process.env.NODE_ENV = 'production';
  });

  afterAll(() => {
    // Restore original NODE_ENV
    process.env.NODE_ENV = originalNodeEnv;
    jest.resetModules();
  });

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    jest.resetModules();
  });

  it('should use production error messages', async () => {
    // Mock config with production environment
    jest.doMock('../src/config', () => ({
      config: {
        nodeEnv: 'production',
        port: 4000,
        frontendOrigin: 'http://localhost:5173',
        googleSheetsId: 'test-sheet-id',
        googleServiceAccountKey: 'test-key',
        rateLimitWindow: 3600000,
        rateLimitMax: 10,
      },
    }));

    // Mock Google Sheets service to throw an error
    jest.doMock('../src/services/googleSheets', () => ({
      googleSheetsService: {
        getNextProjectId: jest.fn().mockRejectedValue(new Error('Database connection failed')),
        appendRegistration: jest.fn().mockResolvedValue(undefined),
        getTeachers: jest.fn().mockResolvedValue(['Mrs. Smith']),
        getFairMetadata: jest.fn().mockResolvedValue({
          school: 'Test School',
          contactEmail: 'test@example.com',
        }),
      },
    }));

    const appProd = require('../src/app').default;
    const request = require('supertest');

    const validData = {
      studentName: 'John Doe',
      teacher: 'Mrs. Smith',
      parentGuardianName: 'Jane Doe',
      parentGuardianEmail: 'jane@example.com',
      consentGiven: true,
    };

    const response = await request(appProd)
      .post('/api/register')
      .send(validData)
      .expect(500);

    expect(response.body.success).toBe(false);
    // In production, should show generic message, not the actual error
    expect(response.body.message).toBe('An error occurred while processing your registration. Please try again later.');
    expect(response.body.message).not.toContain('Database connection failed');
  });

  it('should handle static file routing in production - API routes', async () => {
    jest.doMock('../src/config', () => ({
      config: {
        nodeEnv: 'production',
        port: 4000,
        frontendOrigin: 'http://localhost:5173',
        googleSheetsId: 'test-sheet-id',
        googleServiceAccountKey: 'test-key',
        rateLimitWindow: 3600000,
        rateLimitMax: 10,
      },
    }));

    jest.doMock('../src/services/googleSheets', () => ({
      googleSheetsService: {
        getNextProjectId: jest.fn().mockResolvedValue(100),
        appendRegistration: jest.fn().mockResolvedValue(undefined),
        getTeachers: jest.fn().mockResolvedValue(['Mrs. Smith']),
        getFairMetadata: jest.fn().mockResolvedValue({
          school: 'Test School',
          contactEmail: 'test@example.com',
        }),
      },
    }));

    const appProd = require('../src/app').default;
    const request = require('supertest');

    // Test that /api routes still work (should skip SPA handler)
    const apiResponse = await request(appProd)
      .get('/api/teachers')
      .expect(200);

    expect(apiResponse.body.success).toBe(true);
    expect(apiResponse.body.teachers).toContain('Mrs. Smith');
  });

  it('should handle static file routing in production - health endpoint', async () => {
    jest.doMock('../src/config', () => ({
      config: {
        nodeEnv: 'production',
        port: 4000,
        frontendOrigin: 'http://localhost:5173',
        googleSheetsId: 'test-sheet-id',
        googleServiceAccountKey: 'test-key',
        rateLimitWindow: 3600000,
        rateLimitMax: 10,
      },
    }));

    jest.doMock('../src/services/googleSheets', () => ({
      googleSheetsService: {
        getNextProjectId: jest.fn().mockResolvedValue(100),
        appendRegistration: jest.fn().mockResolvedValue(undefined),
        getTeachers: jest.fn().mockResolvedValue(['Mrs. Smith']),
        getFairMetadata: jest.fn().mockResolvedValue({
          school: 'Test School',
          contactEmail: 'test@example.com',
        }),
      },
    }));

    const appProd = require('../src/app').default;
    const request = require('supertest');

    // Test that /health endpoint works (should skip SPA handler)
    const healthResponse = await request(appProd)
      .get('/health')
      .expect(200);

    expect(healthResponse.body.status).toBe('healthy');
    expect(healthResponse.body.environment).toBe('production');
  });

  it('should attempt to serve SPA for non-API routes in production', async () => {
    jest.doMock('../src/config', () => ({
      config: {
        nodeEnv: 'production',
        port: 4000,
        frontendOrigin: 'http://localhost:5173',
        googleSheetsId: 'test-sheet-id',
        googleServiceAccountKey: 'test-key',
        rateLimitWindow: 3600000,
        rateLimitMax: 10,
      },
    }));

    jest.doMock('../src/services/googleSheets', () => ({
      googleSheetsService: {
        getNextProjectId: jest.fn().mockResolvedValue(100),
        appendRegistration: jest.fn().mockResolvedValue(undefined),
        getTeachers: jest.fn().mockResolvedValue(['Mrs. Smith']),
        getFairMetadata: jest.fn().mockResolvedValue({
          school: 'Test School',
          contactEmail: 'test@example.com',
        }),
      },
    }));

    const appProd = require('../src/app').default;
    const request = require('supertest');

    // Test that non-API, non-health routes attempt to serve index.html
    // This will fail in test because there's no actual public directory
    // but it proves the branch is taken
    const response = await request(appProd)
      .get('/some-client-route');

    // Should attempt to serve static file, which will fail with 404 or 500 error
    // The important thing is it doesn't return our API 404 response
    expect(response.body.message).not.toBe('Endpoint not found');
    
    // In production, if error handler is triggered, should show generic message
    if (response.status === 500 && response.body.message) {
      expect(response.body.message).toBe('Internal server error');
    }
  });

  it('should handle POST to /health path in production (SPA handler)', async () => {
    jest.doMock('../src/config', () => ({
      config: {
        nodeEnv: 'production',
        port: 4000,
        frontendOrigin: 'http://localhost:5173',
        googleSheetsId: 'test-sheet-id',
        googleServiceAccountKey: 'test-key',
        rateLimitWindow: 3600000,
        rateLimitMax: 10,
      },
    }));

    jest.doMock('../src/services/googleSheets', () => ({
      googleSheetsService: {
        getNextProjectId: jest.fn().mockResolvedValue(100),
        appendRegistration: jest.fn().mockResolvedValue(undefined),
        getTeachers: jest.fn().mockResolvedValue(['Mrs. Smith']),
        getFairMetadata: jest.fn().mockResolvedValue({
          school: 'Test School',
          contactEmail: 'test@example.com',
        }),
      },
    }));

    const appProd = require('../src/app').default;
    const request = require('supertest');

    // POST to /health should bypass the GET /health endpoint and reach the SPA handler
    // The SPA handler should call next() for /health path
    const response = await request(appProd)
      .post('/health');

    // Should not serve the file since it passes through with next()
    // This tests the second part of the OR condition
    expect(response.body.message).not.toBe('Endpoint not found');
  });

  it('should show generic error messages in production (global error handler)', async () => {
    // Create a custom app instance with production config and a route that throws
    jest.resetModules();
    
    jest.doMock('../src/config', () => ({
      config: {
        nodeEnv: 'production',
        port: 4000,
        frontendOrigin: 'http://localhost:5173',
        googleSheetsId: 'test-sheet-id',
        googleServiceAccountKey: 'test-key',
        rateLimitWindow: 3600000,
        rateLimitMax: 10,
      },
    }));

    jest.doMock('../src/services/googleSheets', () => ({
      googleSheetsService: {
        getNextProjectId: jest.fn().mockResolvedValue(100),
        appendRegistration: jest.fn().mockResolvedValue(undefined),
        getTeachers: jest.fn().mockResolvedValue(['Mrs. Smith']),
        getFairMetadata: jest.fn().mockResolvedValue({
          school: 'Test School',
          contactEmail: 'test@example.com',
        }),
      },
    }));

    const appProd = require('../src/app').default;
    const request = require('supertest');

    // Add a test route that throws an error to trigger the global error handler
    appProd.get('/test-error', () => {
      throw new Error('Test error with detailed message');
    });

    const response = await request(appProd)
      .get('/test-error')
      .expect(500);

    // In production mode, should return generic error message, not the actual error
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('Internal server error');
    expect(response.body.message).not.toContain('Test error with detailed message');
  });
});
