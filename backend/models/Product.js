const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide product name'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please provide product description'],
    },
    images: [
      {
        type: String,
      },
    ],
    pricePerDay: {
      type: Number,
      required: [true, 'Please provide price per day'],
      min: 0,
    },
    category: {
      type: String,
      required: [true, 'Please provide category'],
      enum: [
        'laptops',
        'cameras',
        'audio',
        'gaming',
        'smartphones',
        'tablets',
        'accessories',
        'other',
      ],
    },
    specs: {
      type: Map,
      of: String,
    },
    availability: {
      type: Boolean,
      default: true,
    },
    averageRating: {
      type: Number,
      default: 0,
    },
    reviewsCount: {
      type: Number,
      default: 0,
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number],
        required: true,
      },
      address: {
        type: String,
        required: true,
      },
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create geospatial index for location-based queries
productSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Product', productSchema);