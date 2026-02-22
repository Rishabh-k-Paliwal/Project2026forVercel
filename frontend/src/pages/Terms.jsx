import React from 'react';
import './Terms.css';

const Terms = () => {
  return (
    <div className="legal-page">
      <div className="legal-container">
        <div className="legal-header">
          <h1>Terms of Service</h1>
          <p className="last-updated">
            Last updated: {new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        <div className="legal-content">
          <div className="legal-section">
            <h2>1. Acceptance of Terms</h2>
            <p>By using ElectroRent, you agree to these terms and applicable policies.</p>
            <div className="legal-highlight">
              <p>Note: These terms create a legally binding agreement between you and ElectroRent.</p>
            </div>
          </div>

          <div className="legal-section">
            <h2>2. Use License</h2>
            <ul>
              <li>You must not misuse or copy protected platform assets.</li>
              <li>You must not reverse engineer platform software.</li>
              <li>You must retain all copyright and ownership notices.</li>
            </ul>
          </div>

          <div className="legal-section">
            <h2>3. User Responsibilities</h2>
            <h3>Account Security</h3>
            <p>You are responsible for account credentials and activity under your account.</p>
            <h3>Accurate Information</h3>
            <p>You agree to provide and maintain correct, current profile and booking information.</p>
          </div>

          <div className="legal-section">
            <h2>4. Rental Terms</h2>
            <ul>
              <li>Rentals are subject to availability.</li>
              <li>Items must be returned in the same condition, excluding normal wear.</li>
              <li>Damage or delayed return may incur additional charges.</li>
            </ul>
          </div>

          <div className="legal-section">
            <h2>5. Payment Terms</h2>
            <p>Payment is collected before rental start. Supported methods may vary by region and provider.</p>
            <div className="legal-highlight">
              <p>Note: Payment flows are processed through integrated secure providers.</p>
            </div>
          </div>

          <div className="legal-section">
            <h2>6. Cancellations and Refunds</h2>
            <p>Refund eligibility depends on cancellation timing and platform policy shown at checkout.</p>
          </div>

          <div className="legal-section">
            <h2>7. Limitation of Liability</h2>
            <p>ElectroRent is not liable for indirect, incidental, or consequential losses from platform use.</p>
          </div>

          <div className="legal-section">
            <h2>8. Updates to Terms</h2>
            <p>Terms may change over time. Material updates are reflected by the latest update date on this page.</p>
          </div>

          <div className="contact-info">
            <h3>Contact Information</h3>
            <p>Email: <a href="mailto:support@electrorent.com">support@electrorent.com</a></p>
            <p>Phone: +91 1234567890</p>
            <p>Address: VIT Bhopal University, Bhopal, India</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Terms;
