import request from 'supertest';
import app from '../src/app';
import { sheetsService } from '../src/services';

describe('Registration API', () => {
  // Setup spies before each test
  beforeEach(() => {
    // Reset any existing mock data if using mock service
    if ('reset' in sheetsService && typeof sheetsService.reset === 'function') {
      sheetsService.reset();
    }
    
    // Setup default implementations using jest.spyOn
    jest.spyOn(sheetsService, 'getNextProjectId').mockResolvedValue(100);
    jest.spyOn(sheetsService, 'appendRegistration').mockResolvedValue(undefined);
    jest.spyOn(sheetsService, 'getTeachers').mockResolvedValue([
      { name: 'Mrs. Smith', grade: '5th' },
      { name: 'Mr. Johnson', grade: '4th' }
    ]);
    jest.spyOn(sheetsService, 'getFairMetadata').mockResolvedValue({
      school: 'Test School',
      contactEmail: 'test@example.com',
      registrationDeadline: '2026-12-31',
      scienceFairDate: '2027-01-15',
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });
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

    it('should reject registration that fails schema validation safeParse', async () => {
      const invalidData = {
        studentName: 123, // Should be string
        teacher: true, // Should be string
        parentGuardianName: null, // Should be string
        parentGuardianEmail: 'not-an-email',
        consentGiven: 'yes', // Should be boolean
        additionalStudents: 'invalid', // Should be array if provided
      };

      const response = await request(app)
        .post('/api/register')
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
      expect(Array.isArray(response.body.errors)).toBe(true);
      expect(response.body.errors.length).toBeGreaterThan(0);
    });

    it('should handle Google Sheets service errors', async () => {
      // Make appendRegistration throw an error
      jest.spyOn(sheetsService, 'appendRegistration').mockRejectedValueOnce(
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
    });

    it('should handle non-Error exceptions', async () => {
      // Make appendRegistration throw a non-Error object
      jest.spyOn(sheetsService, 'appendRegistration').mockRejectedValueOnce(
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
      expect(response.body.errors.some((e: { field: string }) => e.field.includes('parentGuardianEmail'))).toBe(true);
    });
  });

  describe('GET /api/teachers', () => {
    it('should return list of teachers', async () => {
      const response = await request(app)
        .get('/api/teachers')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.teachers)).toBe(true);
      expect(response.body.teachers).toContainEqual({ name: 'Mrs. Smith', grade: '5th' });
      expect(response.body.teachers).toContainEqual({ name: 'Mr. Johnson', grade: '4th' });
    });

    it('should handle errors when fetching teachers', async () => {
      // Make getTeachers throw an error
      jest.spyOn(sheetsService, 'getTeachers').mockRejectedValueOnce(
        new Error('Failed to fetch teachers')
      );

      const response = await request(app)
        .get('/api/teachers')
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Failed to fetch teachers');
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
      // Make getFairMetadata throw an error
      jest.spyOn(sheetsService, 'getFairMetadata').mockRejectedValueOnce(
        new Error('Failed to fetch metadata')
      );

      const response = await request(app)
        .get('/api/metadata')
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Failed to fetch fair metadata');
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
