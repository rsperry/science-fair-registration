export interface AdditionalStudent {
  studentName: string;
  teacher: string;
  grade?: string;
  parentGuardianName?: string;
  parentGuardianEmail?: string;
}

export interface RegistrationFormData {
  studentName: string;
  teacher: string;
  grade?: string;
  projectName?: string;
  parentGuardianName: string;
  parentGuardianEmail: string;
  consentGiven: boolean;
  additionalStudents: AdditionalStudent[];
}

export interface RegistrationResponse {
  success: boolean;
  projectId: number;
  timestamp: string;
  message?: string;
}

export interface ErrorResponse {
  success: false;
  message: string;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}
