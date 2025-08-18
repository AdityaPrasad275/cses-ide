import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import App from './App';

describe('App Component Routing', () => {
  it('should render the landing page content for the root route', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByText('Problem List')).toBeInTheDocument();
    expect(screen.getByText('Select a problem from the sidebar to begin.')).toBeInTheDocument();
  });

  it('should render the problem view for a problem route', async () => {
    render(
      <MemoryRouter initialEntries={['/problems/some-problem']}>
        <App />
      </MemoryRouter>
    );
    // The ProblemView component shows "Loading problem..." initially
    expect(await screen.findByText('Loading problem...')).toBeInTheDocument();
  });
});
