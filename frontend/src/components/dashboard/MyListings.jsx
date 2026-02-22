import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { productAPI } from '../../services/api';
import './Dashboard.css';

const MyListings = ({ listings, onUpdate }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleDelete = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this listing?')) return;
    setLoading(true);
    try {
      await productAPI.delete(productId);
      alert('Listing deleted successfully');
      onUpdate();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to delete listing');
    } finally {
      setLoading(false);
    }
  };

  const toggleAvailability = async (product) => {
    setLoading(true);
    try {
      await productAPI.update(product._id, { availability: !product.availability });
      alert('Availability updated');
      onUpdate();
    } catch {
      alert('Failed to update availability');
    } finally {
      setLoading(false);
    }
  };

  if (listings.length === 0) {
    return (
      <div className="no-data">
        <h3>No listings yet</h3>
        <p>Create your first listing to start renting out your electronics.</p>
        <button onClick={() => navigate('/add-product')} className="btn-add-product">Add Product</button>
      </div>
    );
  }

  return (
    <div className="listings-container">
      <div className="dashboard-header-mini" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2>My Listings</h2>
        <button onClick={() => navigate('/add-product')} className="btn-add-product">Add New Product</button>
      </div>

      <div className="listings-grid">
        {listings.map((product) => (
          <div key={product._id} className="listing-card">
            <div className="listing-image">
              {product.images && product.images.length > 0 ? <img src={product.images[0]} alt={product.name} /> : <div className="no-image">No image</div>}
              <div className={`availability-badge ${product.availability ? 'available' : 'unavailable'}`}>
                {product.availability ? 'Available' : 'Unavailable'}
              </div>
            </div>

            <div className="listing-info">
              <h3>{product.name}</h3>
              <p className="listing-category">{product.category}</p>
              <p className="listing-price">Rs {product.pricePerDay}/day</p>
              <p className="listing-description">{product.description.substring(0, 80)}...</p>

              <div className="listing-actions">
                <button onClick={() => navigate(`/products/${product._id}`)} className="btn-view">View</button>
                <button onClick={() => navigate(`/edit-product/${product._id}`)} className="btn-edit">Edit</button>
                <button onClick={() => toggleAvailability(product)} className="btn-toggle" disabled={loading}>
                  {product.availability ? 'Mark Unavailable' : 'Mark Available'}
                </button>
                <button onClick={() => handleDelete(product._id)} className="btn-delete" disabled={loading}>Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyListings;
