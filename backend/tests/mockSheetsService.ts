/**
 * Mock Google Sheets Service for E2E Testing
 * This mock service simulates Google Sheets API responses for testing purposes
 */

import { SheetRow } from '../src/types/registration';

let mockProjectId = 100;
const mockRegistrations: SheetRow[] = [];

export const mockSheetsService = {
  async appendRegistration(rows: SheetRow[]): Promise<void> {
    mockRegistrations.push(...rows);
    console.log('Mock: Added registration with', rows.length, 'rows');
  },

  async getNextProjectId(): Promise<number> {
    return mockProjectId++;
  },

  async getTeachers(): Promise<Array<{ name: string; grade: string }>> {
    return [
      { name: 'Ms. Johnson', grade: '3rd' },
      { name: 'Mr. Smith', grade: '4th' },
      { name: 'Mrs. Davis', grade: '5th' },
      { name: 'Mr. Wilson', grade: '6th' },
    ];
  },

  async getFairMetadata(): Promise<{
    school: string;
    contactEmail: string;
    registrationDeadline: string;
    scienceFairDate: string;
  }> {
    return {
      school: 'Test Elementary School',
      contactEmail: 'science@test-school.edu',
      registrationDeadline: '2026-03-31',
      scienceFairDate: '2026-04-15',
    };
  },

  // Helper method to reset mock data between tests
  reset(): void {
    mockRegistrations.length = 0;
    mockProjectId = 100;
  },

  // Helper method to get registrations for testing
  getRegistrations(): SheetRow[] {
    return [...mockRegistrations];
  },
};
