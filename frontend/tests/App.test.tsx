import { render, screen } from '@testing-library/react';
import App from '../src/App';

// Mock the pages
jest.mock('../src/pages/Welcome', () => {
  return function MockWelcome() {
    return <div>Welcome Page</div>;
  };
});

jest.mock('../src/pages/Register', () => {
  return function MockRegister() {
    return <div>Register Page</div>;
  };
});

jest.mock('../src/pages/Confirmation', () => {
  return function MockConfirmation() {
    return <div>Confirmation Page</div>;
  };
});

jest.mock('../src/pages/Privacy', () => {
  return function MockPrivacy() {
    return <div>Privacy Page</div>;
  };
});

jest.mock('../src/components/Footer', () => {
  return function MockFooter() {
    return <div>Footer</div>;
  };
});

describe('App Component', () => {
  it('should render without crashing', () => {
    render(<App />);
    expect(screen.getByText('Footer')).toBeInTheDocument();
  });

  it('should render Welcome page at root path', () => {
    render(<App />);
    expect(screen.getByText('Welcome Page')).toBeInTheDocument();
  });

  it('should include Footer on all pages', () => {
    render(<App />);
    expect(screen.getByText('Footer')).toBeInTheDocument();
  });
});
