import React, { useEffect, useState } from 'react';
import { reviewAPI } from '../../services/api';
import './Products.css';

const ReviewsList = ({ productId, refreshKey = 0 }) => {
  const [reviews, setReviews] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const limit = 5;

  const fetchReviews = async (pageToLoad = 1) => {
    try {
      setLoading(true);
      const response = await reviewAPI.getByProduct(productId, { page: pageToLoad, limit });
      setReviews(response.data.data);
      setTotal(response.data.total || 0);
      setPage(pageToLoad);
    } catch (err) {
      console.error('Failed to load reviews', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId, refreshKey]);

  const loadMore = () => {
    if (reviews.length < total) {
      fetchReviews(page + 1);
    }
  };

  return (
    <div className="reviews-section">
      <h3>Reviews ({total})</h3>
      {loading && <p>Loading reviews...</p>}
      {!loading && reviews.length === 0 && <p>No reviews yet.</p>}
      <div className="reviews-list">
        {reviews.map((r) => (
          <div key={r._id} className="review-item">
            <div className="review-header">
              <strong>{r.user?.name || 'User'}</strong>
              <span className="review-rating">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
            </div>
            {r.comment && <p className="review-comment">{r.comment}</p>}
            <div className="review-date">{new Date(r.createdAt).toLocaleDateString()}</div>
          </div>
        ))}
      </div>
      {reviews.length < total && (
        <button onClick={loadMore} className="btn-load-more">
          Load more
        </button>
      )}
    </div>
  );
};

export default ReviewsList;
