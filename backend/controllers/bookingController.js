const Booking = require('../models/Booking');
const Product = require('../models/Product');
const User = require('../models/User');
const crypto = require('crypto');
const razorpay = require('../config/payment');
const { sendBookingNotification } = require('../services/notificationService');

// @desc    Create new booking
// @route   POST /api/bookings
// @access  Private
const createBooking = async (req, res) => {
  try {
    const { productId, startDate, endDate, location } = req.body;

    // Get product
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found',
      });
    }

    if (!product.availability) {
      return res.status(400).json({
        success: false,
        error: 'Product is not available',
      });
    }

    // Calculate total price
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    const totalPrice = days * product.pricePerDay;

    // Create booking
    const booking = await Booking.create({
      product: productId,
      user: req.user.id,
      startDate,
      endDate,
      totalPrice,
      location,
      status: 'pending',
    });

    // Create Razorpay order
    const options = {
      amount: totalPrice * 100, // Amount in paise
      currency: 'INR',
      receipt: `booking_${booking._id}`,
      notes: {
        bookingId: booking._id.toString(),
        userId: req.user.id,
      },
    };

    const order = await razorpay.orders.create(options);

    // Update booking with payment ID
    booking.paymentId = order.id;
    await booking.save();

    // Send notification
    await sendBookingNotification(booking, req.user, 'created');

    res.status(201).json({
      success: true,
      data: booking,
      order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
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

    // Verify signature
    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(razorpay_order_id + '|' + razorpay_payment_id)
      .digest('hex');

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, error: 'Invalid payment signature' });
    }

    // Find booking by ID or by order id if bookingId not provided
    let booking;
    if (bookingId) {
      booking = await Booking.findById(bookingId);
    } else {
      booking = await Booking.findOne({ paymentId: razorpay_order_id });
    }

    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking not found' });
    }

    // Check owner
    if (booking.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Not authorized to confirm this booking' });
    }

    booking.status = 'confirmed';
    booking.paymentStatus = 'completed';
    booking.save();

    // Send confirmation notification
    const user = await User.findById(booking.user).select('name email phone');
    await sendBookingNotification(booking, user, 'confirmed');

    res.json({ success: true, data: booking });
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
    const bookings = await Booking.find({ user: req.user.id })
      .populate('product')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: bookings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// @desc    Get single booking
// @route   GET /api/bookings/:id
// @access  Private
const getBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('product')
      .populate('user', 'name email phone');

    if (!booking) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found',
      });
    }

    // Check authorization
    if (booking.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to view this booking',
      });
    }

    res.json({
      success: true,
      data: booking,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// @desc    Update booking
// @route   PUT /api/bookings/:id
// @access  Private
const updateBooking = async (req, res) => {
  try {
    let booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found',
      });
    }

    // Check authorization
    if (booking.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this booking',
      });
    }

    // Don't allow updating confirmed/active bookings
    if (['confirmed', 'active', 'completed'].includes(booking.status)) {
      return res.status(400).json({
        success: false,
        error: 'Cannot update booking in current status',
      });
    }

    booking = await Booking.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    // Send notification
    await sendBookingNotification(booking, req.user, 'updated');

    res.json({
      success: true,
      data: booking,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// @desc    Cancel booking
// @route   DELETE /api/bookings/:id
// @access  Private
const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found',
      });
    }

    // Check authorization
    if (booking.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to cancel this booking',
      });
    }

    booking.status = 'cancelled';
    await booking.save();

    // Send notification
    await sendBookingNotification(booking, req.user, 'cancelled');

    res.json({
      success: true,
      data: booking,
      message: 'Booking cancelled successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// @desc    Payment webhook handler
// @route   POST /api/bookings/payment-webhook
// @access  Public (called by Razorpay)
const paymentWebhook = async (req, res) => {
  try {
    const { event, payload } = req.body;

    if (event === 'payment.captured') {
      const bookingId = payload.payment.entity.notes.bookingId;

      const booking = await Booking.findById(bookingId);

      if (booking) {
        booking.status = 'confirmed';
        booking.paymentStatus = 'completed';
        await booking.save();

        // Send confirmation notification
        await sendBookingNotification(booking, null, 'confirmed');
      }
    }

    res.json({ status: 'ok' });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

module.exports = {
  createBooking,
  getMyBookings,
  getBooking,
  updateBooking,
  cancelBooking,
  paymentWebhook,
  confirmPayment,
};