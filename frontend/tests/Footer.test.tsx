import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Footer from '../src/components/Footer';
import * as api from '../src/services/api';

jest.mock('../src/services/api');
const mockedApi = api as jest.Mocked<typeof api>;

describe('Footer Component', () => {
  it('should render privacy policy link', () => {
    mockedApi.getFairMetadata.mockResolvedValue({
      school: 'Test School',
      contactEmail: 'test@school.edu',
      registrationDeadline: '2025-12-15',
      scienceFairDate: '2026-02-10',
    });

    render(
      <BrowserRouter>
        <Footer />
      </BrowserRouter>
    );

    expect(screen.getByText('Privacy Policy')).toBeInTheDocument();
  });

  it('should display contact email after loading', async () => {
    mockedApi.getFairMetadata.mockResolvedValue({
      school: 'Test School',
      contactEmail: 'contact@school.edu',
      registrationDeadline: '2025-12-15',
      scienceFairDate: '2026-02-10',
    });

    render(
      <BrowserRouter>
        <Footer />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/contact@school.edu/)).toBeInTheDocument();
    });
  });

  it('should display error message when metadata fails to load', async () => {
    mockedApi.getFairMetadata.mockRejectedValue(new Error('Failed to load'));

    render(
      <BrowserRouter>
        <Footer />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Unable to load contact information/)).toBeInTheDocument();
    });
  });

  it('should show loading spinner while fetching metadata', () => {
    // Mock a slow response
    mockedApi.getFairMetadata.mockImplementation(() => new Promise(() => {}));

    render(
      <BrowserRouter>
        <Footer />
      </BrowserRouter>
    );

    // Loading spinner should be visible
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('should display full contact message when loading completes', async () => {
    mockedApi.getFairMetadata.mockResolvedValue({
      school: 'Test School',
      contactEmail: 'help@school.edu',
      registrationDeadline: '2025-12-15',
      scienceFairDate: '2026-02-10',
    });

    render(
      <BrowserRouter>
        <Footer />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/For questions or assistance, please contact help@school.edu/)).toBeInTheDocument();
    });
  });
});
