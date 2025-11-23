import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { productAPI } from '../services/api';
import { PRODUCT_CATEGORIES } from '../utils/constants';
import './ProductForm.css';
import axios from 'axios';

const AddProductPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        pricePerDay: '',
        category: '',
        images: [],
        specs: {
            brand: '',
            model: '',
            condition: '',
        },
        location: {
            address: '',
            coordinates: ['', ''],
        },
    });
    //   newly added 
    const cloudName = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET;

    const handleImageUpload = async (e) => {
        const files = e.target.files;
        if (!files) return;

        const uploadedUrls = [...formData.images];
        setLoading(true);

        try {
            for (let i = 0; i < files.length; i++) {
                const formDataImage = new FormData();
                formDataImage.append('file', files[i]);
                formDataImage.append('upload_preset', uploadPreset);

                const response = await axios.post(
                    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
                    formDataImage
                );

                uploadedUrls.push(response.data.secure_url);
            }
            setFormData({ ...formData, images: uploadedUrls });
        } catch (err) {
            alert('Image upload failed!');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // finish

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name.startsWith('specs.')) {
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
                                position.coords.longitude.toString(),
                                position.coords.latitude.toString(),
                            ],
                        },
                    });
                    alert('Location detected successfully!');
                },
                (error) => {
                    alert('Unable to get location. Please enter manually.');
                }
            );
        } else {
            alert('Geolocation is not supported by your browser');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validation
        if (!formData.name || !formData.description || !formData.pricePerDay || !formData.category) {
            setError('Please fill all required fields');
            return;
        }

        if (!formData.location.address) {
            setError('Please provide location address');
            return;
        }

        if (!formData.location.coordinates[0] || !formData.location.coordinates[1]) {
            setError('Please provide location coordinates (use Get Location button)');
            return;
        }

        setLoading(true);

        try {
            // Prepare data
            const productData = {
                name: formData.name,
                description: formData.description,
                pricePerDay: Number(formData.pricePerDay),
                category: formData.category,
                images: formData.images,
                specs: formData.specs,
                location: {
                    type: 'Point',
                    coordinates: [
                        parseFloat(formData.location.coordinates[0]),
                        parseFloat(formData.location.coordinates[1]),
                    ],
                    address: formData.location.address,
                },
            };

            await productAPI.create(productData);
            alert('Product listed successfully!');
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to create product');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="product-form-container">
            <div className="product-form-card">
                <h1>List Your Product</h1>
                <p className="form-subtitle">Fill in the details to rent out your electronics</p>

                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleSubmit} className="product-form">
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
                                placeholder="e.g., MacBook Pro 16-inch"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Description *</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Describe your product in detail..."
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
                                    <option value="">Select Category</option>
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
                                    placeholder="500"
                                    min="0"
                                    required
                                />
                            </div>
                        </div>
                        {/* change start */}
                        <div className="form-group">
                            <label>Upload Images</label>
                            <input
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={handleImageUpload}
                            />
                            <small>You can upload multiple images (max size depends on Cloudinary settings)</small>

                            {/* Show previews of uploaded images */}
                            <div className="image-previews">
                                {formData.images.map((url, idx) => (
                                    <img key={idx} src={url} alt={`Product ${idx + 1}`} className="image-preview" />
                                ))}
                            </div>
                        </div>
                        {/* change */}
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
                                    placeholder="e.g., Apple, Sony, Canon"
                                />
                            </div>

                            <div className="form-group">
                                <label>Model</label>
                                <input
                                    type="text"
                                    name="specs.model"
                                    value={formData.specs.model}
                                    onChange={handleChange}
                                    placeholder="e.g., 2023, A7 III"
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

                    {/* Location */}
                    <div className="form-section">
                        <h3>Location</h3>

                        <div className="form-group">
                            <label>Address *</label>
                            <textarea
                                name="address"
                                value={formData.location.address}
                                onChange={handleChange}
                                placeholder="Enter full address where product is available"
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
                                    placeholder="77.2090"
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
                                    placeholder="28.6139"
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
                            📍 Get My Current Location
                        </button>
                        <small>Click to automatically detect your location</small>
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
                            disabled={loading}
                        >
                            {loading ? 'Creating...' : 'List Product'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddProductPage;