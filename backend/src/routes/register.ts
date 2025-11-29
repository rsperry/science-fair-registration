import { Router, Request, Response } from 'express';
import { registrationSchema } from '../validation/registerSchema';
import { googleSheetsService } from '../services/googleSheets';
import { RegistrationRequest, SheetRow } from '../types/registration';

const router = Router();

router.post('/register', async (req: Request, res: Response) => {
  try {
    // Validate request body
    const validationResult = registrationSchema.safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        errors: validationResult.error.issues.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        })),
      });
    }

    const data = validationResult.data as RegistrationRequest;
    
    // Generate registration metadata
    const timestamp = new Date().toISOString();
    const projectId = await googleSheetsService.getNextProjectId();

    // Create rows to append to the sheet
    const rows: SheetRow[] = [];

    // Primary student row
    const primaryRow: SheetRow = {
      projectId,
      projectName: data.projectName || '',
      primaryProjectRecord: true,
      studentName: data.studentName,
      teacher: data.teacher,
      grade: data.grade,
      parentGuardianName: data.parentGuardianName,
      parentGuardianEmail: data.parentGuardianEmail,
      student2Name: data.additionalStudents?.[0]?.studentName,
      student2Teacher: data.additionalStudents?.[0]?.teacher,
      student2Grade: data.additionalStudents?.[0]?.grade,
      student2ParentGuardianName: data.additionalStudents?.[0]?.parentGuardianName,
      student2ParentGuardianEmail: data.additionalStudents?.[0]?.parentGuardianEmail,
      student3Name: data.additionalStudents?.[1]?.studentName,
      student3Teacher: data.additionalStudents?.[1]?.teacher,
      student3Grade: data.additionalStudents?.[1]?.grade,
      student3ParentGuardianName: data.additionalStudents?.[1]?.parentGuardianName,
      student3ParentGuardianEmail: data.additionalStudents?.[1]?.parentGuardianEmail,
      student4Name: data.additionalStudents?.[2]?.studentName,
      student4Teacher: data.additionalStudents?.[2]?.teacher,
      student4Grade: data.additionalStudents?.[2]?.grade,
      student4ParentGuardianName: data.additionalStudents?.[2]?.parentGuardianName,
      student4ParentGuardianEmail: data.additionalStudents?.[2]?.parentGuardianEmail,
      timestamp,
    };

    rows.push(primaryRow);

    // Append to Google Sheets
    await googleSheetsService.appendRegistration(rows);

    // Log successful registration
    console.log(JSON.stringify({
      level: 'info',
      message: 'Registration successful',
      projectId,
      timestamp,
      studentCount: 1 + (data.additionalStudents?.length || 0),
    }));

    return res.status(201).json({
      success: true,
      projectId,
      timestamp,
      message: 'Registration successful',
    });
  } catch (error) {
    console.error(JSON.stringify({
      level: 'error',
      message: 'Registration failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    }));

    return res.status(500).json({
      success: false,
      message: 'An error occurred while processing your registration. Please try again later.',
    });
  }
});

router.get('/teachers', async (_req: Request, res: Response) => {
  try {
    const teachers = await googleSheetsService.getTeachers();
    return res.json({
      success: true,
      teachers,
    });
  } catch (error) {
    console.error('Error fetching teachers:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch teachers list',
    });
  }
});

router.get('/metadata', async (_req: Request, res: Response) => {
  try {
    const metadata = await googleSheetsService.getFairMetadata();
    return res.json({
      success: true,
      ...metadata,
    });
  } catch (error) {
    console.error('Error fetching fair metadata:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch fair metadata',
    });
  }
});

export default router;
