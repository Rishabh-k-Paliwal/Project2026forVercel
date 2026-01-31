import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productAPI, bookingAPI, reviewAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import BookingForm from '../booking/BookingForm';
import ReviewsList from './ReviewsList';
import ReviewForm from './ReviewForm';
import './ProductDetail.css';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [mainImage, setMainImage] = useState(null);
  const [canReview, setCanReview] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);
  const [reviewRefreshKey, setReviewRefreshKey] = useState(0);

  const fetchProduct = React.useCallback(async () => {
    try {
      setLoading(true);
      const response = await productAPI.getById(id);
      setProduct(response.data.data);
    } catch (err) {
      setError('Failed to load product details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  useEffect(() => {
    if (product?.images?.length > 0) {
      setMainImage(product.images[0]);
    }
  }, [product]);

  useEffect(() => {
    const checkCanReview = async () => {
      if (!isAuthenticated || !product) {
        setCanReview(false);
        return;
      }

      try {
        // Check user's completed bookings for this product
        const resp = await bookingAPI.getMyBookings();
        const bookings = resp.data.data || [];
        const completed = bookings.find(
          (b) =>
            b.product &&
            ((b.product._id && b.product._id === product._id) ||
              (b.product && b.product.toString && b.product.toString() === product._id)) &&
            b.status === 'completed'
        );

        setCanReview(!!completed);

        // Check if user has already left a review
        const reviewsResp = await reviewAPI.getByProduct(product._id, { page: 1, limit: 100 });
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        const myReview = (reviewsResp.data.data || []).find((r) => r.user && r.user.name === currentUser.name);
        setHasReviewed(!!myReview);
        if (myReview) setCanReview(false);
      } catch (err) {
        console.error('Error checking review eligibility', err);
      }
    };

    checkCanReview();
  }, [isAuthenticated, product, reviewRefreshKey]);

  const onReviewSubmitted = () => {
    setReviewRefreshKey((k) => k + 1);
    setHasReviewed(true);
    setCanReview(false);
  };

  const handleBookNow = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setShowBookingForm(true);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading product...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="error-container">
        <h2>Error</h2>
        <p>{error || 'Product not found'}</p>
        <button onClick={() => navigate('/')} className="btn-primary">
          Back to Products
        </button>
      </div>
    );
  }

  return (
    <div className="product-detail-container">
      <button onClick={() => navigate(-1)} className="btn-back">
        ← Back
      </button>

      <div className="product-detail-grid">
        <div className="product-images">
          {product.images && product.images.length > 0 ? (
            <>
              <img src={mainImage} alt={product.name} className="main-product-image" />

              <div className="thumbnails">
                {product.images.map((imgUrl, idx) => (
                  <img
                    key={idx}
                    src={imgUrl}
                    alt={`${product.name} ${idx + 1}`}
                    className={`thumbnail-image ${imgUrl === mainImage ? 'selected' : ''}`}
                    onClick={() => setMainImage(imgUrl)}
                    loading="lazy"
                  />
                ))}
              </div>
            </>
          ) : (
            <div className="no-image-large">📦</div>
          )}
        </div>

        <div className="product-details">
          <h1>{product.name}</h1>
          <div className="product-category-badge">{product.category}</div>

          <div className="product-price-section">
            <span className="price-label">Rental Price:</span>
            <span className="price-value">₹{product.pricePerDay}/day</span>
          </div>

          {product.reviewsCount > 0 && (
            <div className="product-rating">
              <span className="rating-stars">{'★'.repeat(Math.round(product.averageRating))}{'☆'.repeat(5 - Math.round(product.averageRating))}</span>
              <span className="rating-info">{product.averageRating} ({product.reviewsCount})</span>
            </div>
          )}

          <div className="product-availability">
            {product.availability ? (
              <span className="status-available">✓ Available</span>
            ) : (
              <span className="status-unavailable">✗ Not Available</span>
            )}
          </div>

          <div className="product-section">
            <h3>Description</h3>
            <p>{product.description}</p>
          </div>

          <div className="product-section">
            <h3>Location</h3>
            <p>📍 {product.location?.address}</p>
          </div>

          {product.specs && Object.keys(product.specs).length > 0 && (
            <div className="product-section">
              <h3>Specifications</h3>
              <ul className="specs-list">
                {Object.entries(product.specs).map(([key, value]) => (
                  <li key={key}>
                    <strong>{key}:</strong> {value}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="product-section">
            <h3>Owner</h3>
            <p>{product.owner?.name}</p>
            <p className="owner-email">{product.owner?.email}</p>
          </div>

          {product.availability && (
            <button onClick={handleBookNow} className="btn-book-now">
              Book Now
            </button>
          )}
        </div>
      </div>

      {showBookingForm && (
        <BookingForm
          product={product}
          onClose={() => setShowBookingForm(false)}
        />
      )}

      <section className="product-reviews container">
        <h2>Customer Reviews</h2>

        {canReview && !hasReviewed && (
          <ReviewForm productId={product._id} onSubmitted={onReviewSubmitted} />
        )}

        {!canReview && !hasReviewed && isAuthenticated && (
          <p className="small-note">You can leave a review after you complete a booking for this product.</p>
        )}

        <ReviewsList productId={product._id} refreshKey={reviewRefreshKey} />
      </section>
    </div>
  );
};

export default ProductDetail;
