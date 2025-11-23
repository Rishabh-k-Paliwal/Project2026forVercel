import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import BookingForm from '../booking/BookingForm';
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
    </div>
  );
};

export default ProductDetail;
