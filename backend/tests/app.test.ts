/* eslint-disable @typescript-eslint/no-require-imports */
import request from 'supertest';
import app from '../src/app';

// Mock the Google Sheets service
jest.mock('../src/services/googleSheets', () => ({
  googleSheetsService: {
    getNextProjectId: jest.fn().mockResolvedValue(100),
    appendRegistration: jest.fn().mockResolvedValue(undefined),
    getTeachers: jest.fn().mockResolvedValue(['Mrs. Smith', 'Mr. Johnson']),
    getFairMetadata: jest.fn().mockResolvedValue({
      school: 'Test School',
      contactEmail: 'test@example.com',
    }),
  },
}));

describe('App Configuration', () => {
  describe('Security Middleware', () => {
    it('should set security headers', async () => {
      const response = await request(app).get('/health');
      
      expect(response.headers).toHaveProperty('x-content-type-options');
      expect(response.headers).toHaveProperty('x-frame-options');
    });
  });

  describe('Health Check', () => {
    it('should return health status with correct structure', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'healthy');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('environment');
      expect(new Date(response.body.timestamp).toString()).not.toBe('Invalid Date');
    });
  });

  describe('CORS Configuration', () => {
    it('should set CORS headers', async () => {
      const response = await request(app)
        .get('/health')
        .set('Origin', 'http://localhost:5173');

      expect(response.headers).toHaveProperty('access-control-allow-origin');
    });
  });

  describe('Rate Limiting', () => {
    it('should accept requests under rate limit', async () => {
      const validData = {
        studentName: 'John Doe',
        teacher: 'Mrs. Smith',
        parentGuardianName: 'Jane Doe',
        parentGuardianEmail: 'jane@example.com',
        consentGiven: true,
      };

      const response = await request(app)
        .post('/api/register')
        .send(validData)
        .expect(201);

      expect(response.body.success).toBe(true);
    });
  });

  describe('Body Parsing', () => {
    it('should parse JSON body', async () => {
      const validData = {
        studentName: 'John Doe',
        teacher: 'Mrs. Smith',
        parentGuardianName: 'Jane Doe',
        parentGuardianEmail: 'jane@example.com',
        consentGiven: true,
      };

      const response = await request(app)
        .post('/api/register')
        .send(validData)
        .set('Content-Type', 'application/json');

      expect(response.status).toBeLessThan(500);
    });
  });

  describe('404 Handler (Development)', () => {
    it('should return 404 for unknown routes in development', async () => {
      const response = await request(app)
        .get('/nonexistent-route')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('not found');
    });
  });

  describe('Error Handler', () => {
    it('should handle errors and return 500 in development mode', async () => {
      const { googleSheetsService } = require('../src/services/googleSheets');
      
      // Make the service throw an error
      googleSheetsService.getNextProjectId.mockRejectedValueOnce(new Error('Test error'));

      const validData = {
        studentName: 'John Doe',
        teacher: 'Mrs. Smith',
        parentGuardianName: 'Jane Doe',
        parentGuardianEmail: 'jane@example.com',
        consentGiven: true,
      };

      const response = await request(app)
        .post('/api/register')
        .send(validData)
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBeDefined();
    });
  });

  describe('API Routes', () => {
    it('should route to /api/register', async () => {
      const response = await request(app)
        .post('/api/register')
        .send({});

      expect(response.status).not.toBe(404);
    });

    it('should route to /api/teachers', async () => {
      const response = await request(app)
        .get('/api/teachers')
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should route to /api/metadata', async () => {
      const response = await request(app)
        .get('/api/metadata')
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });
});
