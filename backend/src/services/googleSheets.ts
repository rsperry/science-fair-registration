import { google } from 'googleapis';
import { config } from '../config';
import { SheetRow } from '../types/registration';
import * as fs from 'fs';

export class GoogleSheetsService {
  private sheets;
  private projectIdCounter = 100;

  constructor() {
    this.sheets = this.initializeClient();
  }

  private initializeClient() {
    let credentials;

    if (config.googleServiceAccountKeyPath) {
      // Load from file path
      const keyFile = fs.readFileSync(config.googleServiceAccountKeyPath, 'utf8');
      credentials = JSON.parse(keyFile);
    } else {
      // Decode from base64 (remove whitespace/newlines first)
      const cleanBase64 = config.googleServiceAccountKey.replace(/\s/g, '');
      const decoded = Buffer.from(cleanBase64, 'base64').toString('utf8');
      credentials = JSON.parse(decoded);
    }

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
        range: 'A:A', // Column A contains project IDs
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
      const values = rows.map((row) => [
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
        range: 'A:X', // Columns A through X (added 3 grade columns)
        valueInputOption: 'RAW',
        requestBody: {
          values,
        },
      });

      console.log(`Successfully appended ${rows.length} row(s) to Google Sheets`);
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
      // Return default list if sheet doesn't exist
      return [
        { name: 'Mrs. Smith', grade: '3' },
        { name: 'Mr. Johnson', grade: '4' },
        { name: 'Ms. Williams', grade: '5' },
        { name: 'Dr. Brown', grade: 'K' },
        { name: 'Mrs. Davis', grade: '1' },
        { name: 'Mr. Wilson', grade: '2' },
      ];
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
      // Return defaults if Info sheet doesn't exist
      return {
        school: 'School',
        contactEmail: 'sciencefair@school.edu',
        registrationDeadline: 'December 15, 2025',
        scienceFairDate: 'February 10, 2026',
      };
    }
  }
}

export const googleSheetsService = new GoogleSheetsService();
