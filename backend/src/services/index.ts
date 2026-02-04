/**
 * Service factory for Google Sheets
 * Exports either the real Google Sheets service or a mock for testing
 */

import { googleSheetsService } from './googleSheets';
import { mockSheetsService } from './mockSheetsService';
import { SheetRow } from '../types/registration';

// Define a common interface
export interface SheetsService {
  getNextProjectId(): Promise<number>;
  appendRegistration(rows: SheetRow[]): Promise<void>;
  getTeachers(): Promise<Array<{ name: string; grade: string }>>;
  getFairMetadata(): Promise<{
    school: string;
    contactEmail: string;
    registrationDeadline: string;
    scienceFairDate: string;
  }>;
}

// Use mock service only when explicitly requested or in CI environment
// Don't auto-enable for NODE_ENV=test to allow proper unit test mocking
const USE_MOCK = process.env.USE_MOCK_SHEETS === 'true' || 
                 process.env.CI === 'true';

// Export the appropriate service instance
export const sheetsService = USE_MOCK ? mockSheetsService : googleSheetsService;
