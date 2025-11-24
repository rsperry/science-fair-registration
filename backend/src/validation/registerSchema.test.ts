import { registrationSchema } from '../validation/registerSchema';

describe('Registration Schema Validation', () => {
  it('should validate a complete registration', () => {
    const validData = {
      studentName: 'John Doe',
      teacher: 'Mrs. Smith',
      projectName: 'Volcano Experiment',
      parentGuardianName: 'Jane Doe',
      parentGuardianEmail: 'jane@example.com',
      consentGiven: true,
    };

    const result = registrationSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('should reject missing required fields', () => {
    const invalidData = {
      studentName: '',
      teacher: '',
      parentGuardianName: '',
      parentGuardianEmail: '',
      consentGiven: false,
    };

    const result = registrationSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('should reject invalid email format', () => {
    const invalidData = {
      studentName: 'John Doe',
      teacher: 'Mrs. Smith',
      parentGuardianName: 'Jane Doe',
      parentGuardianEmail: 'invalid-email',
      consentGiven: true,
    };

    const result = registrationSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('should reject more than 3 additional students', () => {
    const invalidData = {
      studentName: 'John Doe',
      teacher: 'Mrs. Smith',
      parentGuardianName: 'Jane Doe',
      parentGuardianEmail: 'jane@example.com',
      consentGiven: true,
      additionalStudents: [
        { studentName: 'Student 2', teacher: 'Mrs. Smith' },
        { studentName: 'Student 3', teacher: 'Mrs. Smith' },
        { studentName: 'Student 4', teacher: 'Mrs. Smith' },
        { studentName: 'Student 5', teacher: 'Mrs. Smith' },
      ],
    };

    const result = registrationSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('should require consent', () => {
    const invalidData = {
      studentName: 'John Doe',
      teacher: 'Mrs. Smith',
      parentGuardianName: 'Jane Doe',
      parentGuardianEmail: 'jane@example.com',
      consentGiven: false,
    };

    const result = registrationSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });
});
