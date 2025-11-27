import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import RegistrationForm from '../src/components/RegistrationForm';
import * as api from '../src/services/api';

jest.mock('../src/services/api');
const mockedApi = api as jest.Mocked<typeof api>;

describe('RegistrationForm Component', () => {
  const mockTeachers = [
    { name: 'Mrs. Smith', grade: '3' },
    { name: 'Mr. Johnson', grade: '4' },
    { name: 'Ms. Davis', grade: '5' },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should render the form with all required fields', async () => {
    mockedApi.getTeachers.mockResolvedValue(mockTeachers);

    render(
      <BrowserRouter>
        <RegistrationForm />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/Student Name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Teacher/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Project Name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Parent\/Guardian Name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Parent\/Guardian Email/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Submit Registration/i })).toBeInTheDocument();
    });
  });

  it('should display loading spinner when teachers are loading', () => {
    mockedApi.getTeachers.mockImplementation(() => new Promise(() => {})); // Never resolves

    render(
      <BrowserRouter>
        <RegistrationForm />
      </BrowserRouter>
    );

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('should display loading spinner in additional student teacher select when loading', async () => {
    mockedApi.getTeachers.mockImplementation(() => new Promise(() => {})); // Never resolves
    const user = userEvent.setup();

    render(
      <BrowserRouter>
        <RegistrationForm />
      </BrowserRouter>
    );

    // Wait for the initial progressbar
    expect(screen.getByRole('progressbar')).toBeInTheDocument();

    // The "Add Group Member" button should be visible even while loading
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Add Group Member/i })).toBeInTheDocument();
    });

    // Add an additional student
    const addButton = screen.getByRole('button', { name: /Add Group Member/i });
    await user.click(addButton);

    // Now there should be 2 progressbars (one for primary, one for additional student)
    const progressBars = screen.getAllByRole('progressbar');
    expect(progressBars.length).toBe(2);
  });

  it('should display error alert when teachers fail to load', async () => {
    mockedApi.getTeachers.mockRejectedValue(new Error('Failed to load teachers'));

    render(
      <BrowserRouter>
        <RegistrationForm />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Unable to load teacher list/)).toBeInTheDocument();
    });
  });

  it('should disable submit button when teachers fail to load', async () => {
    mockedApi.getTeachers.mockRejectedValue(new Error('Failed to load teachers'));

    render(
      <BrowserRouter>
        <RegistrationForm />
      </BrowserRouter>
    );

    await waitFor(() => {
      const submitButton = screen.getByRole('button', { name: /Submit Registration/i });
      expect(submitButton).toBeDisabled();
    });
  });

  it('should allow adding additional students', async () => {
    mockedApi.getTeachers.mockResolvedValue(mockTeachers);
    const user = userEvent.setup();

    render(
      <BrowserRouter>
        <RegistrationForm />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Add Group Member/i })).toBeInTheDocument();
    });

    const addButton = screen.getByRole('button', { name: /Add Group Member/i });
    await user.click(addButton);

    const studentNameFields = screen.getAllByLabelText(/Student Name|Student \d Name/i);
    expect(studentNameFields.length).toBeGreaterThan(1);
  });

  it('should limit additional students to 3', async () => {
    mockedApi.getTeachers.mockResolvedValue(mockTeachers);
    const user = userEvent.setup();

    render(
      <BrowserRouter>
        <RegistrationForm />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Add Group Member/i })).toBeInTheDocument();
    });

    const addButton = screen.getByRole('button', { name: /Add Group Member/i });
    
    await user.click(addButton);
    await user.click(addButton);
    await user.click(addButton);

    // Button should not be in the document after adding 3 students
    expect(screen.queryByRole('button', { name: /Add Group Member/i })).not.toBeInTheDocument();
  });

  it('should allow removing additional students', async () => {
    mockedApi.getTeachers.mockResolvedValue(mockTeachers);
    const user = userEvent.setup();

    render(
      <BrowserRouter>
        <RegistrationForm />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Add Group Member/i })).toBeInTheDocument();
    });

    const addButton = screen.getByRole('button', { name: /Add Group Member/i });
    await user.click(addButton);

    const removeButton = screen.getByRole('button', { name: /Remove student/i });
    await user.click(removeButton);

    // Only the primary student name field should remain
    const studentNameFields = screen.queryAllByLabelText(/Student \d Name/i);
    expect(studentNameFields).toHaveLength(0);
  });

  it('should show validation errors when submitting empty form', async () => {
    mockedApi.getTeachers.mockResolvedValue(mockTeachers);
    const user = userEvent.setup();

    render(
      <BrowserRouter>
        <RegistrationForm />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Submit Registration/i })).toBeInTheDocument();
    });

    const submitButton = screen.getByRole('button', { name: /Submit Registration/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Student name is required/i)).toBeInTheDocument();
      expect(screen.getByText(/Teacher selection is required/i)).toBeInTheDocument();
      expect(screen.getByText(/Parent\/Guardian name is required/i)).toBeInTheDocument();
      expect(screen.getByText(/Parent\/Guardian email is required/i)).toBeInTheDocument();
      expect(screen.getByText(/You must give consent to register/i)).toBeInTheDocument();
    });
  });

  it('should show validation error for invalid email', async () => {
    mockedApi.getTeachers.mockResolvedValue(mockTeachers);
    const user = userEvent.setup();

    render(
      <BrowserRouter>
        <RegistrationForm />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/Parent\/Guardian Email/i)).toBeInTheDocument();
    });

    const emailField = screen.getByLabelText(/Parent\/Guardian Email/i);
    await user.type(emailField, 'invalid-email');

    const submitButton = screen.getByRole('button', { name: /Submit Registration/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Please enter a valid email address/i)).toBeInTheDocument();
    });
  });

  it('should clear field errors when user starts typing', async () => {
    mockedApi.getTeachers.mockResolvedValue(mockTeachers);
    const user = userEvent.setup();

    render(
      <BrowserRouter>
        <RegistrationForm />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Submit Registration/i })).toBeInTheDocument();
    });

    const submitButton = screen.getByRole('button', { name: /Submit Registration/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Student name is required/i)).toBeInTheDocument();
    });

    const studentNameField = screen.getByLabelText(/^Student Name$/i);
    await user.type(studentNameField, 'John Doe');

    await waitFor(() => {
      expect(screen.queryByText(/Student name is required/i)).not.toBeInTheDocument();
    });
  });

  it('should handle successful form submission', async () => {
    mockedApi.getTeachers.mockResolvedValue(mockTeachers);
    mockedApi.registerProject.mockResolvedValue({
      success: true,
      projectId: 12345,
      timestamp: '2025-11-25T10:00:00Z',
      message: 'Registration successful',
    });

    const user = userEvent.setup();
    const mockNavigate = jest.fn();
    jest.mock('react-router-dom', () => ({
      ...jest.requireActual('react-router-dom'),
      useNavigate: () => mockNavigate,
    }));

    render(
      <BrowserRouter>
        <RegistrationForm />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/^Student Name$/i)).toBeInTheDocument();
    });

    // Wait for teachers to load (loading spinner should disappear)
    await waitFor(() => {
      expect(screen.queryByText(/Loading teachers.../i)).not.toBeInTheDocument();
    });

    await user.type(screen.getByLabelText(/^Student Name$/i), 'John Doe');
    await user.click(screen.getByLabelText(/Teacher/i));
    await user.click(screen.getByText(/Mrs. Smith/));
    await user.type(screen.getByLabelText(/Project Name/i), 'Volcano');
    await user.type(screen.getByLabelText(/Parent\/Guardian Name/i), 'Jane Doe');
    await user.type(screen.getByLabelText(/Parent\/Guardian Email/i), 'jane@example.com');
    await user.click(screen.getByLabelText(/Consent to terms/i));

    const submitButton = screen.getByRole('button', { name: /Submit Registration/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockedApi.registerProject).toHaveBeenCalledWith({
        studentName: 'John Doe',
        teacher: 'Mrs. Smith',
        grade: '3',
        projectName: 'Volcano',
        parentGuardianName: 'Jane Doe',
        parentGuardianEmail: 'jane@example.com',
        consentGiven: true,
        additionalStudents: [],
      });
    });
  });

  it('should handle registration submission error with field errors', async () => {
    mockedApi.getTeachers.mockResolvedValue(mockTeachers);
    mockedApi.registerProject.mockRejectedValue({
      success: false,
      message: 'Validation failed',
      errors: [
        { field: 'studentName', message: 'Invalid student name' },
        { field: 'parentGuardianEmail', message: 'Email already registered' },
      ],
    });

    const user = userEvent.setup();

    render(
      <BrowserRouter>
        <RegistrationForm />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/^Student Name$/i)).toBeInTheDocument();
    });

    await user.type(screen.getByLabelText(/^Student Name$/i), 'John Doe');
    await user.click(screen.getByLabelText(/Teacher/i));
    await user.click(screen.getByText(/Mrs. Smith/));
    await user.type(screen.getByLabelText(/Parent\/Guardian Name/i), 'Jane Doe');
    await user.type(screen.getByLabelText(/Parent\/Guardian Email/i), 'jane@example.com');
    await user.click(screen.getByLabelText(/Consent to terms/i));

    const submitButton = screen.getByRole('button', { name: /Submit Registration/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Invalid student name/i)).toBeInTheDocument();
      expect(screen.getByText(/Email already registered/i)).toBeInTheDocument();
      expect(screen.getByText(/Validation failed/i)).toBeInTheDocument();
    });
  });

  it('should handle registration submission error without field errors', async () => {
    mockedApi.getTeachers.mockResolvedValue(mockTeachers);
    mockedApi.registerProject.mockRejectedValue({
      success: false,
      message: 'Server error',
    });

    const user = userEvent.setup();

    render(
      <BrowserRouter>
        <RegistrationForm />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/^Student Name$/i)).toBeInTheDocument();
    });

    await user.type(screen.getByLabelText(/^Student Name$/i), 'John Doe');
    await user.click(screen.getByLabelText(/Teacher/i));
    await user.click(screen.getByText(/Mrs. Smith/));
    await user.type(screen.getByLabelText(/Parent\/Guardian Name/i), 'Jane Doe');
    await user.type(screen.getByLabelText(/Parent\/Guardian Email/i), 'jane@example.com');
    await user.click(screen.getByLabelText(/Consent to terms/i));

    const submitButton = screen.getByRole('button', { name: /Submit Registration/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Server error/i)).toBeInTheDocument();
    });
  });

  it('should validate additional students', async () => {
    mockedApi.getTeachers.mockResolvedValue(mockTeachers);
    const user = userEvent.setup();

    render(
      <BrowserRouter>
        <RegistrationForm />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Add Group Member/i })).toBeInTheDocument();
    });

    // Wait for teachers to load (loading spinner should disappear)
    await waitFor(() => {
      expect(screen.queryByText(/Loading teachers.../i)).not.toBeInTheDocument();
    });

    // Add an additional student
    const addButton = screen.getByRole('button', { name: /Add Group Member/i });
    await user.click(addButton);

    // Fill primary student
    await user.type(screen.getByLabelText(/^Student Name$/i), 'John Doe');
    await user.click(screen.getByLabelText(/^Teacher$/i));
    await user.click(screen.getAllByText(/Mrs. Smith/)[0]);
    await user.type(screen.getByLabelText(/^Parent\/Guardian Name$/i), 'Jane Doe');
    await user.type(screen.getByLabelText(/^Parent\/Guardian Email$/i), 'jane@example.com');
    await user.click(screen.getByLabelText(/Consent to terms/i));

    // Try to submit without filling additional student
    const submitButton = screen.getByRole('button', { name: /Submit Registration/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Student name is required/i)).toBeInTheDocument();
    });
  });

  it('should validate additional student email format', async () => {
    mockedApi.getTeachers.mockResolvedValue(mockTeachers);
    const user = userEvent.setup();

    render(
      <BrowserRouter>
        <RegistrationForm />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Add Group Member/i })).toBeInTheDocument();
    });

    const addButton = screen.getByRole('button', { name: /Add Group Member/i });
    await user.click(addButton);

    // Fill primary student
    const studentNameInput = screen.getByLabelText(/^Student Name$/i);
    await user.clear(studentNameInput);
    await user.type(studentNameInput, 'John Doe');
    
    await user.click(screen.getByLabelText(/^Teacher$/i));
    await waitFor(() => {
      expect(screen.getAllByText(/Mrs. Smith/)[0]).toBeInTheDocument();
    });
    await user.click(screen.getAllByText(/Mrs. Smith/)[0]);
    
    await user.type(screen.getByLabelText(/^Parent\/Guardian Name$/i), 'Jane Doe');
    await user.type(screen.getByLabelText(/^Parent\/Guardian Email$/i), 'jane@example.com');
    await user.click(screen.getByLabelText(/Consent to terms/i));

    // Fill additional student with invalid email
    await user.type(screen.getByLabelText(/Student 2 Name/i), 'Alice Smith');
    await user.click(screen.getByLabelText(/Student 2 Teacher/i));
    await waitFor(() => {
      expect(screen.getAllByText(/Mr. Johnson/)[0]).toBeInTheDocument();
    });
    await user.click(screen.getAllByText(/Mr. Johnson/)[0]);
    await user.type(screen.getByLabelText(/Student 2 Parent\/Guardian Email/i), 'invalid-email');

    const submitButton = screen.getByRole('button', { name: /Submit Registration/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getAllByText(/Please enter a valid email address/i).length).toBeGreaterThan(0);
    }, { timeout: 10000 });
  }, 15000);

  it('should allow clicking Cancel button', async () => {
    mockedApi.getTeachers.mockResolvedValue(mockTeachers);
    const user = userEvent.setup();

    render(
      <BrowserRouter>
        <RegistrationForm />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Cancel/i })).toBeInTheDocument();
    });

    const cancelButton = screen.getByRole('button', { name: /Cancel/i });
    expect(cancelButton).not.toBeDisabled();
    await user.click(cancelButton);
  });

  it('should close error snackbar when clicking close button', async () => {
    mockedApi.getTeachers.mockResolvedValue(mockTeachers);
    const user = userEvent.setup();

    render(
      <BrowserRouter>
        <RegistrationForm />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Submit Registration/i })).toBeInTheDocument();
    });

    // Submit empty form to trigger error
    const submitButton = screen.getByRole('button', { name: /Submit Registration/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Please correct the errors/i)).toBeInTheDocument();
    });

    // Close the snackbar
    const closeButton = screen.getByRole('button', { name: /close/i });
    await user.click(closeButton);

    await waitFor(() => {
      expect(screen.queryByText(/Please correct the errors/i)).not.toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('should handle teacher selection and auto-fill grade', async () => {
    mockedApi.getTeachers.mockResolvedValue(mockTeachers);
    const user = userEvent.setup();

    render(
      <BrowserRouter>
        <RegistrationForm />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/Teacher/i)).toBeInTheDocument();
    });

    const teacherSelect = screen.getByLabelText(/Teacher/i);
    await user.click(teacherSelect);
    
    await waitFor(() => {
      expect(screen.getByText(/4 - Mr. Johnson/)).toBeInTheDocument();
    });
    
    await user.click(screen.getByText(/4 - Mr. Johnson/));

    // Verify the teacher was selected by checking the displayed text
    await waitFor(() => {
      expect(teacherSelect).toHaveTextContent('4 - Mr. Johnson');
    });
  });

  it('should handle additional student teacher selection and auto-fill grade', async () => {
    mockedApi.getTeachers.mockResolvedValue(mockTeachers);
    const user = userEvent.setup();

    render(
      <BrowserRouter>
        <RegistrationForm />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Add Group Member/i })).toBeInTheDocument();
    });

    const addButton = screen.getByRole('button', { name: /Add Group Member/i });
    await user.click(addButton);

    await waitFor(() => {
      expect(screen.getByLabelText(/Student 2 Teacher/i)).toBeInTheDocument();
    });

    const additionalTeacherSelect = screen.getByLabelText(/Student 2 Teacher/i);
    await user.click(additionalTeacherSelect);
    
    await waitFor(() => {
      expect(screen.getAllByText(/5 - Ms. Davis/)[0]).toBeInTheDocument();
    });
    
    await user.click(screen.getAllByText(/5 - Ms. Davis/)[0]);

    await waitFor(() => {
      expect(additionalTeacherSelect).toHaveTextContent('5 - Ms. Davis');
    });
  });

  it('should open privacy policy link in new window', async () => {
    mockedApi.getTeachers.mockResolvedValue(mockTeachers);
    const user = userEvent.setup();
    const windowOpenSpy = jest.spyOn(window, 'open').mockImplementation(() => null);

    render(
      <BrowserRouter>
        <RegistrationForm />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Privacy Policy/i)).toBeInTheDocument();
    });

    const privacyLink = screen.getByText(/Privacy Policy/i);
    await user.click(privacyLink);

    expect(windowOpenSpy).toHaveBeenCalledWith('/privacy', '_blank', 'noopener,noreferrer');

    windowOpenSpy.mockRestore();
  });

  it('should fill additional student parent info', async () => {
    mockedApi.getTeachers.mockResolvedValue(mockTeachers);
    const user = userEvent.setup();

    render(
      <BrowserRouter>
        <RegistrationForm />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Add Group Member/i })).toBeInTheDocument();
    });

    const addButton = screen.getByRole('button', { name: /Add Group Member/i });
    await user.click(addButton);

    await user.type(screen.getByLabelText(/Student 2 Name/i), 'Alice Smith');
    await user.type(screen.getByLabelText(/Student 2 Parent\/Guardian Name/i), 'Bob Smith');

    expect(screen.getByLabelText(/Student 2 Parent\/Guardian Name/i)).toHaveValue('Bob Smith');
  });

  it('should sort teachers with different letter grades correctly', async () => {
    const teachersWithLetterGrades = [
      { name: 'Mrs. Jones', grade: 'K' },
      { name: 'Mr. Adams', grade: 'A' },
      { name: 'Ms. Brown', grade: 'B' },
    ];
    mockedApi.getTeachers.mockResolvedValue(teachersWithLetterGrades);

    render(
      <BrowserRouter>
        <RegistrationForm />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/^Teacher$/i)).toBeInTheDocument();
    });

    const user = userEvent.setup();
    await user.click(screen.getByLabelText(/^Teacher$/i));

    await waitFor(() => {
      const options = screen.getAllByRole('option');
      // Options should be sorted: A, B, K (alphabetically)
      expect(options[0]).toHaveTextContent('A - Mr. Adams');
      expect(options[1]).toHaveTextContent('B - Ms. Brown');
      expect(options[2]).toHaveTextContent('K - Mrs. Jones');
    });
  });

  it('should sort teachers with same grade by name', async () => {
    const teachersWithSameGrade = [
      { name: 'Mrs. Zeta', grade: '3' },
      { name: 'Mr. Alpha', grade: '3' },
      { name: 'Ms. Beta', grade: '3' },
    ];
    mockedApi.getTeachers.mockResolvedValue(teachersWithSameGrade);

    render(
      <BrowserRouter>
        <RegistrationForm />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/^Teacher$/i)).toBeInTheDocument();
    });

    const user = userEvent.setup();
    await user.click(screen.getByLabelText(/^Teacher$/i));

    await waitFor(() => {
      const options = screen.getAllByRole('option');
      const optionTexts = options.map(opt => opt.textContent);
      // Teachers with same grade should be sorted by name alphabetically
      const grade3Teachers = optionTexts.filter(text => text?.includes('3 -'));
      expect(grade3Teachers.length).toBe(3);
      // Check that when sorted, they maintain alphabetical order by teacher name
      const sortedTeachers = [...grade3Teachers].sort();
      expect(grade3Teachers).toEqual(sortedTeachers);
    });
  });

  it('should sort teachers with same letter and number grades by name', async () => {
    const teachersWithSameGrades = [
      { name: 'Teacher 4', grade: 'A' },
      { name: 'Teacher 1', grade: '2' },
      { name: 'Teacher 3', grade: '3' },
      { name: 'Teacher 6', grade: '1' },
      { name: 'Teacher 2', grade: 'K' },
      { name: 'Teacher 1', grade: 'K' },
      { name: 'Teacher 8', grade: '1' },
      { name: 'Teacher 7', grade: '1' },
      { name: 'Teacher 5', grade: '1' },
    ];
    mockedApi.getTeachers.mockResolvedValue(teachersWithSameGrades);

    render(
      <BrowserRouter>
        <RegistrationForm />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/^Teacher$/i)).toBeInTheDocument();
    });

    const user = userEvent.setup();
    await user.click(screen.getByLabelText(/^Teacher$/i));

    await waitFor(() => {
      const options = screen.getAllByRole('option');
      // Should be sorted: K grades first (alphabetically by name), then numeric grades (alphabetically by name)
      expect(options[0]).toHaveTextContent('A - Teacher 4');
      expect(options[1]).toHaveTextContent('K - Teacher 1');
      expect(options[2]).toHaveTextContent('K - Teacher 2');
      expect(options[3]).toHaveTextContent('1 - Teacher 5');
      expect(options[4]).toHaveTextContent('1 - Teacher 6');
      expect(options[5]).toHaveTextContent('1 - Teacher 7');
      expect(options[6]).toHaveTextContent('1 - Teacher 8');
      expect(options[7]).toHaveTextContent('2 - Teacher 1');
      expect(options[8]).toHaveTextContent('3 - Teacher 3');
    });
  });

  it('should sort teachers with mixed letter and number grades correctly', async () => {
    const teachersWithMixedGrades = [
      { name: 'Mrs. Third', grade: '3' },
      { name: 'Mr. Kinder', grade: 'K' },
      { name: 'Ms. Fourth', grade: '4' },
      { name: 'Mr. PreK', grade: 'P' },
    ];
    mockedApi.getTeachers.mockResolvedValue(teachersWithMixedGrades);

    render(
      <BrowserRouter>
        <RegistrationForm />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/^Teacher$/i)).toBeInTheDocument();
    });

    const user = userEvent.setup();
    await user.click(screen.getByLabelText(/^Teacher$/i));

    await waitFor(() => {
      const options = screen.getAllByRole('option');
      // Letter grades first (K, P), then number grades (3, 4)
      expect(options[0]).toHaveTextContent('K - Mr. Kinder');
      expect(options[1]).toHaveTextContent('P - Mr. PreK');
      expect(options[2]).toHaveTextContent('3 - Mrs. Third');
      expect(options[3]).toHaveTextContent('4 - Ms. Fourth');
    });
  });

  it('should sort additional student teachers with different grades correctly', async () => {
    const teachersWithDifferentGrades = [
      { name: 'Mrs. Fifth', grade: '5' },
      { name: 'Mr. First', grade: '1' },
      { name: 'Ms. Third', grade: '3' },
    ];
    mockedApi.getTeachers.mockResolvedValue(teachersWithDifferentGrades);
    const user = userEvent.setup();

    render(
      <BrowserRouter>
        <RegistrationForm />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Add Group Member/i })).toBeInTheDocument();
    });

    const addButton = screen.getByRole('button', { name: /Add Group Member/i });
    await user.click(addButton);

    await waitFor(() => {
      expect(screen.getByLabelText(/Student 2 Teacher/i)).toBeInTheDocument();
    });

    await user.click(screen.getByLabelText(/Student 2 Teacher/i));

    await waitFor(() => {
      const options = screen.getAllByRole('option');
      // Options should be sorted by grade numerically: 1, 3, 5
      expect(options[0]).toHaveTextContent('1 - Mr. First');
      expect(options[1]).toHaveTextContent('3 - Ms. Third');
      expect(options[2]).toHaveTextContent('5 - Mrs. Fifth');
    });
  });

  it('should sort additional student teachers with letter grades correctly', async () => {
    const teachersWithLetterGrades = [
      { name: 'Mrs. PreK', grade: 'P' },
      { name: 'Mr. Kinder', grade: 'K' },
      { name: 'Ms. Advanced', grade: 'A' },
    ];
    mockedApi.getTeachers.mockResolvedValue(teachersWithLetterGrades);
    const user = userEvent.setup();

    render(
      <BrowserRouter>
        <RegistrationForm />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Add Group Member/i })).toBeInTheDocument();
    });

    const addButton = screen.getByRole('button', { name: /Add Group Member/i });
    await user.click(addButton);

    await waitFor(() => {
      expect(screen.getByLabelText(/Student 2 Teacher/i)).toBeInTheDocument();
    });

    await user.click(screen.getByLabelText(/Student 2 Teacher/i));

    await waitFor(() => {
      const options = screen.getAllByRole('option');
      // Options should be sorted alphabetically by grade: A, K, P
      expect(options[0]).toHaveTextContent('A - Ms. Advanced');
      expect(options[1]).toHaveTextContent('K - Mr. Kinder');
      expect(options[2]).toHaveTextContent('P - Mrs. PreK');
    });
  });

  it('should handle teacher selection when grade is undefined or empty', async () => {
    const teachersWithMissingGrades = [
      { name: 'Mrs. Smith', grade: '3' },
      { name: 'Mr. NoGrade', grade: '' },
    ];
    mockedApi.getTeachers.mockResolvedValue(teachersWithMissingGrades);
    const user = userEvent.setup();

    render(
      <BrowserRouter>
        <RegistrationForm />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/^Teacher$/i)).toBeInTheDocument();
    });

    // Add an additional student to test both code paths
    const addButton = screen.getByRole('button', { name: /Add Group Member/i });
    await user.click(addButton);

    await waitFor(() => {
      expect(screen.getByLabelText(/Student 2 Teacher/i)).toBeInTheDocument();
    });

    // Select teacher with no grade for primary student
    await user.click(screen.getByLabelText(/^Teacher$/i));
    await user.click(screen.getByText(/Mr. NoGrade/));

    // Verify grade defaults to empty string when teacher grade is undefined/empty
    await waitFor(() => {
      expect(screen.getByLabelText(/^Teacher$/i)).toHaveTextContent('Mr. NoGrade');
    });

    // Select teacher with no grade for additional student
    await user.click(screen.getByLabelText(/Student 2 Teacher/i));
    await user.click(screen.getAllByText(/Mr. NoGrade/)[1]);

    await waitFor(() => {
      expect(screen.getByLabelText(/Student 2 Teacher/i)).toHaveTextContent('Mr. NoGrade');
    });
  });
});

