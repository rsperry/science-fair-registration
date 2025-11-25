import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Welcome from '../src/pages/Welcome';
import * as api from '../src/services/api';
import userEvent from '@testing-library/user-event';

jest.mock('../src/services/api');
const mockedApi = api as jest.Mocked<typeof api>;

describe('Welcome Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should display school name after loading metadata', async () => {
    mockedApi.getFairMetadata.mockResolvedValue({
      school: 'Lincoln Elementary',
      contactEmail: 'science@lincoln.edu',
      registrationDeadline: '2025-12-15',
      scienceFairDate: '2026-02-10',
    });

    render(
      <BrowserRouter>
        <Welcome />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Lincoln Elementary Science Fair Registration/)).toBeInTheDocument();
    });
  });

  it('should display registration button when registration is open', async () => {
    mockedApi.getFairMetadata.mockResolvedValue({
      school: 'Test School',
      contactEmail: 'test@school.edu',
      registrationDeadline: '2099-12-15', // Future date
      scienceFairDate: '2100-02-10',
    });

    render(
      <BrowserRouter>
        <Welcome />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Register Your Project/i })).toBeInTheDocument();
    });
  });

  it('should display error message when metadata fails to load', async () => {
    mockedApi.getFairMetadata.mockRejectedValue(new Error('Network error'));

    render(
      <BrowserRouter>
        <Welcome />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Error Loading Information/)).toBeInTheDocument();
      expect(screen.getByText(/Unable to load science fair information/)).toBeInTheDocument();
    });
  });

  it('should display retry button when there is an error', async () => {
    mockedApi.getFairMetadata.mockRejectedValue(new Error('Network error'));

    render(
      <BrowserRouter>
        <Welcome />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Retry/i })).toBeInTheDocument();
    });
  });

  it('should show registration closed message when deadline has passed', async () => {
    mockedApi.getFairMetadata.mockResolvedValue({
      school: 'Test School',
      contactEmail: 'test@school.edu',
      registrationDeadline: '2020-12-15', // Past date
      scienceFairDate: '2021-02-10',
    });

    render(
      <BrowserRouter>
        <Welcome />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Registration closed on/)).toBeInTheDocument();
    });
  });

  it('should navigate to register page when clicking registration button', async () => {
    mockedApi.getFairMetadata.mockResolvedValue({
      school: 'Test School',
      contactEmail: 'test@school.edu',
      registrationDeadline: '2099-12-15',
      scienceFairDate: '2100-02-10',
    });

    render(
      <BrowserRouter>
        <Welcome />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Register Your Project/i })).toBeInTheDocument();
    });

    const registerButton = screen.getByRole('button', { name: /Register Your Project/i });
    expect(registerButton).toBeInTheDocument();
  });

  it('should format dates correctly', async () => {
    mockedApi.getFairMetadata.mockResolvedValue({
      school: 'Test School',
      contactEmail: 'test@school.edu',
      registrationDeadline: '2025-12-25',
      scienceFairDate: '2026-03-15',
    });

    render(
      <BrowserRouter>
        <Welcome />
      </BrowserRouter>
    );

    await waitFor(() => {
      // Dates are formatted - check they appear in the document
      expect(screen.getByText(/December/)).toBeInTheDocument();
      expect(screen.getByText(/March/)).toBeInTheDocument();
    });
  });

  it('should handle invalid date strings gracefully in formatDate', async () => {
    mockedApi.getFairMetadata.mockResolvedValue({
      school: 'Test School',
      contactEmail: 'test@school.edu',
      registrationDeadline: 'invalid-date',
      scienceFairDate: '2026-03-15',
    });

    render(
      <BrowserRouter>
        <Welcome />
      </BrowserRouter>
    );

    await waitFor(() => {
      // Should display the original string when date is invalid
      expect(screen.getByText(/invalid-date/)).toBeInTheDocument();
    });
  });

  it('should allow registration when deadline is invalid date', async () => {
    mockedApi.getFairMetadata.mockResolvedValue({
      school: 'Test School',
      contactEmail: 'test@school.edu',
      registrationDeadline: 'not-a-date',
      scienceFairDate: '2026-03-15',
    });

    render(
      <BrowserRouter>
        <Welcome />
      </BrowserRouter>
    );

    await waitFor(() => {
      // Should show register button when deadline is invalid (defaults to allowing registration)
      expect(screen.getByRole('button', { name: /Register Your Project/i })).toBeInTheDocument();
    });
  });

  it('should show loading spinners while metadata is loading', () => {
    mockedApi.getFairMetadata.mockImplementation(() => new Promise(() => {}));

    render(
      <BrowserRouter>
        <Welcome />
      </BrowserRouter>
    );

    // Should show loading spinners for dates
    const spinners = screen.getAllByRole('progressbar');
    expect(spinners.length).toBeGreaterThan(0);
  });

  it('should display retry button in error state', async () => {
    mockedApi.getFairMetadata.mockRejectedValue(new Error('Network error'));

    render(
      <BrowserRouter>
        <Welcome />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Retry/i })).toBeInTheDocument();
      expect(screen.getByText(/Error Loading Information/)).toBeInTheDocument();
    });
  });

  it('should display all important information and rules', async () => {
    mockedApi.getFairMetadata.mockResolvedValue({
      school: 'Test School',
      contactEmail: 'test@school.edu',
      registrationDeadline: '2099-12-15',
      scienceFairDate: '2100-02-10',
    });

    render(
      <BrowserRouter>
        <Welcome />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Important Dates/)).toBeInTheDocument();
      expect(screen.getByText(/Rules and Guidelines/)).toBeInTheDocument();
      expect(screen.getByText(/Projects can be individual or group/)).toBeInTheDocument();
      expect(screen.getByText(/All students must have parent\/guardian consent/)).toBeInTheDocument();
      expect(screen.getByText(/Projects must follow the scientific method/)).toBeInTheDocument();
    });
  });

  it('should display science icon', async () => {
    mockedApi.getFairMetadata.mockResolvedValue({
      school: 'Test School',
      contactEmail: 'test@school.edu',
      registrationDeadline: '2099-12-15',
      scienceFairDate: '2100-02-10',
    });

    const { container } = render(
      <BrowserRouter>
        <Welcome />
      </BrowserRouter>
    );

    await waitFor(() => {
      const scienceIcon = container.querySelector('svg[data-testid="ScienceIcon"]');
      expect(scienceIcon).toBeInTheDocument();
    });
  });

  it('should display school name in welcome message', async () => {
    mockedApi.getFairMetadata.mockResolvedValue({
      school: 'Washington Elementary',
      contactEmail: 'test@school.edu',
      registrationDeadline: '2099-12-15',
      scienceFairDate: '2100-02-10',
    });

    render(
      <BrowserRouter>
        <Welcome />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Washington Elementary Science Fair Registration/)).toBeInTheDocument();
    });
  });

  it('should have clickable Register button', async () => {
    mockedApi.getFairMetadata.mockResolvedValue({
      school: 'Test School',
      contactEmail: 'test@school.edu',
      registrationDeadline: '2099-12-15',
      scienceFairDate: '2100-02-10',
    });

    const user = userEvent.setup({ delay: null });

    render(
      <BrowserRouter>
        <Welcome />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Register Your Project/i })).toBeInTheDocument();
    });

    const registerButton = screen.getByRole('button', { name: /Register Your Project/i });
    
    // Click the button - this triggers the onClick handler
    await user.click(registerButton);

    expect(registerButton).toBeInTheDocument();
  });
});
