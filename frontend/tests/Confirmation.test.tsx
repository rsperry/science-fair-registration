import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import Confirmation from '../src/pages/Confirmation';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('Confirmation Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should redirect to home if no projectId is provided', async () => {
    render(
      <MemoryRouter initialEntries={[{ pathname: '/confirmation', state: null }]}>
        <Confirmation />
      </MemoryRouter>
    );

    jest.runAllTimers();

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  it('should display confirmation details when projectId is provided', () => {
    const mockState = {
      projectId: 12345,
      timestamp: '2025-11-25T12:00:00Z',
    };

    render(
      <MemoryRouter initialEntries={[{ pathname: '/confirmation', state: mockState }]}>
        <Confirmation />
      </MemoryRouter>
    );

    expect(screen.getByText(/Registration Successful!/i)).toBeInTheDocument();
    expect(screen.getByText(/12345/)).toBeInTheDocument();
  });

  it('should format timestamp correctly', () => {
    const mockState = {
      projectId: 12345,
      timestamp: '2025-11-25T12:00:00Z',
    };

    render(
      <MemoryRouter initialEntries={[{ pathname: '/confirmation', state: mockState }]}>
        <Confirmation />
      </MemoryRouter>
    );

    // The timestamp should be formatted
    expect(screen.getByText(/November 25, 2025/i)).toBeInTheDocument();
  });

  it('should display all confirmation information', () => {
    const mockState = {
      projectId: 54321,
      timestamp: '2025-12-01T15:30:00Z',
    };

    render(
      <MemoryRouter initialEntries={[{ pathname: '/confirmation', state: mockState }]}>
        <Confirmation />
      </MemoryRouter>
    );

    expect(screen.getByText(/Registration Successful!/i)).toBeInTheDocument();
    expect(screen.getByText(/54321/)).toBeInTheDocument();
    expect(screen.getByText(/Project ID/i)).toBeInTheDocument();
    expect(screen.getByText(/Registration Date/i)).toBeInTheDocument();
  });

  it('should handle missing timestamp gracefully', () => {
    const mockState = {
      projectId: 12345,
    };

    render(
      <MemoryRouter initialEntries={[{ pathname: '/confirmation', state: mockState }]}>
        <Confirmation />
      </MemoryRouter>
    );

    expect(screen.getByText(/12345/)).toBeInTheDocument();
    expect(screen.getByText(/Registration Successful!/i)).toBeInTheDocument();
  });

  it('should navigate to home when Return to Home button is clicked', async () => {
    const mockState = {
      projectId: 12345,
      timestamp: '2025-11-25T12:00:00Z',
    };

    const user = userEvent.setup({ delay: null });

    render(
      <MemoryRouter initialEntries={[{ pathname: '/confirmation', state: mockState }]}>
        <Confirmation />
      </MemoryRouter>
    );

    const returnButton = screen.getByRole('button', { name: /Return to Home/i });
    await user.click(returnButton);

    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('should display success icon', () => {
    const mockState = {
      projectId: 12345,
      timestamp: '2025-11-25T12:00:00Z',
    };

    const { container } = render(
      <MemoryRouter initialEntries={[{ pathname: '/confirmation', state: mockState }]}>
        <Confirmation />
      </MemoryRouter>
    );

    const successIcon = container.querySelector('svg[data-testid="CheckCircleIcon"]');
    expect(successIcon).toBeInTheDocument();
  });

  it('should display home icon on return button', () => {
    const mockState = {
      projectId: 12345,
      timestamp: '2025-11-25T12:00:00Z',
    };

    const { container } = render(
      <MemoryRouter initialEntries={[{ pathname: '/confirmation', state: mockState }]}>
        <Confirmation />
      </MemoryRouter>
    );

    const homeIcon = container.querySelector('svg[data-testid="HomeIcon"]');
    expect(homeIcon).toBeInTheDocument();
  });

  it('should display confirmation email message', () => {
    const mockState = {
      projectId: 12345,
      timestamp: '2025-11-25T12:00:00Z',
    };

    render(
      <MemoryRouter initialEntries={[{ pathname: '/confirmation', state: mockState }]}>
        <Confirmation />
      </MemoryRouter>
    );

    expect(screen.getByText(/You will receive a confirmation email shortly/i)).toBeInTheDocument();
  });

  it('should return null when no projectId is provided', () => {
    const { container } = render(
      <MemoryRouter initialEntries={[{ pathname: '/confirmation', state: null }]}>
        <Confirmation />
      </MemoryRouter>
    );

    // Should render nothing (null)
    expect(container.firstChild).toBeNull();
  });
});
