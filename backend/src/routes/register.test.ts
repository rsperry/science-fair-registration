import request from 'supertest';
import app from '../app';

// Mock the Google Sheets service
jest.mock('../services/googleSheets', () => ({
  googleSheetsService: {
    getNextProjectId: jest.fn().mockResolvedValue(100),
    appendRegistration: jest.fn().mockResolvedValue(undefined),
    getTeachers: jest.fn().mockResolvedValue(['Mrs. Smith', 'Mr. Johnson']),
  },
}));

describe('Registration API', () => {
  describe('POST /api/register', () => {
    it('should register a valid project', async () => {
      const validData = {
        studentName: 'John Doe',
        teacher: 'Mrs. Smith',
        projectName: 'Volcano Experiment',
        parentGuardianName: 'Jane Doe',
        parentGuardianEmail: 'jane@example.com',
        consentGiven: true,
      };

      const response = await request(app)
        .post('/api/register')
        .send(validData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.registrationId).toBeDefined();
      expect(response.body.projectId).toBe(100);
      expect(response.body.timestamp).toBeDefined();
    });

    it('should reject registration without required fields', async () => {
      const invalidData = {
        studentName: '',
        teacher: '',
        parentGuardianName: '',
        parentGuardianEmail: '',
        consentGiven: false,
      };

      const response = await request(app)
        .post('/api/register')
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
    });

    it('should reject registration with invalid email', async () => {
      const invalidData = {
        studentName: 'John Doe',
        teacher: 'Mrs. Smith',
        parentGuardianName: 'Jane Doe',
        parentGuardianEmail: 'invalid-email',
        consentGiven: true,
      };

      const response = await request(app)
        .post('/api/register')
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/teachers', () => {
    it('should return list of teachers', async () => {
      const response = await request(app)
        .get('/api/teachers')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.teachers)).toBe(true);
    });
  });

  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body.status).toBe('healthy');
      expect(response.body.timestamp).toBeDefined();
    });
  });
});
