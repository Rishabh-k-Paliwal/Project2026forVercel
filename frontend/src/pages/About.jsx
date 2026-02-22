import React from 'react';
import './About.css';

const About = () => {
  return (
    <div className="about-page">
      <section className="about-hero">
        <div className="container">
          <div className="hero-content fade-in">
            <h1>Reimagining Access to Premium Tech</h1>
            <p>ElectroRent helps people use better gear, faster, with lower upfront cost and less device waste.</p>
          </div>
        </div>
      </section>

      <div className="container">
        <section className="stats-grid fade-in">
          <div className="stat-card glass-panel">
            <span className="stat-number">500+</span>
            <span className="stat-label">Products</span>
          </div>
          <div className="stat-card glass-panel">
            <span className="stat-number">1K+</span>
            <span className="stat-label">Happy Renters</span>
          </div>
          <div className="stat-card glass-panel">
            <span className="stat-number">24/7</span>
            <span className="stat-label">Support</span>
          </div>
        </section>

        <section className="mission-vision-section">
          <div className="mv-card glass-panel fade-in">
            <div className="mv-icon">M</div>
            <div className="mv-content">
              <h2>Our Mission</h2>
              <p>Make advanced electronics accessible through flexible rentals and transparent pricing.</p>
            </div>
          </div>
          <div className="mv-card glass-panel fade-in">
            <div className="mv-icon">V</div>
            <div className="mv-content">
              <h2>Our Vision</h2>
              <p>Build a durable and sustainable electronics-sharing ecosystem led by trust and product quality.</p>
            </div>
          </div>
        </section>

        <section className="values-section">
          <h2 className="section-title">Why Choose ElectroRent</h2>
          <div className="values-grid">
            <div className="value-card glass-panel">
              <span className="value-icon">S</span>
              <h3>Secure &amp; Insured</h3>
              <p>Every booking is supported with verified users and secure payment workflows.</p>
            </div>
            <div className="value-card glass-panel">
              <span className="value-icon">F</span>
              <h3>Fast Booking</h3>
              <p>Find available products quickly with geolocation-based discovery and clear checkout.</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default About;
