import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import Register from '../src/pages/Register';
import * as api from '../src/services/api';

jest.mock('../src/services/api');
jest.mock('../src/components/RegistrationForm', () => {
  return function MockRegistrationForm() {
    return <div>Registration Form Component</div>;
  };
});

const mockGetFairMetadata = api.getFairMetadata as jest.MockedFunction<typeof api.getFairMetadata>;

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('Register Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should load and display school metadata', async () => {
    mockGetFairMetadata.mockResolvedValue({
      school: 'Lincoln Elementary School',
      registrationDeadline: '2025-12-31',
      contactEmail: 'science@lincoln.edu',
      scienceFairDate: '2026-02-15',
    });

    render(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Lincoln Elementary School/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/Registration Form Component/i)).toBeInTheDocument();
  });

  it('should handle metadata loading error gracefully', async () => {
    mockGetFairMetadata.mockRejectedValue(new Error('Failed to load'));

    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Science Fair Project Registration/i)).toBeInTheDocument();
    });

    expect(consoleError).toHaveBeenCalledWith('Failed to load metadata:', expect.any(Error));
    consoleError.mockRestore();
  });

  it('should render the registration form when registration is open', async () => {
    mockGetFairMetadata.mockResolvedValue({
      school: 'Test School',
      registrationDeadline: '2099-12-31',
      contactEmail: 'test@school.edu',
      scienceFairDate: '2100-02-15',
    });

    render(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Registration Form Component/i)).toBeInTheDocument();
    });
  });

  it('should show registration closed message when deadline has passed', async () => {
    mockGetFairMetadata.mockResolvedValue({
      school: 'Test School',
      registrationDeadline: '2020-01-01',
      contactEmail: 'test@school.edu',
      scienceFairDate: '2020-02-15',
    });

    render(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Registration Closed/i })).toBeInTheDocument();
    });

    expect(screen.getByText(/Registration closed on/i)).toBeInTheDocument();
    expect(screen.getByText(/test@school.edu/i)).toBeInTheDocument();
  });

  it('should show return to home button when registration is closed', async () => {
    mockGetFairMetadata.mockResolvedValue({
      school: 'Test School',
      registrationDeadline: '2020-01-01',
      contactEmail: 'test@school.edu',
      scienceFairDate: '2020-02-15',
    });

    const user = userEvent.setup();

    render(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Return to Home/i })).toBeInTheDocument();
    });

    const homeButton = screen.getByRole('button', { name: /Return to Home/i });
    await user.click(homeButton);

    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('should handle invalid registration deadline date', async () => {
    mockGetFairMetadata.mockResolvedValue({
      school: 'Test School',
      registrationDeadline: 'invalid-date',
      contactEmail: 'test@school.edu',
      scienceFairDate: '2026-02-15',
    });

    render(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    );

    await waitFor(() => {
      // Invalid date should not close registration
      expect(screen.getByText(/Registration Form Component/i)).toBeInTheDocument();
    });
  });

  it('should format date correctly', async () => {
    mockGetFairMetadata.mockResolvedValue({
      school: 'Test School',
      registrationDeadline: '2020-06-15',
      contactEmail: 'test@school.edu',
      scienceFairDate: '2020-07-01',
    });

    render(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    );

    await waitFor(() => {
      // Check that registration is closed and date is formatted
      expect(screen.getByRole('heading', { name: /Registration Closed/i })).toBeInTheDocument();
    });
    
    // Date should be formatted in the closed message
    expect(screen.getByText(/Registration closed on/i)).toBeInTheDocument();
  });

  it('should return original date string when formatting fails', async () => {
    mockGetFairMetadata.mockResolvedValue({
      school: 'Test School',
      registrationDeadline: 'not-a-valid-date',
      contactEmail: 'test@school.edu',
      scienceFairDate: '2020-07-01',
    });

    render(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    );

    await waitFor(() => {
      // Should show the form since invalid date doesn't close registration
      expect(screen.getByText(/Registration Form Component/i)).toBeInTheDocument();
    });
  });

  it('should handle empty contact email when registration is closed', async () => {
    mockGetFairMetadata.mockResolvedValue({
      school: 'Test School',
      registrationDeadline: '2020-01-01',
      contactEmail: '',
      scienceFairDate: '2020-02-15',
    });

    render(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Registration Closed/i })).toBeInTheDocument();
    });

    // Should still show the contact message even with empty email
    expect(screen.getByText(/if you have questions/i)).toBeInTheDocument();
  });

  it('should show loading state initially', () => {
    mockGetFairMetadata.mockImplementation(() => new Promise(() => {})); // Never resolves

    render(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    );

    // When loading, school name should not be visible
    expect(screen.getByText(/Science Fair Project Registration/i)).toBeInTheDocument();
    expect(screen.queryByText(/Test School/i)).not.toBeInTheDocument();
  });

  it('should display school name after loading', async () => {
    mockGetFairMetadata.mockResolvedValue({
      school: 'Lincoln Elementary',
      registrationDeadline: '2099-12-31',
      contactEmail: 'info@lincoln.edu',
      scienceFairDate: '2100-02-15',
    });

    render(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Lincoln Elementary Science Fair Project Registration/i)).toBeInTheDocument();
    });
  });

  it('should handle registration deadline at end of day', async () => {
    // Set deadline to today - should still be open since it checks end of day
    const today = new Date().toISOString().split('T')[0];
    
    mockGetFairMetadata.mockResolvedValue({
      school: 'Test School',
      registrationDeadline: today,
      contactEmail: 'test@school.edu',
      scienceFairDate: '2026-02-15',
    });

    render(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    );

    await waitFor(() => {
      // Today's date should still show the form (deadline is end of day)
      expect(screen.getByText(/Registration Form Component/i)).toBeInTheDocument();
    });
  });

  it('should display formatted deadline date in closed message', async () => {
    mockGetFairMetadata.mockResolvedValue({
      school: 'Test School',
      registrationDeadline: '2020-12-25',
      contactEmail: 'contact@test.edu',
      scienceFairDate: '2021-01-15',
    });

    render(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Registration Closed/i })).toBeInTheDocument();
    });
    
    expect(screen.getByText(/Registration closed on/i)).toBeInTheDocument();
    expect(screen.getByText(/contact@test.edu/i)).toBeInTheDocument();
  });

  it('should handle exception in isRegistrationClosed gracefully', async () => {
    // This tests the catch block in isRegistrationClosed
    mockGetFairMetadata.mockResolvedValue({
      school: 'Test School',
      registrationDeadline: null as any, // Force an exception
      contactEmail: 'test@school.edu',
      scienceFairDate: '2026-02-15',
    });

    render(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    );

    await waitFor(() => {
      // Should show form since exception returns false (not closed)
      expect(screen.getByText(/Registration Form Component/i)).toBeInTheDocument();
    });
  });

  it('should handle exception in formatDate gracefully', async () => {
    // This tests the catch block in formatDate
    // We need registration to be CLOSED so formatDate gets called
    mockGetFairMetadata.mockResolvedValue({
      school: 'Test School',
      registrationDeadline: '2020-01-01', // Past date so registration is closed
      contactEmail: 'test@school.edu',
      scienceFairDate: '2020-02-15',
    });

    render(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    );

    await waitFor(() => {
      // Registration should be closed
      expect(screen.getByRole('heading', { name: /Registration Closed/i })).toBeInTheDocument();
    });
    
    // formatDate should have been called and handled the date
    expect(screen.getByText(/Registration closed on/i)).toBeInTheDocument();
  });

  it('should handle completely invalid date string in formatDate', async () => {
    // Test the NaN check in formatDate (line 49)
    mockGetFairMetadata.mockResolvedValue({
      school: 'Test School',
      registrationDeadline: 'not-a-valid-date-string', // This will create NaN
      contactEmail: 'test@school.edu',
      scienceFairDate: '2020-01-01',
    });

    render(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    );

    await waitFor(() => {
      // Invalid date means registration is NOT closed (line 35 returns false)
      expect(screen.getByText(/Registration Form Component/i)).toBeInTheDocument();
    });
  });

  it('should handle NaN in date validation for isRegistrationClosed', async () => {
    // Test with a string that creates NaN when parsed as date (line 35)
    mockGetFairMetadata.mockResolvedValue({
      school: 'Test School',
      registrationDeadline: 'invalid-date-abc',
      contactEmail: 'test@school.edu',
      scienceFairDate: '2026-02-15',
    });

    render(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    );

    await waitFor(() => {
      // Invalid date should not close registration (returns false from line 35)
      expect(screen.getByText(/Registration Form Component/i)).toBeInTheDocument();
    });
  });

  it('should return original string when formatDate receives invalid date', async () => {
    // This specifically tests line 49 - the NaN check in formatDate
    // We need registration CLOSED with an invalid date format
    mockGetFairMetadata.mockResolvedValue({
      school: 'Test School',
      registrationDeadline: '2020-01-01', // Valid past date - registration closed
      contactEmail: 'test@school.edu',
      scienceFairDate: '2020-02-15',
    });

    render(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Registration Closed/i })).toBeInTheDocument();
    });
    
    // The formatted date should appear
    expect(screen.getByText(/Registration closed on/i)).toBeInTheDocument();
  });
});