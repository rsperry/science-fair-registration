import { GoogleSheetsService } from '../src/services/googleSheets';
import { google } from 'googleapis';
import { SheetRow } from '../src/types/registration';

// Mock googleapis
jest.mock('googleapis');

describe('GoogleSheetsService', () => {
  let service: GoogleSheetsService;
  let mockSheets: any;
  let mockAuth: any;

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();

    // Create mock sheets API
    mockSheets = {
      spreadsheets: {
        values: {
          get: jest.fn(),
          append: jest.fn(),
        },
      },
    };

    // Create mock auth
    mockAuth = {
      GoogleAuth: jest.fn().mockImplementation(() => ({})),
    };

    // Mock google.auth and google.sheets
    (google as any).auth = mockAuth;
    (google.sheets as jest.Mock).mockReturnValue(mockSheets);

    // Create service instance
    service = new GoogleSheetsService();
  });

  describe('constructor', () => {
    it('should initialize Google Sheets client successfully', () => {
      expect(google.sheets).toHaveBeenCalledWith({
        version: 'v4',
        auth: expect.anything(),
      });
    });

    it('should throw error if initialization fails', () => {
      // Mock google.sheets to throw error
      (google.sheets as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid credentials');
      });

      expect(() => new GoogleSheetsService()).toThrow('Invalid credentials');
    });
  });

  describe('getNextProjectId', () => {
    it('should return 100 for empty sheet', async () => {
      mockSheets.spreadsheets.values.get.mockResolvedValue({
        data: { values: [] },
      });

      const projectId = await service.getNextProjectId();
      expect(projectId).toBe(100);
    });

    it('should return 100 when only header row exists', async () => {
      mockSheets.spreadsheets.values.get.mockResolvedValue({
        data: { values: [['Project ID', 'Project Name']] },
      });

      const projectId = await service.getNextProjectId();
      expect(projectId).toBe(100);
    });

    it('should return 100 when values is undefined', async () => {
      mockSheets.spreadsheets.values.get.mockResolvedValue({
        data: {},
      });

      const projectId = await service.getNextProjectId();
      expect(projectId).toBe(100);
    });

    it('should return next ID when projects exist', async () => {
      mockSheets.spreadsheets.values.get.mockResolvedValue({
        data: {
          values: [
            ['Project ID', 'Project Name'],
            ['100'],
            ['101'],
            ['102'],
          ],
        },
      });

      const projectId = await service.getNextProjectId();
      expect(projectId).toBe(103);
    });

    it('should skip invalid project IDs', async () => {
      mockSheets.spreadsheets.values.get.mockResolvedValue({
        data: {
          values: [
            ['Project ID', 'Project Name'],
            ['100'],
            ['invalid'],
            ['101'],
          ],
        },
      });

      const projectId = await service.getNextProjectId();
      expect(projectId).toBe(102);
    });

    it('should return 100 when all IDs are invalid', async () => {
      mockSheets.spreadsheets.values.get.mockResolvedValue({
        data: {
          values: [
            ['Project ID', 'Project Name'],
            ['invalid'],
            ['also-invalid'],
          ],
        },
      });

      const projectId = await service.getNextProjectId();
      expect(projectId).toBe(100);
    });

    it('should use fallback counter when API call fails', async () => {
      mockSheets.spreadsheets.values.get.mockRejectedValue(
        new Error('API Error')
      );

      const projectId = await service.getNextProjectId();
      expect(projectId).toBe(100);

      // Second call should increment
      const projectId2 = await service.getNextProjectId();
      expect(projectId2).toBe(101);
    });
  });

  describe('appendRegistration', () => {
    it('should append registration with single student', async () => {
      const rows: SheetRow[] = [
        {
          projectId: 100,
          projectName: 'Test Project',
          primaryProjectRecord: true,
          studentName: 'John Doe',
          teacher: 'Ms. Smith',
          grade: '5',
          parentGuardianName: 'Jane Doe',
          parentGuardianEmail: 'jane@example.com',
          parentWillingToVolunteer: true,
          timestamp: '2024-01-01 10:00:00',
        },
      ];

      mockSheets.spreadsheets.values.append.mockResolvedValue({});

      await service.appendRegistration(rows);

      // Check Projects sheet call
      expect(mockSheets.spreadsheets.values.append).toHaveBeenCalledWith({
        spreadsheetId: expect.any(String),
        range: 'Registrations-Projects!A:AB',
        valueInputOption: 'RAW',
        requestBody: {
          values: [
            [
              100,
              'Test Project',
              'TRUE',
              'John Doe',
              'Ms. Smith',
              '5',
              'Jane Doe',
              'jane@example.com',
              'TRUE',
              '',
              '',
              '',
              '',
              '',
              'FALSE',
              '',
              '',
              '',
              '',
              '',
              'FALSE',
              '',
              '',
              '',
              '',
              '',
              'FALSE',
              '2024-01-01 10:00:00',
            ],
          ],
        },
      });

      // Check Students sheet call
      expect(mockSheets.spreadsheets.values.append).toHaveBeenCalledWith({
        spreadsheetId: expect.any(String),
        range: 'Registrations-Students!A:H',
        valueInputOption: 'RAW',
        requestBody: {
          values: [
            [
              100,
              'Test Project',
              'John Doe',
              'Ms. Smith',
              '5',
              'Jane Doe',
              'jane@example.com',
              'TRUE',
            ],
          ],
        },
      });
    });

    it('should append registration with multiple students', async () => {
      const rows: SheetRow[] = [
        {
          projectId: 101,
          projectName: 'Group Project',
          primaryProjectRecord: true,
          studentName: 'Student 1',
          teacher: 'Teacher 1',
          grade: '5',
          parentGuardianName: 'Parent 1',
          parentGuardianEmail: 'parent1@example.com',
          parentWillingToVolunteer: true,
          student2Name: 'Student 2',
          student2Teacher: 'Teacher 2',
          student2Grade: '5',
          student2ParentGuardianName: 'Parent 2',
          student2ParentGuardianEmail: 'parent2@example.com',
          student2ParentWillingToVolunteer: false,
          student3Name: 'Student 3',
          student3Teacher: 'Teacher 3',
          student3Grade: '6',
          student3ParentGuardianName: 'Parent 3',
          student3ParentGuardianEmail: 'parent3@example.com',
          student3ParentWillingToVolunteer: true,
          timestamp: '2024-01-02 11:00:00',
        },
      ];

      mockSheets.spreadsheets.values.append.mockResolvedValue({});

      await service.appendRegistration(rows);

      // Check that 3 students were added to Students sheet
      const studentsCall = mockSheets.spreadsheets.values.append.mock.calls.find(
        (call: any) => call[0].range === 'Registrations-Students!A:H'
      );
      expect(studentsCall[0].requestBody.values).toHaveLength(3);
    });

    it('should append registration with 2 students only', async () => {
      const rows: SheetRow[] = [
        {
          projectId: 101,
          projectName: 'Group Project',
          primaryProjectRecord: true,
          studentName: 'Student 1',
          teacher: 'Teacher 1',
          grade: '5',
          parentGuardianName: 'Parent 1',
          parentGuardianEmail: 'parent1@example.com',
          parentWillingToVolunteer: false,
          student2Name: 'Student 2',
          student2Teacher: 'Teacher 2',
          student2Grade: '5',
          student2ParentGuardianName: 'Parent 2',
          student2ParentGuardianEmail: 'parent2@example.com',
          student2ParentWillingToVolunteer: true,
          timestamp: '2024-01-02 11:00:00',
        },
      ];

      mockSheets.spreadsheets.values.append.mockResolvedValue({});

      await service.appendRegistration(rows);

      // Check that only 2 students were added to Students sheet
      const studentsCall = mockSheets.spreadsheets.values.append.mock.calls.find(
        (call: any) => call[0].range === 'Registrations-Students!A:H'
      );
      expect(studentsCall[0].requestBody.values).toHaveLength(2);
    });

    it('should append registration with 4 students and varying volunteer flags', async () => {
      const rows: SheetRow[] = [
        {
          projectId: 102,
          projectName: 'Max Group',
          primaryProjectRecord: true,
          studentName: 'Student 1',
          teacher: 'Teacher 1',
          grade: '5',
          parentGuardianName: 'Parent 1',
          parentGuardianEmail: 'parent1@example.com',
          parentWillingToVolunteer: true,
          student2Name: 'Student 2',
          student2Teacher: 'Teacher 2',
          student2Grade: '5',
          student2ParentGuardianName: 'Parent 2',
          student2ParentGuardianEmail: 'parent2@example.com',
          student2ParentWillingToVolunteer: false,
          student3Name: 'Student 3',
          student3Teacher: 'Teacher 3',
          student3Grade: '6',
          student3ParentGuardianName: 'Parent 3',
          student3ParentGuardianEmail: 'parent3@example.com',
          student3ParentWillingToVolunteer: true,
          student4Name: 'Student 4',
          student4Teacher: 'Teacher 4',
          student4Grade: '6',
          student4ParentGuardianName: 'Parent 4',
          student4ParentGuardianEmail: 'parent4@example.com',
          student4ParentWillingToVolunteer: false,
          timestamp: '2024-01-03 12:00:00',
        },
      ];

      mockSheets.spreadsheets.values.append.mockResolvedValue({});

      await service.appendRegistration(rows);

      // Check that 4 students were added to Students sheet
      const studentsCall = mockSheets.spreadsheets.values.append.mock.calls.find(
        (call: any) => call[0].range === 'Registrations-Students!A:H'
      );
      expect(studentsCall[0].requestBody.values).toHaveLength(4);

      // Verify volunteer flags are correct
      const studentValues = studentsCall[0].requestBody.values;
      expect(studentValues[0][7]).toBe('TRUE'); // Student 1
      expect(studentValues[1][7]).toBe('FALSE'); // Student 2
      expect(studentValues[2][7]).toBe('TRUE'); // Student 3
      expect(studentValues[3][7]).toBe('FALSE'); // Student 4
    });

    it('should handle registration with undefined volunteer flags', async () => {
      const rows: SheetRow[] = [
        {
          projectId: 103,
          projectName: 'Test Project',
          primaryProjectRecord: true,
          studentName: 'John Doe',
          teacher: 'Ms. Smith',
          grade: '5',
          parentGuardianName: 'Jane Doe',
          parentGuardianEmail: 'jane@example.com',
          parentWillingToVolunteer: undefined,
          timestamp: '2024-01-01 10:00:00',
        },
      ];

      mockSheets.spreadsheets.values.append.mockResolvedValue({});

      await service.appendRegistration(rows);

      // Check that undefined volunteer flag is converted to FALSE
      const projectsCall = mockSheets.spreadsheets.values.append.mock.calls.find(
        (call: any) => call[0].range === 'Registrations-Projects!A:AB'
      );
      expect(projectsCall[0].requestBody.values[0][8]).toBe('FALSE');
    });

    it('should skip non-primary rows', async () => {
      const rows: SheetRow[] = [
        {
          projectId: 104,
          projectName: 'Test Project',
          primaryProjectRecord: false,
          studentName: 'John Doe',
          teacher: 'Ms. Smith',
          grade: '5',
          parentGuardianName: 'Jane Doe',
          parentGuardianEmail: 'jane@example.com',
          parentWillingToVolunteer: true,
          timestamp: '2024-01-01 10:00:00',
        },
      ];

      mockSheets.spreadsheets.values.append.mockResolvedValue({});

      await service.appendRegistration(rows);

      // Should append empty arrays to both sheets
      expect(mockSheets.spreadsheets.values.append).toHaveBeenCalledWith({
        spreadsheetId: expect.any(String),
        range: 'Registrations-Projects!A:AB',
        valueInputOption: 'RAW',
        requestBody: {
          values: [],
        },
      });

      // Should not append to Students sheet since no primary rows
      expect(mockSheets.spreadsheets.values.append).toHaveBeenCalledTimes(1);
    });

    it('should throw error when append fails', async () => {
      const rows: SheetRow[] = [
        {
          projectId: 105,
          projectName: 'Test Project',
          primaryProjectRecord: true,
          studentName: 'John Doe',
          teacher: 'Ms. Smith',
          grade: '5',
          parentGuardianName: 'Jane Doe',
          parentGuardianEmail: 'jane@example.com',
          parentWillingToVolunteer: true,
          timestamp: '2024-01-01 10:00:00',
        },
      ];

      mockSheets.spreadsheets.values.append.mockRejectedValue(
        new Error('API Error')
      );

      await expect(service.appendRegistration(rows)).rejects.toThrow(
        'Failed to save registration to Google Sheets'
      );
    });

    it('should handle empty optional fields', async () => {
      const rows: SheetRow[] = [
        {
          projectId: 106,
          projectName: 'Test Project',
          primaryProjectRecord: true,
          studentName: 'John Doe',
          teacher: 'Ms. Smith',
          parentGuardianName: 'Jane Doe',
          parentGuardianEmail: 'jane@example.com',
          parentWillingToVolunteer: false,
          timestamp: '2024-01-01 10:00:00',
        },
      ];

      mockSheets.spreadsheets.values.append.mockResolvedValue({});

      await service.appendRegistration(rows);

      // Check that empty fields are converted to empty strings
      const projectsCall = mockSheets.spreadsheets.values.append.mock.calls.find(
        (call: any) => call[0].range === 'Registrations-Projects!A:AB'
      );
      expect(projectsCall[0].requestBody.values[0][5]).toBe(''); // grade
    });

    it('should handle student 2 with missing optional fields', async () => {
      const rows: SheetRow[] = [
        {
          projectId: 107,
          projectName: 'Group Project',
          primaryProjectRecord: true,
          studentName: 'Student 1',
          teacher: 'Teacher 1',
          grade: '5',
          parentGuardianName: 'Parent 1',
          parentGuardianEmail: 'parent1@example.com',
          parentWillingToVolunteer: true,
          student2Name: 'Student 2',
          // student2Teacher is optional
          // student2Grade is optional
          // student2ParentGuardianName will be empty string
          // student2ParentGuardianEmail will be empty string
          timestamp: '2024-01-02 11:00:00',
        },
      ];

      mockSheets.spreadsheets.values.append.mockResolvedValue({});

      await service.appendRegistration(rows);

      // Check that student 2 row has empty strings for missing fields
      const studentsCall = mockSheets.spreadsheets.values.append.mock.calls.find(
        (call: any) => call[0].range === 'Registrations-Students!A:H'
      );
      const student2Row = studentsCall[0].requestBody.values[1];
      expect(student2Row[3]).toBe(''); // teacher
      expect(student2Row[5]).toBe(''); // parentGuardianName
      expect(student2Row[6]).toBe(''); // parentGuardianEmail
    });

    it('should handle student 3 with missing optional fields', async () => {
      const rows: SheetRow[] = [
        {
          projectId: 108,
          projectName: 'Group Project',
          primaryProjectRecord: true,
          studentName: 'Student 1',
          teacher: 'Teacher 1',
          grade: '5',
          parentGuardianName: 'Parent 1',
          parentGuardianEmail: 'parent1@example.com',
          parentWillingToVolunteer: true,
          student3Name: 'Student 3',
          timestamp: '2024-01-02 11:00:00',
        },
      ];

      mockSheets.spreadsheets.values.append.mockResolvedValue({});

      await service.appendRegistration(rows);

      // Check that student 3 row has empty strings for missing fields
      const studentsCall = mockSheets.spreadsheets.values.append.mock.calls.find(
        (call: any) => call[0].range === 'Registrations-Students!A:H'
      );
      const student3Row = studentsCall[0].requestBody.values[1];
      expect(student3Row[3]).toBe(''); // teacher
      expect(student3Row[5]).toBe(''); // parentGuardianName
      expect(student3Row[6]).toBe(''); // parentGuardianEmail
    });

    it('should handle student 4 with missing optional fields', async () => {
      const rows: SheetRow[] = [
        {
          projectId: 109,
          projectName: 'Group Project',
          primaryProjectRecord: true,
          studentName: 'Student 1',
          teacher: 'Teacher 1',
          grade: '5',
          parentGuardianName: 'Parent 1',
          parentGuardianEmail: 'parent1@example.com',
          parentWillingToVolunteer: true,
          student4Name: 'Student 4',
          timestamp: '2024-01-02 11:00:00',
        },
      ];

      mockSheets.spreadsheets.values.append.mockResolvedValue({});

      await service.appendRegistration(rows);

      // Check that student 4 row has empty strings for missing fields
      const studentsCall = mockSheets.spreadsheets.values.append.mock.calls.find(
        (call: any) => call[0].range === 'Registrations-Students!A:H'
      );
      const student4Row = studentsCall[0].requestBody.values[1];
      expect(student4Row[3]).toBe(''); // teacher
      expect(student4Row[5]).toBe(''); // parentGuardianName
      expect(student4Row[6]).toBe(''); // parentGuardianEmail
    });

    it('should handle missing projectName in student rows', async () => {
      const rows: SheetRow[] = [
        {
          projectId: 110,
          projectName: '', // Empty string instead of undefined
          primaryProjectRecord: true,
          studentName: 'John Doe',
          teacher: 'Ms. Smith',
          grade: '5',
          parentGuardianName: 'Jane Doe',
          parentGuardianEmail: 'jane@example.com',
          parentWillingToVolunteer: true,
          timestamp: '2024-01-01 10:00:00',
        },
      ];

      mockSheets.spreadsheets.values.append.mockResolvedValue({});

      await service.appendRegistration(rows);

      // Check that student row has empty string for missing projectName
      const studentsCall = mockSheets.spreadsheets.values.append.mock.calls.find(
        (call: any) => call[0].range === 'Registrations-Students!A:H'
      );
      expect(studentsCall[0].requestBody.values[0][1]).toBe(''); // projectName
    });

    it('should handle missing grade in student rows', async () => {
      const rows: SheetRow[] = [
        {
          projectId: 111,
          projectName: 'Test Project',
          primaryProjectRecord: true,
          studentName: 'John Doe',
          teacher: 'Ms. Smith',
          parentGuardianName: 'Jane Doe',
          parentGuardianEmail: 'jane@example.com',
          parentWillingToVolunteer: true,
          timestamp: '2024-01-01 10:00:00',
        },
      ];

      mockSheets.spreadsheets.values.append.mockResolvedValue({});

      await service.appendRegistration(rows);

      // Check that student row has empty string for missing grade
      const studentsCall = mockSheets.spreadsheets.values.append.mock.calls.find(
        (call: any) => call[0].range === 'Registrations-Students!A:H'
      );
      expect(studentsCall[0].requestBody.values[0][4]).toBe(''); // grade
    });
  });

  describe('getTeachers', () => {
    it('should fetch teachers successfully', async () => {
      mockSheets.spreadsheets.values.get.mockResolvedValue({
        data: {
          values: [
            ['Name', 'Grade'],
            ['Ms. Smith', '5'],
            ['Mr. Jones', '6'],
          ],
        },
      });

      const teachers = await service.getTeachers();

      expect(teachers).toEqual([
        { name: 'Ms. Smith', grade: '5' },
        { name: 'Mr. Jones', grade: '6' },
      ]);
    });

    it('should handle empty teacher list', async () => {
      mockSheets.spreadsheets.values.get.mockResolvedValue({
        data: { values: [] },
      });

      const teachers = await service.getTeachers();

      expect(teachers).toEqual([]);
    });

    it('should handle only header row', async () => {
      mockSheets.spreadsheets.values.get.mockResolvedValue({
        data: { values: [['Name', 'Grade']] },
      });

      const teachers = await service.getTeachers();

      expect(teachers).toEqual([]);
    });

    it('should filter out rows without teacher name', async () => {
      mockSheets.spreadsheets.values.get.mockResolvedValue({
        data: {
          values: [
            ['Name', 'Grade'],
            ['Ms. Smith', '5'],
            ['', '6'], // Empty name
            ['Mr. Jones', '6'],
          ],
        },
      });

      const teachers = await service.getTeachers();

      expect(teachers).toEqual([
        { name: 'Ms. Smith', grade: '5' },
        { name: 'Mr. Jones', grade: '6' },
      ]);
    });

    it('should handle missing grade column', async () => {
      mockSheets.spreadsheets.values.get.mockResolvedValue({
        data: {
          values: [
            ['Name', 'Grade'],
            ['Ms. Smith'], // No grade
            ['Mr. Jones', '6'],
          ],
        },
      });

      const teachers = await service.getTeachers();

      expect(teachers).toEqual([
        { name: 'Ms. Smith', grade: '' },
        { name: 'Mr. Jones', grade: '6' },
      ]);
    });

    it('should throw error when fetch fails', async () => {
      mockSheets.spreadsheets.values.get.mockRejectedValue(
        new Error('API Error')
      );

      await expect(service.getTeachers()).rejects.toThrow(
        'Failed to fetch teachers from Google Sheets'
      );
    });
  });

  describe('getFairMetadata', () => {
    it('should fetch metadata successfully', async () => {
      mockSheets.spreadsheets.values.get.mockResolvedValue({
        data: {
          values: [
            ['School', 'Lincoln Elementary'],
            ['Contact', 'admin@lincoln.edu'],
            ['Registration Deadline', '2024-03-01'],
            ['Science Fair Date', '2024-04-15'],
          ],
        },
      });

      const metadata = await service.getFairMetadata();

      expect(metadata).toEqual({
        school: 'Lincoln Elementary',
        contactEmail: 'admin@lincoln.edu',
        registrationDeadline: '2024-03-01',
        scienceFairDate: '2024-04-15',
      });
    });

    it('should handle missing metadata fields', async () => {
      mockSheets.spreadsheets.values.get.mockResolvedValue({
        data: {
          values: [
            ['School', 'Lincoln Elementary'],
            ['Contact', 'admin@lincoln.edu'],
          ],
        },
      });

      const metadata = await service.getFairMetadata();

      expect(metadata).toEqual({
        school: 'Lincoln Elementary',
        contactEmail: 'admin@lincoln.edu',
        registrationDeadline: '',
        scienceFairDate: '',
      });
    });

    it('should handle empty metadata sheet', async () => {
      mockSheets.spreadsheets.values.get.mockResolvedValue({
        data: { values: [] },
      });

      const metadata = await service.getFairMetadata();

      expect(metadata).toEqual({
        school: '',
        contactEmail: '',
        registrationDeadline: '',
        scienceFairDate: '',
      });
    });

    it('should handle rows with only keys (no values)', async () => {
      mockSheets.spreadsheets.values.get.mockResolvedValue({
        data: {
          values: [
            ['School'],
            ['Contact', 'admin@lincoln.edu'],
            ['Registration Deadline'],
            ['Science Fair Date', '2024-04-15'],
          ],
        },
      });

      const metadata = await service.getFairMetadata();

      expect(metadata).toEqual({
        school: '',
        contactEmail: 'admin@lincoln.edu',
        registrationDeadline: '',
        scienceFairDate: '2024-04-15',
      });
    });

    it('should throw error when fetch fails', async () => {
      mockSheets.spreadsheets.values.get.mockRejectedValue(
        new Error('API Error')
      );

      await expect(service.getFairMetadata()).rejects.toThrow(
        'Failed to fetch fair metadata from Google Sheets'
      );
    });
  });
});
