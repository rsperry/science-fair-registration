import axios, { AxiosInstance } from 'axios';

// Mock axios before importing the api module
jest.mock('axios');

// Create mock axios instance with methods
const mockPost = jest.fn();
const mockGet = jest.fn();

const mockAxiosInstance = {
  post: mockPost,
  get: mockGet,
} as unknown as AxiosInstance;

// Mock axios.create to return our mock instance
(axios.create as jest.Mock) = jest.fn(() => mockAxiosInstance);

// NOW import the API module after mocks are set up
import { registerProject, getTeachers, getFairMetadata } from '../src/services/api';
import { RegistrationFormData } from '../src/types';

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('API Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('registerProject', () => {
    it('should successfully register a project', async () => {
      const mockFormData: RegistrationFormData = {
        studentName: 'John Doe',
        teacher: 'Mrs. Smith',
        projectName: 'Volcano Eruption',
        parentGuardianName: 'Jane Doe',
        parentGuardianEmail: 'jane@example.com',
        consentGiven: true,
        additionalStudents: [],
      };

      const mockResponse = {
        data: {
          success: true,
          projectId: 12345,
          timestamp: '2025-11-25T10:30:00Z',
          message: 'Registration successful',
        },
      };

      mockPost.mockResolvedValue(mockResponse);

      const result = await registerProject(mockFormData);

      expect(mockPost).toHaveBeenCalledWith('/register', mockFormData);
      expect(result).toEqual(mockResponse.data);
    });

    it('should handle axios error with response data', async () => {
      const mockFormData: RegistrationFormData = {
        studentName: '',
        teacher: 'Mrs. Smith',
        projectName: 'Test',
        parentGuardianName: 'Jane Doe',
        parentGuardianEmail: 'invalid-email',
        consentGiven: false,
        additionalStudents: [],
      };

      const errorResponse = {
        success: false,
        message: 'Validation failed',
        errors: [
          { field: 'studentName', message: 'Student name is required' },
          { field: 'parentGuardianEmail', message: 'Valid email address required' },
        ],
      };

      const axiosError = {
        response: {
          data: errorResponse,
        },
        isAxiosError: true,
      };

      mockPost.mockRejectedValue(axiosError);
      (mockedAxios.isAxiosError as any) = jest.fn().mockReturnValue(true);

      await expect(registerProject(mockFormData)).rejects.toEqual(errorResponse);
    });

    it('should handle network errors gracefully', async () => {
      const mockFormData: RegistrationFormData = {
        studentName: 'John Doe',
        teacher: 'Mrs. Smith',
        projectName: 'Test Project',
        parentGuardianName: 'Jane Doe',
        parentGuardianEmail: 'jane@example.com',
        consentGiven: true,
        additionalStudents: [],
      };

      const networkError = new Error('Network Error');

      mockPost.mockRejectedValue(networkError);
      (mockedAxios.isAxiosError as any) = jest.fn().mockReturnValue(false);

      await expect(registerProject(mockFormData)).rejects.toEqual({
        success: false,
        message: 'Network error. Please check your connection and try again.',
      });
    });

    it('should include additional students in registration', async () => {
      const mockFormData: RegistrationFormData = {
        studentName: 'John Doe',
        teacher: 'Mrs. Smith',
        projectName: 'Group Project',
        parentGuardianName: 'Jane Doe',
        parentGuardianEmail: 'jane@example.com',
        consentGiven: true,
        additionalStudents: [
          { studentName: 'Alice Smith', teacher: 'Mrs. Smith', grade: '5' },
          { studentName: 'Bob Johnson', teacher: 'Mrs. Smith', grade: '5' },
        ],
      };

      const mockResponse = {
        data: {
          success: true,
          projectId: 67890,
          timestamp: '2025-11-25T11:00:00Z',
          message: 'Group registration successful',
        },
      };

      mockPost.mockResolvedValue(mockResponse);

      const result = await registerProject(mockFormData);

      expect(mockPost).toHaveBeenCalledWith('/register', mockFormData);
      expect(result.success).toBe(true);
      expect(result.projectId).toBe(67890);
    });
  });

  describe('getTeachers', () => {
    it('should fetch and return list of teachers', async () => {
      const mockTeachers = [
        { name: 'Mrs. Smith', grade: '3' },
        { name: 'Mr. Johnson', grade: '4' },
        { name: 'Ms. Davis', grade: '5' },
      ];

      const mockResponse = {
        data: {
          success: true,
          teachers: mockTeachers,
        },
      };

      mockGet.mockResolvedValue(mockResponse);

      const result = await getTeachers();

      expect(mockGet).toHaveBeenCalledWith('/teachers');
      expect(result).toEqual(mockTeachers);
      expect(result).toHaveLength(3);
    });

    it('should return empty array when no teachers found', async () => {
      const mockResponse = {
        data: {
          success: true,
          teachers: [],
        },
      };

      mockGet.mockResolvedValue(mockResponse);

      const result = await getTeachers();

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it('should handle errors when fetching teachers', async () => {
      const error = new Error('Failed to fetch teachers');
      mockGet.mockRejectedValue(error);

      await expect(getTeachers()).rejects.toThrow('Failed to fetch teachers');
    });
  });

  describe('getFairMetadata', () => {
    it('should fetch and return fair metadata', async () => {
      const mockMetadata = {
        success: true,
        school: 'Lincoln Elementary School',
        contactEmail: 'science@lincoln.edu',
        registrationDeadline: '2025-12-31',
        scienceFairDate: '2026-02-15',
      };

      const mockResponse = {
        data: mockMetadata,
      };

      mockGet.mockResolvedValue(mockResponse);

      const result = await getFairMetadata();

      expect(mockGet).toHaveBeenCalledWith('/metadata');
      expect(result).toEqual({
        school: mockMetadata.school,
        contactEmail: mockMetadata.contactEmail,
        registrationDeadline: mockMetadata.registrationDeadline,
        scienceFairDate: mockMetadata.scienceFairDate,
      });
    });

    it('should return all metadata fields', async () => {
      const mockMetadata = {
        success: true,
        school: 'Test School',
        contactEmail: 'test@school.edu',
        registrationDeadline: '2025-12-15',
        scienceFairDate: '2026-01-20',
      };

      const mockResponse = {
        data: mockMetadata,
      };

      mockGet.mockResolvedValue(mockResponse);

      const result = await getFairMetadata();

      expect(result.school).toBe('Test School');
      expect(result.contactEmail).toBe('test@school.edu');
      expect(result.registrationDeadline).toBe('2025-12-15');
      expect(result.scienceFairDate).toBe('2026-01-20');
    });

    it('should handle errors when fetching metadata', async () => {
      const error = new Error('Service unavailable');
      mockGet.mockRejectedValue(error);

      await expect(getFairMetadata()).rejects.toThrow('Service unavailable');
    });
  });
});
