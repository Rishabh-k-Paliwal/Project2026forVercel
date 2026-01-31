import React, { useState } from 'react';
import { reviewAPI } from '../../services/api';
import './Products.css';

const ReviewForm = ({ productId, onSubmitted }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      setLoading(true);
      await reviewAPI.create(productId, { rating, comment });
      setRating(5);
      setComment('');
      if (onSubmitted) onSubmitted();
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to submit review';
      setError(msg);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="review-form">
      <h3>Leave a Review</h3>
      {error && <div className="error-alert">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Rating</label>
          <select value={rating} onChange={(e) => setRating(Number(e.target.value))}>
            <option value={5}>5 - Excellent</option>
            <option value={4}>4 - Very Good</option>
            <option value={3}>3 - Good</option>
            <option value={2}>2 - Fair</option>
            <option value={1}>1 - Poor</option>
          </select>
        </div>

        <div className="form-group">
          <label>Comment (optional)</label>
          <textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={4} />
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Submitting...' : 'Submit Review'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReviewForm;
