import { google } from 'googleapis';
import { config } from '../config';
import { SheetRow, StudentRow } from '../types/registration';

export class GoogleSheetsService {
  private sheets;
  private projectIdCounter = 100;

  constructor() {
    this.sheets = this.initializeClient();
  }

  private initializeClient() {
    // Decode from base64 (remove whitespace/newlines first)
    const cleanBase64 = config.googleServiceAccountKey.replace(/\s/g, '');
    const decoded = Buffer.from(cleanBase64, 'base64').toString('utf8');
    const credentials = JSON.parse(decoded);

    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    return google.sheets({ version: 'v4', auth });
  }

  async getNextProjectId(): Promise<number> {
    try {
      // Get existing data to determine next project ID
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: config.googleSheetsId,
        range: 'Registrations-Projects!A:A', // Column A contains project IDs
      });

      const values = response.data.values || [];
      
      if (values.length <= 1) {
        // Only header row or empty sheet
        return 100;
      }

      // Find the maximum project ID
      const projectIds = values
        .slice(1) // Skip header
        .map((row) => parseInt(row[0], 10))
        .filter((id) => !isNaN(id));

      if (projectIds.length === 0) {
        return 100;
      }

      return Math.max(...projectIds) + 1;
    } catch (error) {
      console.error('Error getting next project ID:', error);
      // Fallback to counter-based approach
      return this.projectIdCounter++;
    }
  }

  async appendRegistration(rows: SheetRow[]): Promise<void> {
    try {
      // Filter only primary rows for Registrations-Projects
      const primaryRows = rows.filter(row => row.primaryProjectRecord);
      
      const projectValues = primaryRows.map((row) => [
        row.projectId,
        row.projectName || '',
        row.primaryProjectRecord ? 'TRUE' : 'FALSE',
        row.studentName, // Student 1 Name
        row.teacher, // Student 1 Teacher
        row.grade || '', // Student 1 Grade
        row.parentGuardianName, // Student 1 Parent Name
        row.parentGuardianEmail, // Student 1 Parent Email
        row.student2Name || '',
        row.student2Teacher || '',
        row.student2Grade || '',
        row.student2ParentGuardianName || '',
        row.student2ParentGuardianEmail || '',
        row.student3Name || '',
        row.student3Teacher || '',
        row.student3Grade || '',
        row.student3ParentGuardianName || '',
        row.student3ParentGuardianEmail || '',
        row.student4Name || '',
        row.student4Teacher || '',
        row.student4Grade || '',
        row.student4ParentGuardianName || '',
        row.student4ParentGuardianEmail || '',
        row.timestamp,
      ]);

      await this.sheets.spreadsheets.values.append({
        spreadsheetId: config.googleSheetsId,
        range: 'Registrations-Projects!A:X',
        valueInputOption: 'RAW',
        requestBody: {
          values: projectValues,
        },
      });

      // Build student rows for Registrations-Students sheet
      const studentRows: StudentRow[] = [];
      
      for (const row of rows) {
        // Only process primary rows to extract all students
        if (row.primaryProjectRecord) {
          // Add primary student
          studentRows.push({
            projectId: row.projectId,
            projectName: row.projectName,
            studentName: row.studentName,
            teacher: row.teacher,
            grade: row.grade,
            parentGuardianName: row.parentGuardianName,
            parentGuardianEmail: row.parentGuardianEmail,
          });

          // Add student 2 if exists
          if (row.student2Name) {
            studentRows.push({
              projectId: row.projectId,
              projectName: row.projectName,
              studentName: row.student2Name,
              teacher: row.student2Teacher || '',
              grade: row.student2Grade,
              parentGuardianName: row.student2ParentGuardianName || '',
              parentGuardianEmail: row.student2ParentGuardianEmail || '',
            });
          }

          // Add student 3 if exists
          if (row.student3Name) {
            studentRows.push({
              projectId: row.projectId,
              projectName: row.projectName,
              studentName: row.student3Name,
              teacher: row.student3Teacher || '',
              grade: row.student3Grade,
              parentGuardianName: row.student3ParentGuardianName || '',
              parentGuardianEmail: row.student3ParentGuardianEmail || '',
            });
          }

          // Add student 4 if exists
          if (row.student4Name) {
            studentRows.push({
              projectId: row.projectId,
              projectName: row.projectName,
              studentName: row.student4Name,
              teacher: row.student4Teacher || '',
              grade: row.student4Grade,
              parentGuardianName: row.student4ParentGuardianName || '',
              parentGuardianEmail: row.student4ParentGuardianEmail || '',
            });
          }
        }
      }

      // Append all students to Registrations-Students sheet
      if (studentRows.length > 0) {
        const studentValues = studentRows.map((student) => [
          student.projectId,
          student.projectName || '',
          student.studentName,
          student.teacher,
          student.grade || '',
          student.parentGuardianName,
          student.parentGuardianEmail,
        ]);

        await this.sheets.spreadsheets.values.append({
          spreadsheetId: config.googleSheetsId,
          range: 'Registrations-Students!A:G',
          valueInputOption: 'RAW',
          requestBody: {
            values: studentValues,
          },
        });
      }

      console.log(`Successfully appended ${primaryRows.length} row(s) to Registrations-Projects and ${studentRows.length} student(s) to Registrations-Students`);
    } catch (error) {
      console.error('Error appending to Google Sheets:', error);
      throw new Error('Failed to save registration to Google Sheets');
    }
  }

  async getTeachers(): Promise<Array<{ name: string; grade: string }>> {
    try {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: config.googleSheetsId,
        range: 'Teachers!A:B', // Get both name and grade columns
      });

      const values = response.data.values || [];
      // Skip header row and map to teacher objects
      return values
        .slice(1)
        .filter((row) => row[0]) // Has teacher name
        .map((row) => ({
          name: row[0],
          grade: row[1] || '',
        }));
    } catch (error) {
      console.error('Error fetching teachers:', error);
      throw new Error('Failed to fetch teachers from Google Sheets. Please ensure the Teachers sheet exists.');
    }
  }

  async getFairMetadata(): Promise<{
    school: string;
    contactEmail: string;
    registrationDeadline: string;
    scienceFairDate: string;
  }> {
    try {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: config.googleSheetsId,
        range: 'Info!A:B', // Read columns A and B from Info sheet
      });

      const values = response.data.values || [];
      
      // Find metadata by searching for keys in column A
      const findValue = (key: string): string => {
        const row = values.find((row) => row[0] === key);
        return row && row[1] ? row[1] : '';
      };

      return {
        school: findValue('School'),
        contactEmail: findValue('Contact'),
        registrationDeadline: findValue('Registration Deadline'),
        scienceFairDate: findValue('Science Fair Date'),
      };
    } catch (error) {
      console.error('Error fetching fair metadata:', error);
      throw new Error('Failed to fetch fair metadata from Google Sheets. Please ensure the Info sheet exists with required fields.');
    }
  }
}

export const googleSheetsService = new GoogleSheetsService();
