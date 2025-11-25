import React from 'react';
import './About.css';

const About = () => {
    return (
        <div className="about-page">
            {/* Hero Section */}
            <section className="about-hero">
                <div className="container">
                    <div className="hero-content fade-in">
                        <h1>Revolutionizing Tech Access</h1>
                        <p>Empowering creators and professionals with on-demand access to premium electronics.</p>
                    </div>
                </div>
            </section>

            <div className="container">
                {/* Stats Section */}
                <section className="stats-grid fade-in">
                    <div className="stat-card glass-panel">
                        <span className="stat-number">500+</span>
                        <span className="stat-label">Products</span>
                    </div>
                    <div className="stat-card glass-panel">
                        <span className="stat-number">1k+</span>
                        <span className="stat-label">Happy Renters</span>
                    </div>
                    <div className="stat-card glass-panel">
                        <span className="stat-number">24/7</span>
                        <span className="stat-label">Support</span>
                    </div>
                </section>

                {/* Mission & Vision */}
                <section className="mission-vision-section">
                    <div className="mv-card glass-panel fade-in">
                        <div className="mv-icon">🚀</div>
                        <div className="mv-content">
                            <h2>Our Mission</h2>
                            <p>
                                To democratize access to high-end technology. We believe that budget shouldn't be a barrier to innovation.
                                By providing flexible rental options, we enable you to use the best gear when you need it.
                            </p>
                        </div>
                    </div>
                    <div className="mv-card glass-panel fade-in">
                        <div className="mv-icon">👁️</div>
                        <div className="mv-content">
                            <h2>Our Vision</h2>
                            <p>
                                Building a sustainable, shared economy for electronics. We aim to reduce e-waste by maximizing the
                                lifecycle of devices and connecting a community of tech enthusiasts.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Core Values */}
                <section className="values-section">
                    <h2 className="section-title">Why Choose ElectroRent?</h2>
                    <div className="values-grid">
                        <div className="value-card glass-panel">
                            <span className="value-icon">🛡️</span>
                            <h3>Secure & Insured</h3>
                            <p>Every rental is fully insured. Verified users and secure payments ensure peace of mind.</p>
                        </div>
                        <div className="value-card glass-panel">
                            <span className="value-icon">⚡</span>
                            <h3>Instant Booking</h3>
                            <p>Seamless booking process with real-time availability and instant confirmation.</p>
                        </div>
                      
                         
                    </div>
                </section>
            </div>
        </div>
    );
};

export default About;
