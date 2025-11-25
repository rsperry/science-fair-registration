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
      expect(response.body.projectId).toBeDefined();
      expect(response.body.projectId).toBe(100);
      expect(response.body.timestamp).toBeDefined();
      expect(response.body.message).toBe('Registration successful');
    });

    it('should register a project with additional students', async () => {
      const validData = {
        studentName: 'John Doe',
        teacher: 'Mrs. Smith',
        grade: '5',
        projectName: 'Team Project',
        parentGuardianName: 'Jane Doe',
        parentGuardianEmail: 'jane@example.com',
        consentGiven: true,
        additionalStudents: [
          {
            studentName: 'Alice Smith',
            teacher: 'Mr. Johnson',
            grade: '5',
            parentGuardianName: 'Bob Smith',
            parentGuardianEmail: 'bob@example.com',
          },
          {
            studentName: 'Charlie Brown',
            teacher: 'Mrs. Davis',
            grade: '6',
            parentGuardianName: 'David Brown',
            parentGuardianEmail: 'david@example.com',
          },
        ],
      };

      const response = await request(app)
        .post('/api/register')
        .send(validData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.projectId).toBe(100);
    });

    it('should register with additional students but no project name', async () => {
      const validData = {
        studentName: 'John Doe',
        teacher: 'Mrs. Smith',
        grade: '5',
        parentGuardianName: 'Jane Doe',
        parentGuardianEmail: 'jane@example.com',
        consentGiven: true,
        additionalStudents: [
          {
            studentName: 'Alice Smith',
            teacher: 'Mr. Johnson',
            grade: '5',
            // Missing parentGuardianName and parentGuardianEmail to test || '' branches
          },
        ],
      };

      const response = await request(app)
        .post('/api/register')
        .send(validData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.projectId).toBe(100);
    });

    it('should register with optional grade field', async () => {
      const validData = {
        studentName: 'John Doe',
        teacher: 'Mrs. Smith',
        grade: '4th',
        projectName: 'Science Project',
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
      expect(response.body.errors.length).toBeGreaterThan(0);
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
      expect(response.body.errors).toBeDefined();
    });

    it('should handle Google Sheets service errors', async () => {
      const { googleSheetsService } = require('../src/services/googleSheets');
      
      // Make appendRegistration throw an error
      googleSheetsService.appendRegistration.mockRejectedValueOnce(
        new Error('Google Sheets API error')
      );

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
      expect(response.body.message).toContain('error');

      // Reset mock
      googleSheetsService.appendRegistration.mockResolvedValue(undefined);
    });

    it('should handle non-Error exceptions', async () => {
      const { googleSheetsService } = require('../src/services/googleSheets');
      
      // Make appendRegistration throw a non-Error object
      googleSheetsService.appendRegistration.mockRejectedValueOnce(
        'String error message'
      );

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
      expect(response.body.message).toContain('error');

      // Reset mock
      googleSheetsService.appendRegistration.mockResolvedValue(undefined);
    });

    it('should handle validation errors with field paths', async () => {
      const invalidData = {
        studentName: 'John Doe',
        teacher: 'Mrs. Smith',
        parentGuardianName: 'Jane Doe',
        parentGuardianEmail: 'bademail',
        consentGiven: true,
      };

      const response = await request(app)
        .post('/api/register')
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
      expect(response.body.errors.some((e: any) => e.field.includes('parentGuardianEmail'))).toBe(true);
    });
  });

  describe('GET /api/teachers', () => {
    it('should return list of teachers', async () => {
      const response = await request(app)
        .get('/api/teachers')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.teachers)).toBe(true);
      expect(response.body.teachers).toContain('Mrs. Smith');
      expect(response.body.teachers).toContain('Mr. Johnson');
    });

    it('should handle errors when fetching teachers', async () => {
      const { googleSheetsService } = require('../src/services/googleSheets');
      
      // Make getTeachers throw an error
      googleSheetsService.getTeachers.mockRejectedValueOnce(
        new Error('Failed to fetch teachers')
      );

      const response = await request(app)
        .get('/api/teachers')
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Failed to fetch teachers');

      // Reset mock
      googleSheetsService.getTeachers.mockResolvedValue(['Mrs. Smith', 'Mr. Johnson']);
    });
  });

  describe('GET /api/metadata', () => {
    it('should return fair metadata', async () => {
      const response = await request(app)
        .get('/api/metadata')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.school).toBe('Test School');
      expect(response.body.contactEmail).toBe('test@example.com');
    });

    it('should handle errors when fetching metadata', async () => {
      const { googleSheetsService } = require('../src/services/googleSheets');
      
      // Make getFairMetadata throw an error
      googleSheetsService.getFairMetadata.mockRejectedValueOnce(
        new Error('Failed to fetch metadata')
      );

      const response = await request(app)
        .get('/api/metadata')
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Failed to fetch fair metadata');

      // Reset mock
      googleSheetsService.getFairMetadata.mockResolvedValue({
        school: 'Test School',
        contactEmail: 'test@example.com',
      });
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
