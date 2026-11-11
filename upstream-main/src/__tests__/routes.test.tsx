/**
 * Router Tests - Verify route aliases and navigation
 */

import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from 'next-themes';
import App from '../App';

// Mock components to avoid dependency issues in tests
vi.mock('@/components/Layout', () => ({
  Layout: ({ children }: { children: React.ReactNode }) => <div data-testid="layout">{children}</div>
}));

vi.mock('@/pages/GlobalCourt', () => ({
  default: () => <div data-testid="global-court">Global Court Page</div>
}));

vi.mock('@/pages/Intake', () => ({
  default: () => <div data-testid="intake">Intake Page</div>
}));

vi.mock('@/pages/court/CourtDashboard', () => ({
  default: () => <div data-testid="court-dashboard">Court Dashboard</div>
}));

vi.mock('@/hooks/useAuth', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
  useAuth: () => ({ user: null, loading: false })
}));

vi.mock('@/providers/QueryProvider', () => ({
  QueryProvider: ({ children }: { children: React.ReactNode }) => children
}));

const renderWithRouter = (initialPath: string) => {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <ThemeProvider attribute="class" defaultTheme="light">
        <App />
      </ThemeProvider>
    </MemoryRouter>
  );
};

describe('Router Configuration', () => {
  it('renders GlobalCourt at root path', () => {
    const { getByTestId } = renderWithRouter('/');
    expect(getByTestId('global-court')).toBeInTheDocument();
  });

  it('renders GlobalCourt at /global-court alias', () => {
    const { getByTestId } = renderWithRouter('/global-court');
    expect(getByTestId('global-court')).toBeInTheDocument();
  });

  it('renders Intake at /intake path', () => {
    const { getByTestId } = renderWithRouter('/intake');
    expect(getByTestId('intake')).toBeInTheDocument();
  });
});