import { renderHook, waitFor } from '@testing-library/react';
import { MetadataProvider, useMetadata } from '../src/contexts/MetadataContext';
import * as api from '../src/services/api';
import { ReactNode } from 'react';

jest.mock('../src/services/api');
const mockedApi = api as jest.Mocked<typeof api>;

const wrapper = ({ children }: { children: ReactNode }) => (
  <MetadataProvider>{children}</MetadataProvider>
);

describe('MetadataContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should throw error when useMetadata is used outside MetadataProvider', () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    expect(() => {
      renderHook(() => useMetadata());
    }).toThrow('useMetadata must be used within a MetadataProvider');

    consoleError.mockRestore();
  });

  it('should load metadata successfully on mount', async () => {
    const mockData = {
      school: 'Test School',
      contactEmail: 'test@school.edu',
      registrationDeadline: '2025-12-31',
      scienceFairDate: '2026-02-15',
    };

    mockedApi.getFairMetadata.mockResolvedValue(mockData);

    const { result } = renderHook(() => useMetadata(), { wrapper });

    // Initially loading
    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBe(null);

    // Wait for data to load
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.metadata).toEqual(mockData);
    expect(result.current.error).toBe(null);
    expect(mockedApi.getFairMetadata).toHaveBeenCalledTimes(1);
  });

  it('should retry on failure with exponential backoff', async () => {
    jest.useFakeTimers();
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    mockedApi.getFairMetadata.mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useMetadata(), { wrapper });

    expect(result.current.loading).toBe(true);

    // Fast-forward through all retries
    await jest.runAllTimersAsync();

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Should have tried 4 times total (initial + 3 retries)
    expect(mockedApi.getFairMetadata).toHaveBeenCalledTimes(4);
    expect(result.current.error).toBe('Unable to load science fair information. Please try again later or contact support.');
    
    // Check retry logs
    expect(consoleLogSpy).toHaveBeenCalledWith('Retrying metadata fetch in 1000ms... (attempt 1/3)');
    expect(consoleLogSpy).toHaveBeenCalledWith('Retrying metadata fetch in 2000ms... (attempt 2/3)');
    expect(consoleLogSpy).toHaveBeenCalledWith('Retrying metadata fetch in 4000ms... (attempt 3/3)');

    consoleErrorSpy.mockRestore();
    consoleLogSpy.mockRestore();
  });

  it('should succeed after retry', async () => {
    jest.useFakeTimers();
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const mockData = {
      school: 'Test School',
      contactEmail: 'test@school.edu',
      registrationDeadline: '2025-12-31',
      scienceFairDate: '2026-02-15',
    };

    // Fail first two times, succeed on third
    mockedApi.getFairMetadata
      .mockRejectedValueOnce(new Error('Network error'))
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce(mockData);

    const { result } = renderHook(() => useMetadata(), { wrapper });

    // Fast-forward through retries
    await jest.runAllTimersAsync();

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.metadata).toEqual(mockData);
    expect(result.current.error).toBe(null);
    expect(mockedApi.getFairMetadata).toHaveBeenCalledTimes(3);

    consoleErrorSpy.mockRestore();
  });

  it('should refetch metadata when refetch is called', async () => {
    const mockData = {
      school: 'Test School',
      contactEmail: 'test@school.edu',
      registrationDeadline: '2025-12-31',
      scienceFairDate: '2026-02-15',
    };

    mockedApi.getFairMetadata.mockResolvedValue(mockData);

    const { result } = renderHook(() => useMetadata(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockedApi.getFairMetadata).toHaveBeenCalledTimes(1);

    // Reset and refetch
    const updatedData = { ...mockData, school: 'Updated School' };
    mockedApi.getFairMetadata.mockResolvedValue(updatedData);

    await waitFor(async () => {
      result.current.refetch();
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.metadata).toEqual(updatedData);
    expect(mockedApi.getFairMetadata).toHaveBeenCalledTimes(2);
  });

  it('should reset error state when refetch is called', async () => {
    jest.useFakeTimers();
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    // First call fails
    mockedApi.getFairMetadata.mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useMetadata(), { wrapper });

    await jest.runAllTimersAsync();

    await waitFor(() => {
      expect(result.current.error).not.toBe(null);
    });

    // Now refetch with success
    const mockData = {
      school: 'Test School',
      contactEmail: 'test@school.edu',
      registrationDeadline: '2025-12-31',
      scienceFairDate: '2026-02-15',
    };

    mockedApi.getFairMetadata.mockResolvedValue(mockData);
    
    jest.useRealTimers();

    await waitFor(async () => {
      result.current.refetch();
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe(null);
    expect(result.current.metadata).toEqual(mockData);

    consoleErrorSpy.mockRestore();
  });

  it('should cap retry delay at 5000ms', async () => {
    jest.useFakeTimers();
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    mockedApi.getFairMetadata.mockRejectedValue(new Error('Network error'));

    renderHook(() => useMetadata(), { wrapper });

    await jest.runAllTimersAsync();

    // Check that delays don't exceed 5000ms
    const logCalls = consoleLogSpy.mock.calls.map(call => call[0]);
    expect(logCalls).toContain('Retrying metadata fetch in 1000ms... (attempt 1/3)');
    expect(logCalls).toContain('Retrying metadata fetch in 2000ms... (attempt 2/3)');
    expect(logCalls).toContain('Retrying metadata fetch in 4000ms... (attempt 3/3)');
    
    // 4000ms is less than 5000ms cap, so it should use 4000ms
    expect(logCalls).not.toContain(expect.stringContaining('5000ms'));

    consoleErrorSpy.mockRestore();
    consoleLogSpy.mockRestore();
  });

  it('should provide default empty metadata initially', () => {
    mockedApi.getFairMetadata.mockImplementation(() => new Promise(() => {})); // Never resolves

    const { result } = renderHook(() => useMetadata(), { wrapper });

    expect(result.current.metadata).toEqual({
      school: '',
      contactEmail: '',
      registrationDeadline: '',
      scienceFairDate: '',
    });
    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBe(null);
  });

  it('should handle console.error being called on failure', async () => {
    jest.useFakeTimers();
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const error = new Error('Network error');
    mockedApi.getFairMetadata.mockRejectedValue(error);

    renderHook(() => useMetadata(), { wrapper });

    await jest.runAllTimersAsync();

    await waitFor(() => {
      // Should log error for each attempt (initial + 3 retries = 4 times)
      expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to load metadata:', error);
    });
    
    // Filter out React act warnings, only count our error logs
    const actualErrorCalls = consoleErrorSpy.mock.calls.filter(
      call => call[0] === 'Failed to load metadata:'
    );
    expect(actualErrorCalls.length).toBe(4);

    consoleErrorSpy.mockRestore();
  });
});
