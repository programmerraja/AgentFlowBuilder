import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from './App';

describe('App', () => {
  it('renders welcome message', () => {
    render(<App />);
    expect(screen.getByText('Workflow Builder UI')).toBeInTheDocument();
    expect(
      screen.getByText('Welcome to the Workflow Builder!')
    ).toBeInTheDocument();
  });
});
