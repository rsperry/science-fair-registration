import { registrationSchema, additionalStudentSchema } from '../src/validation/registerSchema';

describe('Registration Schema Validation', () => {
  describe('Main Registration Schema', () => {
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

    it('should validate registration with optional grade', () => {
      const validData = {
        studentName: 'John Doe',
        teacher: 'Mrs. Smith',
        grade: '5th Grade',
        projectName: 'Science Project',
        parentGuardianName: 'Jane Doe',
        parentGuardianEmail: 'jane@example.com',
        consentGiven: true,
      };

      const result = registrationSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should validate registration without optional projectName', () => {
      const validData = {
        studentName: 'John Doe',
        teacher: 'Mrs. Smith',
        parentGuardianName: 'Jane Doe',
        parentGuardianEmail: 'jane@example.com',
        consentGiven: true,
      };

      const result = registrationSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should validate registration with valid additional students', () => {
      const validData = {
        studentName: 'John Doe',
        teacher: 'Mrs. Smith',
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
        ],
      };

      const result = registrationSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject missing student name', () => {
      const invalidData = {
        studentName: '',
        teacher: 'Mrs. Smith',
        parentGuardianName: 'Jane Doe',
        parentGuardianEmail: 'jane@example.com',
        consentGiven: true,
      };

      const result = registrationSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        const error = result.error.issues.find(e => e.path.includes('studentName'));
        expect(error).toBeDefined();
      }
    });

    it('should reject missing teacher', () => {
      const invalidData = {
        studentName: 'John Doe',
        teacher: '',
        parentGuardianName: 'Jane Doe',
        parentGuardianEmail: 'jane@example.com',
        consentGiven: true,
      };

      const result = registrationSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject missing parent/guardian name', () => {
      const invalidData = {
        studentName: 'John Doe',
        teacher: 'Mrs. Smith',
        parentGuardianName: '',
        parentGuardianEmail: 'jane@example.com',
        consentGiven: true,
      };

      const result = registrationSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject missing parent/guardian email', () => {
      const invalidData = {
        studentName: 'John Doe',
        teacher: 'Mrs. Smith',
        parentGuardianName: 'Jane Doe',
        parentGuardianEmail: '',
        consentGiven: true,
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
      if (!result.success) {
        const error = result.error.issues.find(e => e.path.includes('parentGuardianEmail'));
        expect(error?.message).toContain('email');
      }
    });

    it('should reject email without @ symbol', () => {
      const invalidData = {
        studentName: 'John Doe',
        teacher: 'Mrs. Smith',
        parentGuardianName: 'Jane Doe',
        parentGuardianEmail: 'notanemail.com',
        consentGiven: true,
      };

      const result = registrationSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject email without domain', () => {
      const invalidData = {
        studentName: 'John Doe',
        teacher: 'Mrs. Smith',
        parentGuardianName: 'Jane Doe',
        parentGuardianEmail: 'test@',
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
      if (!result.success) {
        const error = result.error.issues.find(e => e.path.includes('additionalStudents'));
        expect(error?.message).toContain('3');
      }
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
      if (!result.success) {
        const error = result.error.issues.find(e => e.path.includes('consentGiven'));
        expect(error?.message).toContain('Consent');
      }
    });

    it('should reject student name exceeding max length', () => {
      const invalidData = {
        studentName: 'a'.repeat(201),
        teacher: 'Mrs. Smith',
        parentGuardianName: 'Jane Doe',
        parentGuardianEmail: 'jane@example.com',
        consentGiven: true,
      };

      const result = registrationSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject teacher name exceeding max length', () => {
      const invalidData = {
        studentName: 'John Doe',
        teacher: 'a'.repeat(201),
        parentGuardianName: 'Jane Doe',
        parentGuardianEmail: 'jane@example.com',
        consentGiven: true,
      };

      const result = registrationSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject parent/guardian name exceeding max length', () => {
      const invalidData = {
        studentName: 'John Doe',
        teacher: 'Mrs. Smith',
        parentGuardianName: 'a'.repeat(201),
        parentGuardianEmail: 'jane@example.com',
        consentGiven: true,
      };

      const result = registrationSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject email exceeding max length', () => {
      const invalidData = {
        studentName: 'John Doe',
        teacher: 'Mrs. Smith',
        parentGuardianName: 'Jane Doe',
        parentGuardianEmail: 'a'.repeat(195) + '@test.com',
        consentGiven: true,
      };

      const result = registrationSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject project name exceeding max length', () => {
      const invalidData = {
        studentName: 'John Doe',
        teacher: 'Mrs. Smith',
        projectName: 'a'.repeat(501),
        parentGuardianName: 'Jane Doe',
        parentGuardianEmail: 'jane@example.com',
        consentGiven: true,
      };

      const result = registrationSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject grade exceeding max length', () => {
      const invalidData = {
        studentName: 'John Doe',
        teacher: 'Mrs. Smith',
        grade: 'a'.repeat(51),
        parentGuardianName: 'Jane Doe',
        parentGuardianEmail: 'jane@example.com',
        consentGiven: true,
      };

      const result = registrationSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('Additional Student Schema', () => {
    it('should validate additional student with all fields', () => {
      const validData = {
        studentName: 'Alice Smith',
        teacher: 'Mr. Johnson',
        grade: '5',
        parentGuardianName: 'Bob Smith',
        parentGuardianEmail: 'bob@example.com',
      };

      const result = additionalStudentSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should validate additional student with only required fields', () => {
      const validData = {
        studentName: 'Alice Smith',
        teacher: 'Mr. Johnson',
      };

      const result = additionalStudentSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should validate additional student with empty optional email', () => {
      const validData = {
        studentName: 'Alice Smith',
        teacher: 'Mr. Johnson',
        parentGuardianName: 'Bob Smith',
        parentGuardianEmail: '',
      };

      const result = additionalStudentSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject additional student with invalid email', () => {
      const invalidData = {
        studentName: 'Alice Smith',
        teacher: 'Mr. Johnson',
        parentGuardianEmail: 'invalid-email',
      };

      const result = additionalStudentSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject additional student without student name', () => {
      const invalidData = {
        studentName: '',
        teacher: 'Mr. Johnson',
      };

      const result = additionalStudentSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject additional student without teacher', () => {
      const invalidData = {
        studentName: 'Alice Smith',
        teacher: '',
      };

      const result = additionalStudentSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject additional student name exceeding max length', () => {
      const invalidData = {
        studentName: 'a'.repeat(201),
        teacher: 'Mr. Johnson',
      };

      const result = additionalStudentSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject additional student teacher exceeding max length', () => {
      const invalidData = {
        studentName: 'Alice Smith',
        teacher: 'a'.repeat(201),
      };

      const result = additionalStudentSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject additional student email exceeding max length', () => {
      const invalidData = {
        studentName: 'Alice Smith',
        teacher: 'Mr. Johnson',
        parentGuardianEmail: 'a'.repeat(195) + '@test.com',
      };

      const result = additionalStudentSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });
});
