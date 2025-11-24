import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  TextField,
  Button,
  FormControlLabel,
  Checkbox,
  Typography,
  CircularProgress,
  IconButton,
  Divider,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  FormHelperText,
  Snackbar,
  Alert,
  Link,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { registerProject, getTeachers } from '../services/api';
import { RegistrationFormData, AdditionalStudent, ErrorResponse } from '../types';

const RegistrationForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [showError, setShowError] = useState(false);
  const [teachers, setTeachers] = useState<Array<{ name: string; grade: string }>>([]);
  const [loadingTeachers, setLoadingTeachers] = useState(true);

  const [formData, setFormData] = useState<RegistrationFormData>({
    studentName: '',
    teacher: '',
    grade: '',
    projectName: '',
    parentGuardianName: '',
    parentGuardianEmail: '',
    consentGiven: false,
    additionalStudents: [],
  });

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const additionalStudentRefs = useRef<(HTMLInputElement | null)[]>([]);
  const additionalStudentParentRefs = useRef<(HTMLInputElement | null)[]>([]);
  const projectNameRef = useRef<HTMLInputElement>(null);
  const parentNameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadTeachers();
  }, []);

  const loadTeachers = async () => {
    try {
      const teachersList = await getTeachers();
      setTeachers(teachersList);
    } catch (err) {
      console.error('Failed to load teachers:', err);
    } finally {
      setLoadingTeachers(false);
    }
  };

  const handleChange = (field: keyof RegistrationFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear field error when user starts typing
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleAdditionalStudentChange = (
    index: number,
    field: keyof AdditionalStudent,
    value: string
  ) => {
    const updated = [...formData.additionalStudents];
    updated[index] = { ...updated[index], [field]: value };
    setFormData((prev) => ({ ...prev, additionalStudents: updated }));
  };

  const handleAdditionalStudentTeacherChange = (index: number, teacherName: string, grade: string) => {
    const updated = [...formData.additionalStudents];
    updated[index] = { ...updated[index], teacher: teacherName, grade: grade };
    setFormData((prev) => ({ ...prev, additionalStudents: updated }));
  };

  const addAdditionalStudent = () => {
    if (formData.additionalStudents.length < 3) {
      const newIndex = formData.additionalStudents.length;
      setFormData((prev) => ({
        ...prev,
        additionalStudents: [
          ...prev.additionalStudents,
          { studentName: '', teacher: '', grade: '', parentGuardianName: '', parentGuardianEmail: '' },
        ],
      }));
      // Focus the new student name field after state update
      setTimeout(() => {
        additionalStudentRefs.current[newIndex]?.focus();
      }, 0);
    }
  };

  const removeAdditionalStudent = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      additionalStudents: prev.additionalStudents.filter((_, i) => i !== index),
    }));
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.studentName.trim()) {
      errors.studentName = 'Student name is required';
    }
    if (!formData.teacher) {
      errors.teacher = 'Teacher selection is required';
    }
    if (!formData.parentGuardianName.trim()) {
      errors.parentGuardianName = 'Parent/Guardian name is required';
    }
    if (!formData.parentGuardianEmail.trim()) {
      errors.parentGuardianEmail = 'Parent/Guardian email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.parentGuardianEmail)) {
      errors.parentGuardianEmail = 'Please enter a valid email address';
    }
    if (!formData.consentGiven) {
      errors.consentGiven = 'You must give consent to register';
    }

    // Validate additional students
    formData.additionalStudents.forEach((student, index) => {
      if (!student.studentName.trim()) {
        errors[`additionalStudent${index}.studentName`] = 'Student name is required';
      }
      if (!student.teacher) {
        errors[`additionalStudent${index}.teacher`] = 'Teacher is required';
      }
      if (student.parentGuardianEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(student.parentGuardianEmail)) {
        errors[`additionalStudent${index}.parentGuardianEmail`] = 'Please enter a valid email address';
      }
    });

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setShowError(false);

    if (!validateForm()) {
      setError('Please correct the errors in the form before submitting.');
      setShowError(true);
      return;
    }

    setLoading(true);

    try {
      const response = await registerProject(formData);
      
      // Navigate to confirmation page with registration details
      navigate('/confirmation', {
        state: {
          projectId: response.projectId,
          timestamp: response.timestamp,
        },
      });
    } catch (err) {
      const errorResponse = err as ErrorResponse;
      
      if (errorResponse.errors) {
        const newErrors: Record<string, string> = {};
        errorResponse.errors.forEach((error) => {
          newErrors[error.field] = error.message;
        });
        setFieldErrors(newErrors);
      }
      
      setError(
        errorResponse.message || 'Failed to submit registration. Please try again.'
      );
      setShowError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      <Snackbar
        open={showError}
        autoHideDuration={6000}
        onClose={() => setShowError(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setShowError(false)}
          severity="error"
          sx={{ width: '100%' }}
        >
          {error}
        </Alert>
      </Snackbar>

      <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
        Primary Student Information
      </Typography>

      <TextField
        fullWidth
        required
        label="Student Name"
        value={formData.studentName}
        onChange={(e) => handleChange('studentName', e.target.value)}
        error={!!fieldErrors.studentName}
        helperText={fieldErrors.studentName}
        margin="normal"
        inputProps={{ 'aria-label': 'Student Name' }}
        autoFocus
      />

      <FormControl
        fullWidth
        required
        margin="normal"
        error={!!fieldErrors.teacher}
        disabled={loadingTeachers}
      >
        <InputLabel id="teacher-label">Teacher</InputLabel>
        <Select
          labelId="teacher-label"
          value={formData.teacher}
          onChange={(e) => {
            const selectedValue = e.target.value;
            const selectedTeacher = teachers.find(t => t.name === selectedValue);
            handleChange('teacher', selectedValue);
            handleChange('grade', selectedTeacher?.grade || '');
            // Focus on project name field after selection
            setTimeout(() => projectNameRef.current?.focus(), 0);
          }}
          label="Teacher"
          inputProps={{ 'aria-label': 'Teacher' }}
        >
          {teachers
            .sort((a, b) => {
              // Sort by grade first (letters before numbers), then by name
              const gradeA = a.grade.toUpperCase();
              const gradeB = b.grade.toUpperCase();
              const isNumA = !isNaN(Number(gradeA));
              const isNumB = !isNaN(Number(gradeB));
              
              if (isNumA && !isNumB) return 1; // Numbers after letters
              if (!isNumA && isNumB) return -1; // Letters before numbers
              if (gradeA !== gradeB) return gradeA.localeCompare(gradeB);
              return a.name.localeCompare(b.name);
            })
            .map((teacher) => (
              <MenuItem key={teacher.name} value={teacher.name}>
                {teacher.grade} - {teacher.name}
              </MenuItem>
            ))}
        </Select>
        {fieldErrors.teacher && <FormHelperText>{fieldErrors.teacher}</FormHelperText>}
      </FormControl>

      <TextField
        fullWidth
        label="Project Name (Optional)"
        value={formData.projectName}
        onChange={(e) => handleChange('projectName', e.target.value)}
        margin="normal"
        inputProps={{ 'aria-label': 'Project Name' }}
        inputRef={projectNameRef}
      />

      <Divider sx={{ my: 3 }} />

      <Typography variant="h6" gutterBottom>
        Parent/Guardian Information
      </Typography>

      <TextField
        fullWidth
        required
        label="Parent/Guardian Name"
        value={formData.parentGuardianName}
        onChange={(e) => handleChange('parentGuardianName', e.target.value)}
        error={!!fieldErrors.parentGuardianName}
        helperText={fieldErrors.parentGuardianName}
        margin="normal"
        inputProps={{ 'aria-label': 'Parent/Guardian Name' }}
        inputRef={parentNameRef}
      />

      <TextField
        fullWidth
        required
        type="email"
        label="Parent/Guardian Email"
        value={formData.parentGuardianEmail}
        onChange={(e) => handleChange('parentGuardianEmail', e.target.value)}
        error={!!fieldErrors.parentGuardianEmail}
        helperText={fieldErrors.parentGuardianEmail}
        margin="normal"
        inputProps={{ 'aria-label': 'Parent/Guardian Email' }}
      />

      {/* Additional Students Section */}
      {formData.additionalStudents.length > 0 && (
        <>
          <Divider sx={{ my: 3 }} />
          <Typography variant="h6" gutterBottom>
            Additional Group Members
          </Typography>
        </>
      )}

      {formData.additionalStudents.map((student, index) => (
        <Box key={index} sx={{ mb: 3, p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="subtitle1">Student {index + 2}</Typography>
            <IconButton
              onClick={() => removeAdditionalStudent(index)}
              color="error"
              aria-label={`Remove student ${index + 2}`}
            >
              <DeleteIcon />
            </IconButton>
          </Box>

          <TextField
            fullWidth
            required
            label="Student Name"
            value={student.studentName}
            onChange={(e) =>
              handleAdditionalStudentChange(index, 'studentName', e.target.value)
            }
            error={!!fieldErrors[`additionalStudent${index}.studentName`]}
            helperText={fieldErrors[`additionalStudent${index}.studentName`]}
            margin="normal"
            inputProps={{ 'aria-label': `Student ${index + 2} Name` }}
            inputRef={(el) => (additionalStudentRefs.current[index] = el)}
          />

          <FormControl
            fullWidth
            required
            margin="normal"
            error={!!fieldErrors[`additionalStudent${index}.teacher`]}
            disabled={loadingTeachers}
          >
            <InputLabel>Teacher</InputLabel>
            <Select
              value={student.teacher}
              onChange={(e) => {
                const selectedValue = e.target.value;
                const selectedTeacher = teachers.find(t => t.name === selectedValue);
                handleAdditionalStudentTeacherChange(index, selectedValue, selectedTeacher?.grade || '');
                // Focus on parent name field after selection
                setTimeout(() => additionalStudentParentRefs.current[index]?.focus(), 0);
              }}
              label="Teacher"
              inputProps={{ 'aria-label': `Student ${index + 2} Teacher` }}
            >
              {teachers
                .sort((a, b) => {
                  const gradeA = a.grade.toUpperCase();
                  const gradeB = b.grade.toUpperCase();
                  const isNumA = !isNaN(Number(gradeA));
                  const isNumB = !isNaN(Number(gradeB));
                  
                  if (isNumA && !isNumB) return 1;
                  if (!isNumA && isNumB) return -1;
                  if (gradeA !== gradeB) return gradeA.localeCompare(gradeB);
                  return a.name.localeCompare(b.name);
                })
                .map((teacher) => (
                  <MenuItem key={teacher.name} value={teacher.name}>
                    {teacher.grade} - {teacher.name}
                  </MenuItem>
                ))}
            </Select>
            {fieldErrors[`additionalStudent${index}.teacher`] && (
              <FormHelperText>{fieldErrors[`additionalStudent${index}.teacher`]}</FormHelperText>
            )}
          </FormControl>

          <TextField
            fullWidth
            label="Parent/Guardian Name (Optional)"
            value={student.parentGuardianName || ''}
            onChange={(e) =>
              handleAdditionalStudentChange(index, 'parentGuardianName', e.target.value)
            }
            margin="normal"
            inputProps={{ 'aria-label': `Student ${index + 2} Parent/Guardian Name` }}
            inputRef={(el) => (additionalStudentParentRefs.current[index] = el)}
          />

          <TextField
            fullWidth
            type="email"
            label="Parent/Guardian Email (Optional)"
            value={student.parentGuardianEmail || ''}
            onChange={(e) =>
              handleAdditionalStudentChange(index, 'parentGuardianEmail', e.target.value)
            }
            error={!!fieldErrors[`additionalStudent${index}.parentGuardianEmail`]}
            helperText={fieldErrors[`additionalStudent${index}.parentGuardianEmail`]}
            margin="normal"
            inputProps={{ 'aria-label': `Student ${index + 2} Parent/Guardian Email` }}
          />
        </Box>
      ))}

      {formData.additionalStudents.length < 3 && (
        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={addAdditionalStudent}
          sx={{ mt: 2, mb: 3 }}
        >
          Add Group Member (up to 3 additional students)
        </Button>
      )}

      <Divider sx={{ my: 3 }} />

      <FormControlLabel
        control={
          <Checkbox
            checked={formData.consentGiven}
            onChange={(e) => handleChange('consentGiven', e.target.checked)}
            inputProps={{ 'aria-label': 'Consent to terms' }}
          />
        }
        label={
          <Typography variant="body2" component="span">
            I consent to the collection, storage, processing, and use of the data provided in this form according to the{' '}
            <Link
              href="/privacy"
              target="_blank"
              rel="noopener noreferrer"
              underline="hover"
              onClick={(e) => {
                e.preventDefault();
                window.open('/privacy', '_blank', 'noopener,noreferrer');
              }}
            >
              Privacy Policy
            </Link>
            . *
          </Typography>
        }
      />
      {fieldErrors.consentGiven && (
        <FormHelperText error sx={{ ml: 2 }}>
          {fieldErrors.consentGiven}
        </FormHelperText>
      )}

      <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'center' }}>
        <Button variant="outlined" onClick={() => navigate('/')} disabled={loading}>
          Cancel
        </Button>
        <Button
          type="submit"
          variant="contained"
          size="large"
          disabled={loading}
          sx={{ minWidth: 200 }}
        >
          {loading ? <CircularProgress size={24} /> : 'Submit Registration'}
        </Button>
      </Box>
    </Box>
  );
};

export default RegistrationForm;
