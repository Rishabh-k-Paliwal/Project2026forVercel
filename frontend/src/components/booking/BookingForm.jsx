import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { bookingAPI } from '../../services/api';
import './Booking.css';

const BookingForm = ({ product, onClose }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ startDate: '', endDate: '', address: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [totalPrice, setTotalPrice] = useState(0);

  const calculatePrice = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    if (days > 0) setTotalPrice(days * product.pricePerDay);
    else setTotalPrice(0);
  };

  const handleChange = (e) => {
    const next = { ...formData, [e.target.name]: e.target.value };
    setFormData(next);
    if (next.startDate && next.endDate) calculatePrice(next.startDate, next.endDate);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (start < today) return setError('Start date cannot be in the past');
    if (end <= start) return setError('End date must be after start date');

    setLoading(true);
    try {
      const bookingData = {
        productId: product._id,
        startDate: formData.startDate,
        endDate: formData.endDate,
        location: { address: formData.address, coordinates: product.location.coordinates },
      };

      const response = await bookingAPI.create(bookingData);
      if (response.data.order) {
        const options = {
          key: process.env.REACT_APP_RAZORPAY_KEY_ID,
          amount: response.data.order.amount,
          currency: response.data.order.currency,
          name: 'ElectroRent',
          description: `Booking for ${product.name}`,
          order_id: response.data.order.id,
          handler: async (paymentResponse) => {
            try {
              await bookingAPI.confirm({
                razorpay_payment_id: paymentResponse.razorpay_payment_id,
                razorpay_order_id: paymentResponse.razorpay_order_id,
                razorpay_signature: paymentResponse.razorpay_signature,
                bookingId: response.data.data._id,
              });
              alert('Payment successful. Booking confirmed.');
              navigate('/dashboard');
            } catch (err) {
              console.error('Payment confirmation failed', err);
              alert('Payment succeeded but confirmation failed. Please contact support.');
            }
          },
          prefill: { name: 'User Name', email: 'user@example.com' },
          theme: { color: '#f08a24' },
        };
        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create booking');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="booking-modal-overlay" onClick={onClose}>
      <div className="booking-modal" onClick={(e) => e.stopPropagation()}>
        <div className="booking-modal-header">
          <h2>Book {product.name}</h2>
          <button onClick={onClose} className="btn-close">x</button>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="booking-form">
          <div className="form-group">
            <label>Start Date</label>
            <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} required min={new Date().toISOString().split('T')[0]} />
          </div>

          <div className="form-group">
            <label>End Date</label>
            <input type="date" name="endDate" value={formData.endDate} onChange={handleChange} required min={formData.startDate || new Date().toISOString().split('T')[0]} />
          </div>

          <div className="form-group">
            <label>Delivery Address</label>
            <textarea name="address" value={formData.address} onChange={handleChange} required rows="3" />
          </div>

          {totalPrice > 0 && (
            <div className="price-summary">
              <div className="price-row"><span>Price per day:</span><span>Rs {product.pricePerDay}</span></div>
              <div className="price-row"><span>Number of days:</span><span>{Math.ceil((new Date(formData.endDate) - new Date(formData.startDate)) / (1000 * 60 * 60 * 24))}</span></div>
              <div className="price-row total"><span>Total Price:</span><span>Rs {totalPrice}</span></div>
            </div>
          )}

          <div className="booking-actions">
            <button type="button" onClick={onClose} className="btn-cancel">Cancel</button>
            <button type="submit" className="btn-confirm" disabled={loading}>{loading ? 'Processing...' : 'Proceed to Payment'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookingForm;
