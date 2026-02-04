import { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { MetadataProvider } from '../src/contexts/MetadataContext';

// Mock the API module before importing anything that uses it
jest.mock('../src/services/api');

/* eslint-disable react-refresh/only-export-components */

interface AllTheProvidersProps {
  children: React.ReactNode;
}

const AllTheProviders = ({ children }: AllTheProvidersProps) => {
  return (
    <BrowserRouter>
      <MetadataProvider>
        {children}
      </MetadataProvider>
    </BrowserRouter>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { wrapper: AllTheProviders, ...options });

export * from '@testing-library/react';
export { customRender as render };
/* eslint-enable react-refresh/only-export-components */
