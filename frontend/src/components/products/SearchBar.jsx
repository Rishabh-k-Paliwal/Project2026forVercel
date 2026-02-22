import React, { useState } from 'react';
import LocationPicker from './LocationPicker';
import './Products.css';

const SearchBar = ({ onSearch }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch({ query: searchQuery, location: selectedLocation });
  };

  return (
    <div className="search-bar-container">
      <form onSubmit={handleSubmit} className="search-form">
        <div className="search-input-wrapper">
          <input
            type="text"
            placeholder="Search electronics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />

          <button type="button" onClick={() => setShowLocationPicker(true)} className="btn-location" title="Filter by location">
            {selectedLocation ? 'Change location' : 'Add location'}
          </button>
        </div>

        {selectedLocation && (
          <div className="selected-location">
            <span>Near: {selectedLocation.address || `${selectedLocation.lat.toFixed(2)}, ${selectedLocation.lng.toFixed(2)}`}</span>
            <span className="radius-info">Within {selectedLocation.radius || 50}km</span>
            <button type="button" onClick={() => setSelectedLocation(null)} className="btn-clear-location">x</button>
          </div>
        )}

        <button type="submit" className="btn-search">Search</button>
      </form>

      {showLocationPicker && (
        <LocationPicker onSelect={(location) => { setSelectedLocation(location); setShowLocationPicker(false); }} onClose={() => setShowLocationPicker(false)} />
      )}
    </div>
  );
};

export default SearchBar;
