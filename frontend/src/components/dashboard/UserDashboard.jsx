import React, { useEffect, useState } from 'react';
import { dashboardAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import MyBookings from './MyBookings';
import MyListings from './MyListings';
import './Dashboard.css';

const UserDashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('bookings');
  const hasListings = (dashboardData?.myListings?.length || 0) > 0;

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const response = await dashboardAPI.getDashboard();
      setDashboardData(response.data.data);
    } catch (err) {
      setError('Failed to load dashboard');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>Error</h2>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Welcome back, {user?.name}</h1>
        <p className="user-role">Role: {user?.role}</p>
      </div>

      <div className="dashboard-tabs">
        <button className={`tab-button ${activeTab === 'bookings' ? 'active' : ''}`} onClick={() => setActiveTab('bookings')}>My Bookings</button>
        <button className={`tab-button ${activeTab === 'listings' ? 'active' : ''}`} onClick={() => setActiveTab('listings')}>My Listings</button>
        {hasListings && (
          <button className={`tab-button ${activeTab === 'received' ? 'active' : ''}`} onClick={() => setActiveTab('received')}>Received Bookings</button>
        )}
      </div>

      <div className="tab-content">
        {activeTab === 'bookings' && <MyBookings bookings={dashboardData?.myBookings || []} onUpdate={fetchDashboard} />}
        {activeTab === 'listings' && <MyListings listings={dashboardData?.myListings || []} onUpdate={fetchDashboard} />}
        {activeTab === 'received' && (
          <div className="received-bookings">
            <h2>Bookings on Your Listings</h2>
            {dashboardData?.bookingsOnMyListings?.length > 0 ? (
              <div className="bookings-list">
                {dashboardData.bookingsOnMyListings.map((booking) => (
                  <div key={booking._id} className="booking-item">
                    <h3>{booking.product?.name}</h3>
                    <p>Customer: {booking.user?.name}</p>
                    <p>Email: {booking.user?.email}</p>
                    <p>Dates: {new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}</p>
                    <p>Amount: Rs {booking.totalPrice}</p>
                    <span className={`status-badge status-${booking.status}`}>{booking.status}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-data">No bookings received yet</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;
