const express = require('express');
const router = express.Router();
const {
  getProducts,
  searchProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
} = require('../controllers/productController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');
const { productValidation, validate, reviewValidation } = require('../utils/validators');
const { addReview, getReviews } = require('../controllers/reviewController');

// Public routes
router.get('/', getProducts);
router.get('/search', searchProducts);

// Reviews (must come before the generic :id route)
router.get('/:id/reviews', getReviews);
router.post('/:id/reviews', protect, reviewValidation, validate, addReview);

// Single product (must be after reviews routes)
router.get('/:id', getProduct);

// Protected routes (owner/admin only)
router.post(
  '/',
  protect,
  authorize('owner', 'admin'),
  productValidation,
  validate,
  createProduct
);

router.put(
  '/:id',
  protect,
  authorize('owner', 'admin'),
  updateProduct
);

router.delete(
  '/:id',
  protect,
  authorize('owner', 'admin'),
  deleteProduct
);

module.exports = router;