import React from 'react';
import ProductList from '../components/products/ProductList';
import './Home.css';

const Home = () => {
  return (
    <div className="home-page">
      <section className="products-section container">
        <div className="section-header">
          <h2>Trending Gear</h2>
        </div>
        <ProductList />
      </section>
    </div>
  );
};

export default Home;
