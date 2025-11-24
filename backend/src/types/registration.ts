export interface AdditionalStudent {
  studentName: string;
  teacher: string;
  grade?: string;
  parentGuardianName?: string;
  parentGuardianEmail?: string;
}

export interface RegistrationRequest {
  studentName: string;
  teacher: string;
  grade?: string;
  projectName?: string;
  parentGuardianName: string;
  parentGuardianEmail: string;
  consentGiven: boolean;
  additionalStudents?: AdditionalStudent[];
}

export interface RegistrationResponse {
  success: boolean;
  projectId: number;
  timestamp: string;
  message?: string;
}

export interface SheetRow {
  projectId: number;
  projectName: string;
  primaryProjectRecord: boolean;
  studentName: string;
  teacher: string;
  grade?: string;
  parentGuardianName: string;
  parentGuardianEmail: string;
  student2Name?: string;
  student2Teacher?: string;
  student2Grade?: string;
  student2ParentGuardianName?: string;
  student2ParentGuardianEmail?: string;
  student3Name?: string;
  student3Teacher?: string;
  student3Grade?: string;
  student3ParentGuardianName?: string;
  student3ParentGuardianEmail?: string;
  student4Name?: string;
  student4Teacher?: string;
  student4Grade?: string;
  student4ParentGuardianName?: string;
  student4ParentGuardianEmail?: string;
  timestamp: string;
}
