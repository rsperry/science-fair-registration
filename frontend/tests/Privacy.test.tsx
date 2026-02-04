import { render, screen, waitFor } from './testUtils';
import Privacy from '../src/pages/Privacy';
import * as api from '../src/services/api';
import userEvent from '@testing-library/user-event';

jest.mock('../src/services/api');
const mockedApi = api as jest.Mocked<typeof api>;

describe('Privacy Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render privacy policy title', () => {
    mockedApi.getFairMetadata.mockResolvedValue({
      school: 'Test School',
      contactEmail: 'test@school.edu',
      registrationDeadline: '2025-12-15',
      scienceFairDate: '2026-02-10',
    });

    render(

        <Privacy />

    );

    expect(screen.getByText('Privacy Policy')).toBeInTheDocument();
  });

  it('should display school name after loading metadata', async () => {
    mockedApi.getFairMetadata.mockResolvedValue({
      school: 'Lincoln Elementary',
      contactEmail: 'privacy@lincoln.edu',
      registrationDeadline: '2025-12-15',
      scienceFairDate: '2026-02-10',
    });

    render(

        <Privacy />

    );

    await waitFor(() => {
      expect(screen.getByText(/Lincoln Elementary/)).toBeInTheDocument();
    });
  });

  it('should display contact email after loading metadata', async () => {
    mockedApi.getFairMetadata.mockResolvedValue({
      school: 'Test School',
      contactEmail: 'privacy@school.edu',
      registrationDeadline: '2025-12-15',
      scienceFairDate: '2026-02-10',
    });

    render(

        <Privacy />

    );

    await waitFor(() => {
      expect(screen.getByText(/privacy@school.edu/)).toBeInTheDocument();
    });
  });

  it('should display contact unavailable message when metadata fails to load', async () => {
    jest.useFakeTimers();
    mockedApi.getFairMetadata.mockRejectedValue(new Error('Failed to load'));

    render(

        <Privacy />

    );

    // Fast-forward through all retries
    await jest.runAllTimersAsync();

    await waitFor(() => {
      expect(screen.getByText('Contact information unavailable')).toBeInTheDocument();
    });

    jest.useRealTimers();
  });

  it('should render all privacy policy sections', () => {
    mockedApi.getFairMetadata.mockResolvedValue({
      school: 'Test School',
      contactEmail: 'test@school.edu',
      registrationDeadline: '2025-12-15',
      scienceFairDate: '2026-02-10',
    });

    render(

        <Privacy />

    );

    expect(screen.getByText('Information We Collect')).toBeInTheDocument();
    expect(screen.getByText('How We Use Your Information')).toBeInTheDocument();
    expect(screen.getByText('Data Security')).toBeInTheDocument();
    expect(screen.getByText('Your Rights')).toBeInTheDocument();
  });

  it('should have a back link to home', () => {
    mockedApi.getFairMetadata.mockResolvedValue({
      school: 'Test School',
      contactEmail: 'test@school.edu',
      registrationDeadline: '2025-12-15',
      scienceFairDate: '2026-02-10',
    });

    render(

        <Privacy />

    );

    const backButton = screen.getByRole('button', { name: /Return to Home/i });
    expect(backButton).toBeInTheDocument();
  });

  it('should have clickable Return to Home button', async () => {
    mockedApi.getFairMetadata.mockResolvedValue({
      school: 'Test School',
      contactEmail: 'test@school.edu',
      registrationDeadline: '2025-12-15',
      scienceFairDate: '2026-02-10',
    });

    const user = userEvent.setup({ delay: null });

    render(

        <Privacy />

    );

    const returnButton = screen.getByRole('button', { name: /Return to Home/i });
    
    // Click the button - this triggers the onClick handler
    await user.click(returnButton);

    // The button should still be present after click (verifies it's clickable)
    expect(returnButton).toBeInTheDocument();
  });
});
