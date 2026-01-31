import React, { useState, useEffect } from 'react';
import { bookingAPI, reviewAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import ReviewForm from '../products/ReviewForm';
import './Dashboard.css';

const MyBookings = ({ bookings, onUpdate }) => {
  const { user } = useAuth();
  const [editingBooking, setEditingBooking] = useState(null);
  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
  });
  const [loading, setLoading] = useState(false);

  // review state
  const [canLeaveReview, setCanLeaveReview] = useState({}); // productId -> boolean
  const [checkingReviews, setCheckingReviews] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(null);


  const handleEdit = (booking) => {
    setEditingBooking(booking._id);
    setFormData({
      startDate: booking.startDate.split('T')[0],
      endDate: booking.endDate.split('T')[0],
    });
  };

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
    if (!window.confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

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

  // Check review eligibility for completed bookings
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
          const hasMyReview = reviews.some((r) => r.user && r.user._id === user._id);
          map[b.product._id] = !hasMyReview; // can leave review only if not reviewed
        } catch (err) {
          // on error, be conservative and hide the button
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

  const openReviewModal = (productId) => {
    setSelectedProductId(productId);
    setShowReviewModal(true);
  };

  const onReviewSubmitted = () => {
    // hide modal & mark as reviewed
    setShowReviewModal(false);
    setCanLeaveReview((prev) => ({ ...prev, [selectedProductId]: false }));
    setSelectedProductId(null);
    // refresh parent data
    if (onUpdate) onUpdate();
  };


  if (bookings.length === 0) {
    return (
      <div className="no-data">
        <h3>No bookings yet</h3>
        <p>Start browsing products to make your first booking!</p>
      </div>
    );
  }

  return (
    <div className="bookings-container">
      <div className="dashboard-header-mini">
        <h2>My Bookings</h2>
      </div>
      <div className="bookings-list">
        {bookings.map((booking) => (
          <div key={booking._id} className="booking-card">
            <div className="booking-header">
              <h3>{booking.product?.name}</h3>
              <span className={`status-badge status-${booking.status}`}>
                {booking.status}
              </span>
            </div>

            {editingBooking === booking._id ? (
              <div className="edit-form p-4">
                <div className="form-group mb-4">
                  <label>Start Date</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) =>
                      setFormData({ ...formData, startDate: e.target.value })
                    }
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full p-2 bg-slate-800 border border-slate-700 rounded"
                  />
                </div>
                <div className="form-group mb-4">
                  <label>End Date</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) =>
                      setFormData({ ...formData, endDate: e.target.value })
                    }
                    min={formData.startDate}
                    className="w-full p-2 bg-slate-800 border border-slate-700 rounded"
                  />
                </div>
                <div className="form-actions flex gap-2">
                  <button
                    onClick={() => handleUpdate(booking._id)}
                    className="btn-save bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                    disabled={loading}
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingBooking(null)}
                    className="btn-cancel-edit bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="booking-details">
                  <div className="detail-row">
                    <span className="label">Start Date:</span>
                    <span>{new Date(booking.startDate).toLocaleDateString()}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">End Date:</span>
                    <span>{new Date(booking.endDate).toLocaleDateString()}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Total Price:</span>
                    <span className="price">₹{booking.totalPrice}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Delivery Address:</span>
                    <span>{booking.location?.address}</span>
                  </div>
                </div>

                <div className="booking-actions">
                  {booking.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleEdit(booking)}
                        className="btn-edit"
                      >
                        Edit Dates
                      </button>
                      <button
                        onClick={() => handleCancel(booking._id)}
                        className="btn-cancel-booking"
                        disabled={loading}
                      >
                        Cancel
                      </button>
                    </>
                  )}

                  {/* Leave Review button for completed bookings */}
                  {booking.status === 'completed' && (
                    <>
                      {checkingReviews ? (
                        <span className="small-note">Checking review...</span>
                      ) : canLeaveReview[booking.product._id] ? (
                        <button
                          onClick={() => openReviewModal(booking.product._id)}
                          className="btn-leave-review"
                        >
                          Leave Review
                        </button>
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
              <button className="btn-close" onClick={() => setShowReviewModal(false)}>✕</button>
            </div>

            <ReviewForm productId={selectedProductId} onSubmitted={onReviewSubmitted} />
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBookings;