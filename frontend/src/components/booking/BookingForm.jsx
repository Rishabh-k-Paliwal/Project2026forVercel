import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { bookingAPI } from '../../services/api';
import './Booking.css';

const BookingForm = ({ product, onClose }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    address: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [totalPrice, setTotalPrice] = useState(0);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Calculate total price when dates change
    if ((name === 'startDate' || name === 'endDate') && formData.startDate && formData.endDate) {
      calculatePrice();
    }
  };

  const calculatePrice = () => {
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    
    if (days > 0) {
      setTotalPrice(days * product.pricePerDay);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (start < today) {
      setError('Start date cannot be in the past');
      return;
    }

    if (end <= start) {
      setError('End date must be after start date');
      return;
    }

    setLoading(true);

    try {
      const bookingData = {
        productId: product._id,
        startDate: formData.startDate,
        endDate: formData.endDate,
        location: {
          address: formData.address,
          coordinates: product.location.coordinates,
        },
      };

      const response = await bookingAPI.create(bookingData);

      // Redirect to Razorpay payment or dashboard
      if (response.data.order) {
        // Initialize Razorpay payment
        handlePayment(response.data.order, response.data.data);
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create booking');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = (order, booking) => {
    const options = {
      key: process.env.REACT_APP_RAZORPAY_KEY_ID,
      amount: order.amount,
      currency: order.currency,
      name: 'ElectroRent',
      description: `Booking for ${product.name}`,
      order_id: order.id,
      handler: async function (response) {
        // Payment successful - notify backend to confirm payment
        try {
          await bookingAPI.confirm({
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_signature: response.razorpay_signature,
            bookingId: booking._id,
          });

          alert('Payment successful! Booking confirmed.');
          navigate('/dashboard');
        } catch (err) {
          console.error('Payment confirmation failed', err);
          alert('Payment succeeded but confirmation failed. Please contact support.');
        }
      },
      prefill: {
        name: 'User Name',
        email: 'user@example.com',
      },
      theme: {
        color: '#667eea',
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  return (
    <div className="booking-modal-overlay" onClick={onClose}>
      <div className="booking-modal" onClick={(e) => e.stopPropagation()}>
        <div className="booking-modal-header">
          <h2>Book {product.name}</h2>
          <button onClick={onClose} className="btn-close">
            ✕
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="booking-form">
          <div className="form-group">
            <label>Start Date</label>
            <input
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              required
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          <div className="form-group">
            <label>End Date</label>
            <input
              type="date"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              required
              min={formData.startDate || new Date().toISOString().split('T')[0]}
            />
          </div>

          <div className="form-group">
            <label>Delivery Address</label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              required
              placeholder="Enter your delivery address"
              rows="3"
            />
          </div>

          {totalPrice > 0 && (
            <div className="price-summary">
              <div className="price-row">
                <span>Price per day:</span>
                <span>₹{product.pricePerDay}</span>
              </div>
              <div className="price-row">
                <span>Number of days:</span>
                <span>
                  {Math.ceil(
                    (new Date(formData.endDate) - new Date(formData.startDate)) /
                      (1000 * 60 * 60 * 24)
                  )}
                </span>
              </div>
              <div className="price-row total">
                <span>Total Price:</span>
                <span>₹{totalPrice}</span>
              </div>
            </div>
          )}

          <div className="booking-actions">
            <button type="button" onClick={onClose} className="btn-cancel">
              Cancel
            </button>
            <button type="submit" className="btn-confirm" disabled={loading}>
              {loading ? 'Processing...' : 'Proceed to Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookingForm;