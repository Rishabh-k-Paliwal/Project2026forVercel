import React, { useState } from 'react';
import './LocationPicker.css';

const LocationPicker = ({ onSelect, onClose }) => {
  const [method, setMethod] = useState('current');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({ lat: '', lng: '', city: '', radius: 50 });

  const popularCities = [
    { name: 'Mumbai', lat: 19.076, lng: 72.8777 },
    { name: 'Delhi', lat: 28.6139, lng: 77.209 },
    { name: 'Bangalore', lat: 12.9716, lng: 77.5946 },
    { name: 'Hyderabad', lat: 17.385, lng: 78.4867 },
    { name: 'Chennai', lat: 13.0827, lng: 80.2707 },
    { name: 'Kolkata', lat: 22.5726, lng: 88.3639 },
    { name: 'Pune', lat: 18.5204, lng: 73.8567 },
    { name: 'Ahmedabad', lat: 23.0225, lng: 72.5714 },
  ];

  const handleCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    setLoading(true);
    setError('');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLoading(false);
        onSelect({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          radius: formData.radius,
          address: 'Your current location',
        });
      },
      (geoError) => {
        setLoading(false);
        setError('Unable to get your location. Please try manual entry.');
        console.error('Geolocation error:', geoError);
      }
    );
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!formData.lat || !formData.lng) {
      setError('Please enter both latitude and longitude');
      return;
    }
    onSelect({ lat: parseFloat(formData.lat), lng: parseFloat(formData.lng), radius: formData.radius });
  };

  return (
    <div className="location-picker-overlay" onClick={onClose}>
      <div className="location-picker-modal" onClick={(e) => e.stopPropagation()}>
        <div className="location-picker-header">
          <h2>Select Location</h2>
          <button onClick={onClose} className="btn-close">x</button>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="location-tabs">
          <button className={`tab ${method === 'current' ? 'active' : ''}`} onClick={() => setMethod('current')}>Current</button>
          <button className={`tab ${method === 'city' ? 'active' : ''}`} onClick={() => setMethod('city')}>City</button>
          <button className={`tab ${method === 'manual' ? 'active' : ''}`} onClick={() => setMethod('manual')}>Manual</button>
        </div>

        {method === 'current' && (
          <div className="location-method">
            <p className="method-description">Use your device location to discover nearby products.</p>
            <button onClick={handleCurrentLocation} className="btn-get-location" disabled={loading}>
              {loading ? 'Getting location...' : 'Use my current location'}
            </button>
          </div>
        )}

        {method === 'city' && (
          <div className="location-method">
            <p className="method-description">Choose a city in India.</p>
            <div className="cities-grid">
              {popularCities.map((city) => (
                <button key={city.name} onClick={() => onSelect({ lat: city.lat, lng: city.lng, radius: formData.radius, address: city.name })} className="city-button">
                  {city.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {method === 'manual' && (
          <div className="location-method">
            <p className="method-description">Enter latitude and longitude manually.</p>
            <form onSubmit={handleManualSubmit} className="manual-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Latitude</label>
                  <input type="number" step="any" value={formData.lat} onChange={(e) => setFormData({ ...formData, lat: e.target.value })} placeholder="e.g., 28.6139" required />
                </div>
                <div className="form-group">
                  <label>Longitude</label>
                  <input type="number" step="any" value={formData.lng} onChange={(e) => setFormData({ ...formData, lng: e.target.value })} placeholder="e.g., 77.2090" required />
                </div>
              </div>
              <button type="submit" className="btn-submit">Set location</button>
            </form>
          </div>
        )}

        <div className="radius-selector">
          <label>Search Radius: {formData.radius} km</label>
          <input type="range" min="5" max="100" step="5" value={formData.radius} onChange={(e) => setFormData({ ...formData, radius: parseInt(e.target.value, 10) })} className="radius-slider" />
          <div className="radius-labels"><span>5 km</span><span>50 km</span><span>100 km</span></div>
        </div>

        <div className="location-tip">Tip: Products inside the selected radius are prioritized.</div>
      </div>
    </div>
  );
};

export default LocationPicker;
