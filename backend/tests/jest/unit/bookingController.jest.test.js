const Booking = require('../../../models/Booking');
const Product = require('../../../models/Product');
const razorpay = require('../../../config/payment');
const {
  createBooking,
  updateBooking,
  completeBooking,
} = require('../../../controllers/bookingController');

const createRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('bookingController (Jest)', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  test('rejects create booking when date range overlaps existing booking', async () => {
    jest.spyOn(Product, 'findById').mockResolvedValue({
      _id: 'p1',
      availability: true,
      pricePerDay: 100,
    });
    jest.spyOn(Booking, 'findOne').mockResolvedValue({ _id: 'conflict_booking' });

    const req = {
      body: {
        productId: 'p1',
        startDate: '2026-03-10',
        endDate: '2026-03-12',
        location: { address: 'Test' },
      },
      user: { id: 'u1' },
    };
    const res = createRes();

    await createBooking(req, res);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
      })
    );
  });

  test('rejects update booking when new date range overlaps another booking', async () => {
    jest.spyOn(Booking, 'findById').mockResolvedValue({
      _id: 'b1',
      product: 'p1',
      user: 'u1',
      status: 'pending',
    });
    jest.spyOn(Booking, 'findOne').mockResolvedValue({ _id: 'b2' });

    const req = {
      params: { id: 'b1' },
      body: {
        startDate: '2026-04-10',
        endDate: '2026-04-15',
      },
      user: { id: 'u1', role: 'user' },
    };
    const res = createRes();

    await updateBooking(req, res);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
      })
    );
  });

  test('marks booking as completed when user is authorized', async () => {
    const save = jest.fn().mockResolvedValue(true);
    const bookingDoc = {
      _id: 'b1',
      user: { toString: () => 'u1' },
      status: 'confirmed',
      save,
    };

    jest.spyOn(Booking, 'findById').mockResolvedValue(bookingDoc);

    const req = {
      params: { id: 'b1' },
      user: { id: 'u1', role: 'user' },
    };
    const res = createRes();

    await completeBooking(req, res);

    expect(bookingDoc.status).toBe('completed');
    expect(save).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
      })
    );
  });

  test('creates booking successfully when dates are available', async () => {
    const bookingDoc = {
      _id: 'b_new',
      paymentId: '',
      save: jest.fn().mockResolvedValue(true),
    };

    jest.spyOn(Product, 'findById').mockResolvedValue({
      _id: 'p1',
      availability: true,
      pricePerDay: 150,
    });
    jest.spyOn(Booking, 'findOne').mockResolvedValue(null);
    jest.spyOn(Booking, 'create').mockResolvedValue(bookingDoc);
    jest.spyOn(razorpay.orders, 'create').mockResolvedValue({
      id: 'order_123',
      amount: 30000,
      currency: 'INR',
    });

    const req = {
      body: {
        productId: 'p1',
        startDate: '2026-05-01',
        endDate: '2026-05-03',
        location: { address: 'Test address', coordinates: [77.1, 28.6] },
      },
      user: { id: 'u1' },
    };
    const res = createRes();

    await createBooking(req, res);

    expect(Booking.create).toHaveBeenCalled();
    expect(razorpay.orders.create).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
      })
    );
  });
});
