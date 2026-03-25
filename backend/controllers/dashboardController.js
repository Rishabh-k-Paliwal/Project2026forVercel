const Booking = require('../models/Booking');
const Product = require('../models/Product');
const { autoCancelExpiredPendingBookings } = require('../services/bookingExpiryService');

// @desc    Get user dashboard data
// @route   GET /api/dashboard
// @access  Private
const getDashboard = async (req, res) => {
  try {
    await autoCancelExpiredPendingBookings();

    // Get user's bookings
    const myBookings = await Booking.find({ user: req.user.id })
      .populate('product')
      .sort({ createdAt: -1 });

    // Get user's listings
    const myListings = await Product.find({ owner: req.user.id }).sort({
      createdAt: -1,
    });

    // Get bookings for user's products
    const listingIds = myListings.map((listing) => listing._id);
    const bookingsOnMyListings = await Booking.find({
      product: { $in: listingIds },
    })
      .populate('product')
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 });

    // Calculate statistics
    const stats = {
      totalBookings: myBookings.length,
      totalListings: myListings.length,
      activeBookings: myBookings.filter((b) => b.status === 'active').length,
      pendingBookings: myBookings.filter((b) => b.status === 'pending').length,
      completedBookings: myBookings.filter((b) => b.status === 'completed').length,
      totalEarnings: bookingsOnMyListings
        .filter((b) => b.status === 'completed')
        .reduce((sum, b) => sum + b.totalPrice, 0),
      pendingEarnings: bookingsOnMyListings
        .filter((b) => ['pending', 'confirmed', 'active'].includes(b.status))
        .reduce((sum, b) => sum + b.totalPrice, 0),
    };

    res.json({
      success: true,
      data: {
        myBookings,
        myListings,
        bookingsOnMyListings,
        stats,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

module.exports = {
  getDashboard,
};
