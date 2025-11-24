import { z } from 'zod';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const additionalStudentSchema = z.object({
  studentName: z.string().min(1, 'Student name is required').max(200),
  teacher: z.string().min(1, 'Teacher is required').max(200),
  grade: z.string().max(50).optional(),
  parentGuardianName: z.string().max(200).optional(),
  parentGuardianEmail: z
    .string()
    .max(200)
    .refine((email) => !email || emailRegex.test(email), {
      message: 'Invalid email format',
    })
    .optional(),
});

export const registrationSchema = z.object({
  studentName: z.string().min(1, 'Student name is required').max(200),
  teacher: z.string().min(1, 'Teacher is required').max(200),
  grade: z.string().max(50).optional(),
  projectName: z.string().max(500).optional(),
  parentGuardianName: z.string().min(1, 'Parent/Guardian name is required').max(200),
  parentGuardianEmail: z
    .string()
    .min(1, 'Parent/Guardian email is required')
    .max(200)
    .refine((email) => emailRegex.test(email), {
      message: 'Invalid email format',
    }),
  consentGiven: z.boolean().refine((val) => val === true, {
    message: 'Consent must be given to register',
  }),
  additionalStudents: z
    .array(additionalStudentSchema)
    .max(3, 'Maximum 3 additional students allowed')
    .optional(),
});

export type RegistrationInput = z.infer<typeof registrationSchema>;
