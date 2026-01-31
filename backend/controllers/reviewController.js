const mongoose = require('mongoose');
const Review = require('../models/Review');
const Product = require('../models/Product');
const Booking = require('../models/Booking');

// @desc    Add a review for a product (only users who completed a booking)
// @route   POST /api/products/:id/reviews
// @access  Private
const addReview = async (req, res) => {
  try {
    const productId = req.params.id;
    const { rating, comment } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    // Ensure user has a completed booking for this product
    const completedBooking = await Booking.findOne({
      product: productId,
      user: req.user.id,
      status: 'completed',
    });

    if (!completedBooking) {
      return res.status(403).json({
        success: false,
        error: 'Only users who completed a booking for this product can leave a review',
      });
    }

    // Prevent duplicate reviews from same user for same product
    const existing = await Review.findOne({ product: productId, user: req.user.id });
    if (existing) {
      return res.status(400).json({ success: false, error: 'You have already reviewed this product' });
    }

    const review = await Review.create({
      product: productId,
      user: req.user.id,
      rating,
      comment,
    });

    // Recalculate product stats
    const agg = await Review.aggregate([
      { $match: { product: product._id } },
      { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } },
    ]);

    if (agg.length > 0) {
      product.averageRating = Number(agg[0].avg.toFixed(2));
      product.reviewsCount = agg[0].count;
      await product.save();
    }

    res.status(201).json({ success: true, data: review });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get reviews for a product
// @route   GET /api/products/:id/reviews
// @access  Public
const getReviews = async (req, res) => {
  try {
    const productId = req.params.id;
    const { page = 1, limit = 10 } = req.query;

    const reviews = await Review.find({ product: productId })
      .populate('user', 'name')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await Review.countDocuments({ product: productId });

    res.json({ success: true, data: reviews, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  addReview,
  getReviews,
};
