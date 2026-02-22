import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import MyBookings from './MyBookings';

const mockComplete = vi.fn();
const mockCancel = vi.fn();
const mockUpdate = vi.fn();
const mockGetByProduct = vi.fn();
const mockUser = { _id: 'u1', name: 'Test User' };

vi.mock('../../services/api', () => ({
  bookingAPI: {
    complete: (...args) => mockComplete(...args),
    cancel: (...args) => mockCancel(...args),
    update: (...args) => mockUpdate(...args),
  },
  reviewAPI: {
    getByProduct: (...args) => mockGetByProduct(...args),
  },
}));

vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    user: mockUser,
  }),
}));

vi.mock('../products/ReviewForm', () => ({
  default: () => <div>Review Form</div>,
}));

describe('MyBookings component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockComplete.mockResolvedValue({ data: { success: true } });
    mockCancel.mockResolvedValue({ data: { success: true } });
    mockUpdate.mockResolvedValue({ data: { success: true } });
    mockGetByProduct.mockResolvedValue({ data: { data: [] } });
    vi.spyOn(window, 'alert').mockImplementation(() => {});
    vi.spyOn(window, 'confirm').mockReturnValue(true);
  });

  it('shows "Mark Completed" for confirmed bookings and calls complete API', async () => {
    const bookings = [
      {
        _id: 'b1',
        status: 'confirmed',
        startDate: '2026-06-01T00:00:00.000Z',
        endDate: '2026-06-03T00:00:00.000Z',
        totalPrice: 1000,
        location: { address: 'Test address' },
        product: { _id: 'p1', name: 'Camera' },
      },
    ];
    const onUpdate = vi.fn();

    render(<MyBookings bookings={bookings} onUpdate={onUpdate} />);

    const completeBtn = await screen.findByText('Mark Completed');
    fireEvent.click(completeBtn);

    await waitFor(() => {
      expect(mockComplete).toHaveBeenCalledWith('b1');
    });
    expect(onUpdate).toHaveBeenCalled();
  });

  it('does not show "Mark Completed" for pending bookings', () => {
    const bookings = [
      {
        _id: 'b2',
        status: 'pending',
        startDate: '2026-06-01T00:00:00.000Z',
        endDate: '2026-06-02T00:00:00.000Z',
        totalPrice: 500,
        location: { address: 'Addr' },
        product: { _id: 'p2', name: 'Laptop' },
      },
    ];

    render(<MyBookings bookings={bookings} onUpdate={vi.fn()} />);

    expect(screen.queryByText('Mark Completed')).toBeNull();
    expect(screen.getByText('Edit Dates')).toBeTruthy();
  });
});
