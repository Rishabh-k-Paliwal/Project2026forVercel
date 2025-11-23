import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { productAPI } from '../services/api';
import { PRODUCT_CATEGORIES } from '../utils/constants';
import './ProductForm.css';

const CLOUDINARY_UPLOAD_PRESET = 'your_upload_preset';
const CLOUDINARY_CLOUD_NAME = 'your_cloud_name';

const EditProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    pricePerDay: '',
    category: '',
    images: [], // updated to array
    specs: {
      brand: '',
      model: '',
      condition: '',
    },
    location: {
      address: '',
      coordinates: ['', ''],
    },
    availability: true,
  });

  const fetchProduct = React.useCallback(async () => {
    try {
      setLoading(true);
      const response = await productAPI.getById(id);
      const product = response.data.data;

      setFormData({
        name: product.name,
        description: product.description,
        pricePerDay: product.pricePerDay,
        category: product.category,
        images: product.images || [], // array directly
        specs: product.specs || { brand: '', model: '', condition: '' },
        location: {
          address: product.location?.address || '',
          coordinates: product.location?.coordinates || ['', ''],
        },
        availability: product.availability,
      });
    } catch (err) {
      setError('Failed to load product');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === 'checkbox') {
      setFormData({
        ...formData,
        [name]: checked,
      });
    } else if (name.startsWith('specs.')) {
      const specKey = name.split('.')[1];
      setFormData({
        ...formData,
        specs: {
          ...formData.specs,
          [specKey]: value,
        },
      });
    } else if (name === 'address') {
      setFormData({
        ...formData,
        location: {
          ...formData.location,
          address: value,
        },
      });
    } else if (name === 'longitude' || name === 'latitude') {
      const index = name === 'longitude' ? 0 : 1;
      const newCoordinates = [...formData.location.coordinates];
      newCoordinates[index] = value;
      setFormData({
        ...formData,
        location: {
          ...formData.location,
          coordinates: newCoordinates,
        },
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData({
            ...formData,
            location: {
              ...formData.location,
              coordinates: [
                position.coords.longitude,
                position.coords.latitude,
              ],
            },
          });
          alert('Location updated successfully!');
        },
        () => {
          alert('Unable to get location. Please enter manually.');
        }
      );
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      const productData = {
        name: formData.name,
        description: formData.description,
        pricePerDay: Number(formData.pricePerDay),
        category: formData.category,
        images: formData.images, // array directly
        specs: formData.specs,
        location: {
          type: 'Point',
          coordinates: [
            parseFloat(formData.location.coordinates[0]),
            parseFloat(formData.location.coordinates[1]),
          ],
          address: formData.location.address,
        },
        availability: formData.availability,
      };

      await productAPI.update(id, productData);
      alert('Product updated successfully!');
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update product');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formDataCloudinary = new FormData();
    formDataCloudinary.append('file', file);
    formDataCloudinary.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/upload`,
        {
          method: 'POST',
          body: formDataCloudinary,
        }
      );
      const data = await response.json();
      if (data.secure_url) {
        setFormData((prev) => ({
          ...prev,
          images: [...prev.images, data.secure_url],
        }));
      }
    } catch (error) {
      alert('Image upload failed. Please try again.');
      console.error(error);
    }
  };

  const handleRemoveImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading product...</p>
      </div>
    );
  }

  return (
    <div className="product-form-container">
      <div className="product-form-card">
        <h1>Edit Product</h1>
        <p className="form-subtitle">Update your product details</p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="product-form">
          {/* Availability Toggle */}
          <div className="form-section">
            <div className="availability-toggle">
              <label className="toggle-label">
                <input
                  type="checkbox"
                  name="availability"
                  checked={formData.availability}
                  onChange={handleChange}
                />
                <span className="toggle-switch"></span>
                <span className="toggle-text">
                  {formData.availability ? 'Available for Rent' : 'Not Available'}
                </span>
              </label>
            </div>
          </div>

          {/* Basic Information */}
          <div className="form-section">
            <h3>Basic Information</h3>

            <div className="form-group">
              <label>Product Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Description *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="4"
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Category *</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                >
                  {PRODUCT_CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Price Per Day (₹) *</label>
                <input
                  type="number"
                  name="pricePerDay"
                  value={formData.pricePerDay}
                  onChange={handleChange}
                  min="0"
                  required
                />
              </div>
            </div>
          </div>

          {/* Specifications */}
          <div className="form-section">
            <h3>Specifications</h3>

            <div className="form-row">
              <div className="form-group">
                <label>Brand</label>
                <input
                  type="text"
                  name="specs.brand"
                  value={formData.specs.brand}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Model</label>
                <input
                  type="text"
                  name="specs.model"
                  value={formData.specs.model}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Condition</label>
              <select
                name="specs.condition"
                value={formData.specs.condition}
                onChange={handleChange}
              >
                <option value="">Select Condition</option>
                <option value="new">New</option>
                <option value="like-new">Like New</option>
                <option value="good">Good</option>
                <option value="fair">Fair</option>
              </select>
            </div>
          </div>

          {/* Images Upload & Preview */}
          <div className="form-section">
            <h3>Images</h3>

            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="image-upload-input"
            />

            <div className="image-preview-container">
              {formData.images.map((imgUrl, idx) => (
                <div key={idx} className="image-preview-item">
                  <img
                    src={imgUrl}
                    alt={`Product ${idx + 1}`}
                    className="image-preview"
                  />
                  <button
                    type="button"
                    className="btn-remove-image"
                    onClick={() => handleRemoveImage(idx)}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Location */}
          <div className="form-section">
            <h3>Location</h3>

            <div className="form-group">
              <label>Address *</label>
              <textarea
                name="address"
                value={formData.location.address}
                onChange={handleChange}
                rows="3"
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Longitude *</label>
                <input
                  type="number"
                  name="longitude"
                  value={formData.location.coordinates[0]}
                  onChange={handleChange}
                  step="any"
                  required
                />
              </div>

              <div className="form-group">
                <label>Latitude *</label>
                <input
                  type="number"
                  name="latitude"
                  value={formData.location.coordinates[1]}
                  onChange={handleChange}
                  step="any"
                  required
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleGetLocation}
              className="btn-get-location"
            >
              📍 Update Location
            </button>
          </div>

          {/* Submit Buttons */}
          <div className="form-actions">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="btn-cancel"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-submit"
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Update Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProductPage;
