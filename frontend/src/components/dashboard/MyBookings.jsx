import React, { useEffect, useState } from 'react';
import { bookingAPI, reviewAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import ReviewForm from '../products/ReviewForm';
import './Dashboard.css';

const MyBookings = ({ bookings, onUpdate }) => {
  const { user } = useAuth();
  const [editingBooking, setEditingBooking] = useState(null);
  const [formData, setFormData] = useState({ startDate: '', endDate: '' });
  const [loading, setLoading] = useState(false);
  const [canLeaveReview, setCanLeaveReview] = useState({});
  const [checkingReviews, setCheckingReviews] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(null);

  useEffect(() => {
    let mounted = true;
    const check = async () => {
      if (!user) return;
      setCheckingReviews(true);
      const completedBookings = bookings.filter((b) => b.status === 'completed');
      const map = {};
      for (const b of completedBookings) {
        try {
          const resp = await reviewAPI.getByProduct(b.product._id, { page: 1, limit: 100 });
          const reviews = resp.data.data || [];
          map[b.product._id] = !reviews.some((r) => r.user && r.user._id === user._id);
        } catch (err) {
          map[b.product._id] = false;
          console.error('Check review error', err);
        }
      }
      if (mounted) {
        setCanLeaveReview(map);
        setCheckingReviews(false);
      }
    };
    check();
    return () => {
      mounted = false;
    };
  }, [bookings, user]);

  const handleUpdate = async (bookingId) => {
    if (!formData.startDate || !formData.endDate) {
      alert('Please fill all fields');
      return;
    }
    setLoading(true);
    try {
      await bookingAPI.update(bookingId, formData);
      alert('Booking updated successfully');
      setEditingBooking(null);
      onUpdate();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to update booking');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    setLoading(true);
    try {
      await bookingAPI.cancel(bookingId);
      alert('Booking cancelled successfully');
      onUpdate();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to cancel booking');
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async (bookingId) => {
    if (!window.confirm('Mark this booking as completed?')) return;
    setLoading(true);
    try {
      await bookingAPI.complete(bookingId);
      alert('Booking marked as completed');
      onUpdate();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to complete booking');
    } finally {
      setLoading(false);
    }
  };

  if (bookings.length === 0) {
    return (
      <div className="no-data">
        <h3>No bookings yet</h3>
        <p>Start browsing products to make your first booking.</p>
      </div>
    );
  }

  return (
    <div className="bookings-container">
      <div className="dashboard-header-mini"><h2>My Bookings</h2></div>
      <div className="bookings-list">
        {bookings.map((booking) => (
          <div key={booking._id} className="booking-card">
            <div className="booking-header">
              <h3>{booking.product?.name}</h3>
              <span className={`status-badge status-${booking.status}`}>{booking.status}</span>
            </div>

            {editingBooking === booking._id ? (
              <div className="edit-form">
                <div className="form-group">
                  <label>Start Date</label>
                  <input type="date" value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} min={new Date().toISOString().split('T')[0]} />
                </div>
                <div className="form-group">
                  <label>End Date</label>
                  <input type="date" value={formData.endDate} onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} min={formData.startDate} />
                </div>
                <div className="form-actions">
                  <button onClick={() => handleUpdate(booking._id)} className="btn-save" disabled={loading}>Save</button>
                  <button onClick={() => setEditingBooking(null)} className="btn-cancel-edit">Cancel</button>
                </div>
              </div>
            ) : (
              <>
                <div className="booking-details">
                  <div className="detail-row"><span className="label">Start Date:</span><span>{new Date(booking.startDate).toLocaleDateString()}</span></div>
                  <div className="detail-row"><span className="label">End Date:</span><span>{new Date(booking.endDate).toLocaleDateString()}</span></div>
                  <div className="detail-row"><span className="label">Total Price:</span><span className="price">Rs {booking.totalPrice}</span></div>
                  <div className="detail-row"><span className="label">Delivery Address:</span><span>{booking.location?.address}</span></div>
                </div>

                <div className="booking-actions">
                  {booking.status === 'pending' && (
                    <>
                      <button
                        onClick={() => {
                          setEditingBooking(booking._id);
                          setFormData({ startDate: booking.startDate.split('T')[0], endDate: booking.endDate.split('T')[0] });
                        }}
                        className="btn-edit"
                      >
                        Edit Dates
                      </button>
                      <button onClick={() => handleCancel(booking._id)} className="btn-cancel-booking" disabled={loading}>Cancel</button>
                    </>
                  )}

                  {(booking.status === 'confirmed' || booking.status === 'active') && (
                    <button onClick={() => handleComplete(booking._id)} className="btn-save" disabled={loading}>
                      Mark Completed
                    </button>
                  )}

                  {booking.status === 'completed' && (
                    <>
                      {checkingReviews ? (
                        <span className="small-note">Checking review...</span>
                      ) : canLeaveReview[booking.product._id] ? (
                        <button onClick={() => { setSelectedProductId(booking.product._id); setShowReviewModal(true); }} className="btn-leave-review">Leave Review</button>
                      ) : (
                        <span className="small-note">Already reviewed</span>
                      )}
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {showReviewModal && (
        <div className="review-modal-overlay" onClick={() => setShowReviewModal(false)}>
          <div className="review-modal" onClick={(e) => e.stopPropagation()}>
            <div className="review-modal-header">
              <h3>Leave a Review</h3>
              <button className="btn-close" onClick={() => setShowReviewModal(false)}>x</button>
            </div>
            <ReviewForm
              productId={selectedProductId}
              onSubmitted={() => {
                setShowReviewModal(false);
                setCanLeaveReview((prev) => ({ ...prev, [selectedProductId]: false }));
                setSelectedProductId(null);
                if (onUpdate) onUpdate();
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBookings;
