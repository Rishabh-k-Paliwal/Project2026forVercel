const Booking = require('../models/Booking');
const Product = require('../models/Product');
const User = require('../models/User');
const crypto = require('crypto');
const razorpay = require('../config/payment');
const { sendBookingNotification } = require('../services/notificationService');

const createReceiptNumber = (bookingId, receiptDate = new Date()) => {
  const datePart = receiptDate.toISOString().slice(0, 10).replace(/-/g, '');
  const bookingPart = bookingId.toString().slice(-6).toUpperCase();
  return `RCT-${datePart}-${bookingPart}`;
};

const ensureReceiptForBooking = (booking, paymentTransactionId = null) => {
  if (paymentTransactionId) {
    booking.paymentTransactionId = paymentTransactionId;
  }

  if (!booking.receiptNumber) {
    booking.receiptNumber = createReceiptNumber(booking._id);
  }

  if (!booking.receiptGeneratedAt) {
    booking.receiptGeneratedAt = new Date();
  }
};

const toReceiptPayload = (booking) => ({
  bookingId: booking._id,
  receiptNumber: booking.receiptNumber,
  receiptGeneratedAt: booking.receiptGeneratedAt,
  paymentTransactionId: booking.paymentTransactionId || null,
  amount: booking.totalPrice,
});

const findDateConflict = async ({ productId, startDate, endDate, excludeBookingId = null }) => {
  const query = {
    product: productId,
    status: { $in: ['pending', 'confirmed', 'active', 'completed'] },
    startDate: { $lt: new Date(endDate) },
    endDate: { $gt: new Date(startDate) },
  };

  if (excludeBookingId) {
    query._id = { $ne: excludeBookingId };
  }

  return Booking.findOne(query);
};

// @desc    Create new booking
// @route   POST /api/bookings
// @access  Private
const createBooking = async (req, res) => {
  try {
    const { productId, startDate, endDate, location } = req.body;
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    if (!product.availability) {
      return res.status(400).json({ success: false, error: 'Product is not available' });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));

    if (days <= 0) {
      return res.status(400).json({ success: false, error: 'End date must be after start date' });
    }

    const conflict = await findDateConflict({ productId, startDate, endDate });
    if (conflict) {
      return res.status(409).json({
        success: false,
        error: 'This product is already booked for the selected date range',
      });
    }

    const totalPrice = days * product.pricePerDay;

    const booking = await Booking.create({
      product: productId,
      user: req.user.id,
      startDate,
      endDate,
      totalPrice,
      location,
      status: 'pending',
    });

    const order = await razorpay.orders.create({
      amount: totalPrice * 100,
      currency: 'INR',
      receipt: `booking_${booking._id}`,
      notes: {
        bookingId: booking._id.toString(),
        userId: req.user.id,
      },
    });

    booking.paymentId = order.id;
    await booking.save();
    await sendBookingNotification(booking, req.user, 'created');

    res.status(201).json({
      success: true,
      data: booking,
      order,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Confirm payment from client and verify with signature
// @route   POST /api/bookings/confirm
// @access  Private
const confirmPayment = async (req, res) => {
  try {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature, bookingId } = req.body;

    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      return res.status(400).json({ success: false, error: 'Missing payment details' });
    }

    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, error: 'Invalid payment signature' });
    }

    const booking = bookingId
      ? await Booking.findById(bookingId)
      : await Booking.findOne({ paymentId: razorpay_order_id });

    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking not found' });
    }

    if (booking.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Not authorized to confirm this booking' });
    }

    booking.status = 'confirmed';
    booking.paymentStatus = 'completed';
    ensureReceiptForBooking(booking, razorpay_payment_id);
    await booking.save();

    const user = await User.findById(booking.user).select('name email phone');
    await sendBookingNotification(booking, user, 'confirmed');

    res.json({
      success: true,
      data: booking,
      receipt: toReceiptPayload(booking),
    });
  } catch (error) {
    console.error('Confirm payment error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get user bookings
// @route   GET /api/bookings/my-bookings
// @access  Private
const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user.id }).populate('product').sort({ createdAt: -1 });
    res.json({ success: true, data: bookings });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get single booking
// @route   GET /api/bookings/:id
// @access  Private
const getBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('product').populate('user', 'name email phone');

    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking not found' });
    }

    if (booking.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Not authorized to view this booking' });
    }

    res.json({ success: true, data: booking });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get booking receipt
// @route   GET /api/bookings/:id/receipt
// @access  Private
const getBookingReceipt = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('product').populate('user', 'name email phone');

    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking not found' });
    }

    const bookingUserId = booking.user._id ? booking.user._id.toString() : booking.user.toString();
    if (bookingUserId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Not authorized to view this receipt' });
    }

    if (booking.paymentStatus !== 'completed') {
      return res.status(400).json({ success: false, error: 'Receipt is available only after completed payment' });
    }

    ensureReceiptForBooking(booking);
    await booking.save();

    res.json({
      success: true,
      data: booking,
      receipt: toReceiptPayload(booking),
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Update booking
// @route   PUT /api/bookings/:id
// @access  Private
const updateBooking = async (req, res) => {
  try {
    let booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking not found' });
    }

    if (booking.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Not authorized to update this booking' });
    }

    if (['confirmed', 'active', 'completed'].includes(booking.status)) {
      return res.status(400).json({ success: false, error: 'Cannot update booking in current status' });
    }

    const startDate = req.body.startDate || booking.startDate;
    const endDate = req.body.endDate || booking.endDate;

    if (new Date(endDate) <= new Date(startDate)) {
      return res.status(400).json({ success: false, error: 'End date must be after start date' });
    }

    const conflict = await findDateConflict({
      productId: booking.product,
      startDate,
      endDate,
      excludeBookingId: booking._id,
    });

    if (conflict) {
      return res.status(409).json({
        success: false,
        error: 'Selected dates overlap with another booking for this product',
      });
    }

    const product = await Product.findById(booking.product);
    const days = Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24));
    const totalPrice = days * product.pricePerDay;

    booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { ...req.body, startDate, endDate, totalPrice },
      { new: true, runValidators: true }
    );

    await sendBookingNotification(booking, req.user, 'updated');
    res.json({ success: true, data: booking });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Complete booking
// @route   PATCH /api/bookings/:id/complete
// @access  Private
const completeBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking not found' });
    }

    if (booking.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Not authorized to complete this booking' });
    }

    if (booking.status === 'completed') {
      return res.status(400).json({ success: false, error: 'Booking is already completed' });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({ success: false, error: 'Cancelled booking cannot be completed' });
    }

    booking.status = 'completed';
    await booking.save();

    res.json({
      success: true,
      data: booking,
      message: 'Booking marked as completed',
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Cancel booking
// @route   DELETE /api/bookings/:id
// @access  Private
const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking not found' });
    }

    if (booking.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Not authorized to cancel this booking' });
    }

    booking.status = 'cancelled';
    await booking.save();
    await sendBookingNotification(booking, req.user, 'cancelled');

    res.json({
      success: true,
      data: booking,
      message: 'Booking cancelled successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Payment webhook handler
// @route   POST /api/bookings/payment-webhook
// @access  Public
const paymentWebhook = async (req, res) => {
  try {
    const { event, payload } = req.body;

    if (event === 'payment.captured') {
      const paymentEntity = payload?.payment?.entity;
      const bookingId = paymentEntity?.notes?.bookingId;
      const booking = await Booking.findById(bookingId);

      if (booking) {
        booking.status = 'confirmed';
        booking.paymentStatus = 'completed';
        ensureReceiptForBooking(booking, paymentEntity?.id || null);
        await booking.save();
        await sendBookingNotification(booking, null, 'confirmed');
      }
    }

    res.json({ status: 'ok' });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  createBooking,
  getMyBookings,
  getBooking,
  getBookingReceipt,
  updateBooking,
  completeBooking,
  cancelBooking,
  paymentWebhook,
  confirmPayment,
};
