import React from 'react';
import './Terms.css';

const Privacy = () => {
  return (
    <div className="legal-page">
      <div className="legal-container">
        <div className="legal-header">
          <h1>Privacy Policy</h1>
          <p className="last-updated">
            Last updated: {new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        <div className="legal-content">
          <div className="legal-section">
            <h2>1. Information We Collect</h2>
            <ul>
              <li>Account details such as name, email, and phone number.</li>
              <li>Product, booking, and transaction related information.</li>
              <li>Technical and usage data such as browser, device, and IP metadata.</li>
            </ul>
          </div>

          <div className="legal-section">
            <h2>2. How We Use Information</h2>
            <ul>
              <li>To operate, improve, and secure the platform.</li>
              <li>To process bookings, payments, and support requests.</li>
              <li>To detect fraud and comply with legal obligations.</li>
            </ul>
          </div>

          <div className="legal-section">
            <h2>3. Information Sharing</h2>
            <p>We do not sell personal information. Data is shared only when needed for platform operation or legal compliance.</p>
            <div className="legal-highlight">
              <p>Note: We minimize data sharing and restrict it to necessary partners and service providers.</p>
            </div>
          </div>

          <div className="legal-section">
            <h2>4. Data Security</h2>
            <ul>
              <li>Encrypted data transfer and protected infrastructure.</li>
              <li>Role-based access controls and secure authentication.</li>
              <li>Ongoing monitoring and security improvements.</li>
            </ul>
          </div>

          <div className="legal-section">
            <h2>5. Your Rights</h2>
            <ul>
              <li>Access and correct your personal information.</li>
              <li>Request deletion where legally applicable.</li>
              <li>Object to specific processing and withdraw consent.</li>
            </ul>
          </div>

          <div className="legal-section">
            <h2>6. Cookies and Tracking</h2>
            <p>Cookies help keep sessions active, remember settings, and improve user experience.</p>
          </div>

          <div className="legal-section">
            <h2>7. Policy Changes</h2>
            <p>Policy updates are published on this page with the latest update date.</p>
          </div>

          <div className="contact-info">
            <h3>Contact for Privacy Questions</h3>
            <p>Email: <a href="mailto:privacy@electrorent.com">privacy@electrorent.com</a></p>
            <p>Phone: +91 1234567890</p>
            <p>Address: VIT Bhopal University, Bhopal, India</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
