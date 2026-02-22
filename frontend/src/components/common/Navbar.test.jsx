import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import Navbar from './Navbar';

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    Link: ({ to, children, className }) => (
      <a href={to} className={className}>
        {children}
      </a>
    ),
    useNavigate: () => vi.fn(),
  };
});

vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    user: { name: 'Demo User', role: 'user' },
    logout: vi.fn(),
    isAuthenticated: true,
  }),
}));

describe('Navbar', () => {
  it('shows "List New Item" option for authenticated user role', async () => {
    render(<Navbar />);

    const dropdown = document.querySelector('.dropdown-container');
    fireEvent.mouseEnter(dropdown);

    const navItem = await screen.findByText('List New Item');
    expect(navItem).toBeTruthy();
  });
});
