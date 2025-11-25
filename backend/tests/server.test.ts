/* eslint-disable @typescript-eslint/no-require-imports */
import { Server } from 'http';

// Mock dependencies before importing server
const mockListen = jest.fn((_port: number, callback?: () => void) => {
  if (callback) callback();
  return {} as Server;
});

const mockApp = {
  listen: mockListen,
};

jest.mock('../src/app', () => mockApp);

const mockConfig = {
  port: 4000,
  nodeEnv: 'test',
};

jest.mock('../src/config', () => ({
  config: mockConfig,
}));

// Mock console.log to capture output
const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation();

describe('Server', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    mockConsoleLog.mockRestore();
  });

  it('should start server on configured port', () => {
    // Import server to trigger the listen call
    require('../src/server');

    expect(mockListen).toHaveBeenCalledWith(4000, expect.any(Function));
  });

  it('should log server start message with correct format', () => {
    // Clear previous calls
    mockConsoleLog.mockClear();
    mockListen.mockClear();

    // Re-import to trigger server start
    jest.resetModules();
    jest.mock('../src/app', () => mockApp);
    jest.mock('../src/config', () => ({ config: mockConfig }));
    require('../src/server');

    expect(mockConsoleLog).toHaveBeenCalled();
    const logCall = mockConsoleLog.mock.calls[0][0];
    const logData = JSON.parse(logCall);

    expect(logData).toEqual({
      level: 'info',
      message: 'Server is running on port 4000',
      environment: 'test',
      port: 4000,
    });
  });

  it('should log correct environment from config', () => {
    mockConsoleLog.mockClear();
    mockListen.mockClear();

    // Update config
    mockConfig.nodeEnv = 'production';

    jest.resetModules();
    jest.mock('../src/app', () => mockApp);
    jest.mock('../src/config', () => ({ config: mockConfig }));
    require('../src/server');

    const logCall = mockConsoleLog.mock.calls[0][0];
    const logData = JSON.parse(logCall);

    expect(logData.environment).toBe('production');
  });

  it('should use port from config', () => {
    mockConsoleLog.mockClear();
    mockListen.mockClear();

    // Update port
    mockConfig.port = 8080;

    jest.resetModules();
    jest.mock('../src/app', () => mockApp);
    jest.mock('../src/config', () => ({ config: mockConfig }));
    require('../src/server');

    expect(mockListen).toHaveBeenCalledWith(8080, expect.any(Function));
  });

  it('should log message includes port number', () => {
    mockConsoleLog.mockClear();
    mockListen.mockClear();

    mockConfig.port = 3000;

    jest.resetModules();
    jest.mock('../src/app', () => mockApp);
    jest.mock('../src/config', () => ({ config: mockConfig }));
    require('../src/server');

    const logCall = mockConsoleLog.mock.calls[0][0];
    const logData = JSON.parse(logCall);

    expect(logData.message).toContain('3000');
    expect(logData.port).toBe(3000);
  });
});
