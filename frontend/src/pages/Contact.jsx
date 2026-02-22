import React, { useState } from 'react';
import './About.css';

const Contact = () => {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Message sent successfully. We will get back to you soon.');
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <div className="about-page container">
      <div className="about-header fade-in">
        <h1>Contact Us</h1>
        <p>We would love to hear from you.</p>
      </div>

      <div className="contact-container glass-panel fade-in">
        <div className="contact-info">
          <h3>Get in Touch</h3>
          <div className="contact-info-item">
            <span className="contact-icon">Address</span>
            <div>
              <h4>Visit Us</h4>
              <p>VIT Bhopal University, Kothri Kalan, Bhopal-Indore Highway, Sehore, Madhya Pradesh - 466114</p>
            </div>
          </div>
          <div className="contact-info-item">
            <span className="contact-icon">Email</span>
            <div>
              <h4>Email Us</h4>
              <p>support@electrorent.com</p>
            </div>
          </div>
          <div className="contact-info-item">
            <span className="contact-icon">Phone</span>
            <div>
              <h4>Call Us</h4>
              <p>+1 (555) 123-4567</p>
            </div>
          </div>
        </div>

        <form className="contact-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Name</label>
            <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Your Name" />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="your@email.com" />
          </div>
          <div className="form-group">
            <label>Subject</label>
            <input type="text" required value={formData.subject} onChange={(e) => setFormData({ ...formData, subject: e.target.value })} placeholder="What is this about?" />
          </div>
          <div className="form-group">
            <label>Message</label>
            <textarea rows="5" required value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} placeholder="Your message here..." />
          </div>
          <button type="submit" className="btn-primary">Send Message</button>
        </form>
      </div>
    </div>
  );
};

export default Contact;
