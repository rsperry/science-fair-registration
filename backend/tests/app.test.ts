import request from 'supertest';
import app from '../src/app';
import { sheetsService } from '../src/services';

// Mock the service factory
jest.mock('../src/services', () => ({
  sheetsService: {
    getNextProjectId: jest.fn().mockResolvedValue(100),
    appendRegistration: jest.fn().mockResolvedValue(undefined),
    getTeachers: jest.fn().mockResolvedValue([
      { name: 'Mrs. Smith', grade: '5th' },
      { name: 'Mr. Johnson', grade: '4th' }
    ]),
    getFairMetadata: jest.fn().mockResolvedValue({
      school: 'Test School',
      contactEmail: 'test@example.com',
      registrationDeadline: '2026-12-31',
      scienceFairDate: '2027-01-15',
    }),
  },
}));

const mockSheetsService = sheetsService as jest.Mocked<typeof sheetsService>;

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
        .set('Origin', 'http://localhost:4173');

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
      // Make the service throw an error
      mockSheetsService.getNextProjectId.mockRejectedValueOnce(new Error('Test error'));

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
