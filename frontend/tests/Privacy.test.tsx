import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
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
      <BrowserRouter>
        <Privacy />
      </BrowserRouter>
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
      <BrowserRouter>
        <Privacy />
      </BrowserRouter>
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
      <BrowserRouter>
        <Privacy />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/privacy@school.edu/)).toBeInTheDocument();
    });
  });

  it('should display contact unavailable message when metadata fails to load', async () => {
    mockedApi.getFairMetadata.mockRejectedValue(new Error('Failed to load'));

    render(
      <BrowserRouter>
        <Privacy />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Contact information unavailable')).toBeInTheDocument();
    });
  });

  it('should render all privacy policy sections', () => {
    mockedApi.getFairMetadata.mockResolvedValue({
      school: 'Test School',
      contactEmail: 'test@school.edu',
      registrationDeadline: '2025-12-15',
      scienceFairDate: '2026-02-10',
    });

    render(
      <BrowserRouter>
        <Privacy />
      </BrowserRouter>
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
      <BrowserRouter>
        <Privacy />
      </BrowserRouter>
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
      <BrowserRouter>
        <Privacy />
      </BrowserRouter>
    );

    const returnButton = screen.getByRole('button', { name: /Return to Home/i });
    
    // Click the button - this triggers the onClick handler
    await user.click(returnButton);

    // The button should still be present after click (verifies it's clickable)
    expect(returnButton).toBeInTheDocument();
  });
});
