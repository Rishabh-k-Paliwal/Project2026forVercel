import React, { useState, useEffect, useCallback } from 'react';
import { productAPI } from '../../services/api';
import ProductCard from './ProductCard';
import LocationPicker from './LocationPicker';
import './Products.css';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      let response;
      if (searchQuery || selectedLocation) {
        const searchParams = {};
        if (searchQuery) searchParams.q = searchQuery;
        if (selectedLocation) {
          searchParams.lat = selectedLocation.lat;
          searchParams.lng = selectedLocation.lng;
          searchParams.radius = selectedLocation.radius || 50;
        }
        response = await productAPI.search(searchParams);
      } else {
        // Request a high limit to get all products for client-side pagination
        response = await productAPI.getAll({ limit: 1000 });
      }

      console.log('Fetched products count:', response.data.data.length);
      setProducts(response.data.data);
      setCurrentPage(1);
    } catch (err) {
      setError('Failed to load products');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedLocation]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchProducts();
  };

  const handleLocationSelect = (location) => {
    setSelectedLocation(location);
    setShowLocationPicker(false);
  };

  const clearLocation = () => {
    setSelectedLocation(null);
  };

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = products.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(products.length / itemsPerPage);

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading products...</p>
      </div>
    );
  }

  return (
    <div className="product-list-container">
      <div className="search-bar-container">
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            placeholder="Search for electronics (e.g., laptop, camera, drone)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />

          <button
            type="button"
            onClick={() => setShowLocationPicker(true)}
            className="btn-location"
          >
            📍 {selectedLocation ? 'Change Location' : 'Add Location'}
          </button>

          <button type="submit" className="btn-search">
            🔍 Search
          </button>
        </form>

        {selectedLocation && (
          <div className="selected-location">
            <span>📍 Near: {selectedLocation.address || `${selectedLocation.lat.toFixed(2)}, ${selectedLocation.lng.toFixed(2)}`}</span>
            <span className="radius-info">Within {selectedLocation.radius || 50}km</span>
            <button type="button" onClick={clearLocation} className="btn-clear-location">
              ✕
            </button>
          </div>
        )}
      </div>

      {showLocationPicker && (
        <LocationPicker
          onSelect={handleLocationSelect}
          onClose={() => setShowLocationPicker(false)}
        />
      )}

      {error && <div className="error-message">{error}</div>}

      {products.length === 0 ? (
        <div className="no-products">
          <h3>No products found</h3>
          <p>Try adjusting your search</p>
        </div>
      ) : (
        <>
          <div className="results-info">
            <p>Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, products.length)} of {products.length} products (Page {currentPage} of {totalPages})</p>
          </div>

          <div className="products-grid">
            {currentProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className="pagination-btn"
              >
                ← Previous
              </button>

              <div className="pagination-numbers">
                {[...Array(totalPages)].map((_, index) => {
                  const pageNum = index + 1;
                  if (
                    pageNum === 1 ||
                    pageNum === totalPages ||
                    (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={pageNum}
                        onClick={() => paginate(pageNum)}
                        className={`pagination-number ${currentPage === pageNum ? 'active' : ''}`}
                      >
                        {pageNum}
                      </button>
                    );
                  } else if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                    return <span key={pageNum} className="pagination-ellipsis">...</span>;
                  }
                  return null;
                })}
              </div>

              <button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="pagination-btn"
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ProductList;