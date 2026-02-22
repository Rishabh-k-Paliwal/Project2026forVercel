import React from 'react';
import { Link } from 'react-router-dom';
import {
  FaEnvelope,
  FaFacebook,
  FaInstagram,
  FaLinkedin,
  FaMapMarkerAlt,
  FaPhone,
  FaTwitter,
} from 'react-icons/fa';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-grid">
          <div className="footer-section footer-brand">
            <h3 className="footer-logo">
              <img src="/garuda.png" alt="Garuda logo" className="footer-logo-img" />
              ElectroRent
            </h3>
            <p className="footer-description">
              Flexible access to electronics for creators, students, and professionals who want performance without ownership overhead.
            </p>
            <p className="footer-tagline">A project by Garuda Creation</p>
            <div className="footer-contact-info">
              <div className="contact-item">
                <FaMapMarkerAlt />
                <span>VIT Bhopal University, Bhopal, India</span>
              </div>
              <div className="contact-item">
                <FaEnvelope />
                <span>support@electrorent.com</span>
              </div>
              <div className="contact-item">
                <FaPhone />
                <span>+91 1234567890</span>
              </div>
            </div>
          </div>

          <div className="footer-section">
            <h4>Company</h4>
            <ul className="footer-links">
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/team">Our Team</Link></li>
              <li><Link to="/contact">Contact Us</Link></li>
              <li><Link to="/">Browse Products</Link></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>Legal</h4>
            <ul className="footer-links">
              <li><Link to="/terms">Terms of Service</Link></li>
              <li><Link to="/privacy">Privacy Policy</Link></li>
              <li><Link to="/dashboard">My Account</Link></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>Connect</h4>
            <div className="social-links">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook"><FaFacebook /></a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter"><FaTwitter /></a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><FaInstagram /></a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><FaLinkedin /></a>
            </div>
            <p className="social-description">Follow us for launch updates, featured gear, and platform improvements.</p>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; {currentYear} ElectroRent. All rights reserved.</p>
          <p className="footer-credits">Built by Garuda Creation.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
