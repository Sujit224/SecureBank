import React from 'react';
import { ArrowRight } from 'lucide-react';
import './Hero.css';

const Hero = () => {
  return (
    <section className="hero">
      <div className="container hero-container">
        <div className="hero-content">
          <h1 className="hero-title">
            A Modern Bank Card <br />
            For A Modern World
          </h1>
          <p className="hero-description">
            This Modern Bank Card Embraces The Era Of Contactless Payments, Enabling 
            Swift And Effortless Transactions With Just A Tap Or Wave. No More Fumbling For 
            Cash Or Struggling With Outdated Payment Methods.
          </p>
          
          <div className="hero-actions">
            <button className="btn btn-primary">
              Explore More <ArrowRight size={18} style={{ marginLeft: '8px' }} />
            </button>
            
            <div className="hero-partners">
              <span>Precision</span>
              <span>MIT</span>
              <span>VisualBio</span>
              <span>Stretch</span>
            </div>
          </div>
        </div>
        
        <div className="hero-visual">
          {/* Abstract Card Design */}
          <div className="card-visual">
            <div className="card-top">
              <span className="card-name">Megan Lee</span>
              <div className="card-chip"></div>
            </div>
            <div className="card-number">
              4044 2424 0920 1179
            </div>
            <div className="card-date">
              10/29
            </div>
            <div className="card-pattern">
              {/* Mosaic Pattern generated via CSS/Grid */}
              {[...Array(64)].map((_, i) => (
                <div key={i} className={`pattern-dot dot-${i % 4}`}></div>
              ))}
            </div>
            <div className="card-logo"></div>
          </div>
          
          {/* Floating Elements for decor */}
          <div className="floating-shape shape-1"></div>
          <div className="floating-shape shape-2"></div>
          <div className="floating-shape shape-3"></div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
