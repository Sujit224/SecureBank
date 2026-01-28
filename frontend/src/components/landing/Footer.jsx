import React from 'react';
import { Send, Twitter, Facebook, Instagram, Linkedin } from 'lucide-react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-top">
          <div className="footer-brand">
            <div className="footer-logo">
              <div className="logo-icon white">
                <div className="logo-dot-1"></div>
                <div className="logo-dot-2 black"></div>
              </div>
            </div>
            <p className="footer-mission">
              A Modern Bank Card For A Modern World And Advanced And Up-To-Date Services For Your Convenience.
            </p>
          </div>

          <div className="footer-links">
            <div className="link-group">
              <h4>Quick Access</h4>
              <a href="#">About Us</a>
              <a href="#" className="active-link">• Services</a>
              <a href="#">Careers</a>
              <a href="#">Learn</a>
            </div>
            <div className="link-group">
              <h4>Branches</h4>
              <a href="#">Faq</a>
              <a href="#">Blog</a>
            </div>
          </div>

          <div className="footer-newsletter">
            <h4>To Know The Latest News And Updates, Enter Your Email So That We Can Contact You</h4>
            <div className="newsletter-form">
              <input type="email" placeholder="Email Address" />
              <button className="subscribe-btn">
                Subscribe <Send size={16} />
              </button>
            </div>
            <div className="social-links">
              <span>Contact Us:</span>
              <a href="#"><div className="social-icon purple"><Send size={14} /></div></a>
              <a href="#"><div className="social-icon"><Twitter size={14} /></div></a>
              <a href="#"><div className="social-icon"><Facebook size={14} /></div></a>
              <a href="#"><div className="social-icon"><Instagram size={14} /></div></a>
              <a href="#"><div className="social-icon"><Linkedin size={14} /></div></a>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="footer-pattern">
            {[...Array(20)].map((_, i) => (
              <div key={i} className="pattern-block"></div>
            ))}
          </div>
          <p className="copyright">Copyright © 2023 Square Card. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
