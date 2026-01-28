import React, { useState } from 'react';
import './DistinctiveFeatures.css';

const DistinctiveFeatures = () => {
  const [activeFeature, setActiveFeature] = useState(0);

  const features = [
    { id: 1, label: "Personalization Features" },
    { id: 2, label: "Ease Of Use" },
    { id: 3, label: "User Friendly Cards" },
    { id: 4, label: "Low Fee" },
    { id: 5, label: "Broad Acceptance" }
  ];

  return (
    <section className="distinctive-section">
      <div className="container distinctive-container">
        <div className="distinctive-content">
          <h2 className="section-title">
            What Features Make Our <br />
            <span className="toggle-pill">
              From 2020 <div className="toggle-dot"></div>
            </span> Bank Card <span className="text-purple">Distinctive</span> <br />
            And <span className="text-purple">Popular</span> ?
          </h2>
          
          <p className="section-description">
            According To The Needs Of Users And Different Strata, We Have Provided A New 
            Bank Card That Can Be The Answer To All Your Needs.
          </p>
          
          <div className="features-list">
            <div className="list-column">
              {features.slice(0, 3).map((feature, idx) => (
                <div key={idx} className="feature-item">
                  <div className="feature-number">{feature.id}</div>
                  <span className="feature-label">{feature.label}</span>
                </div>
              ))}
            </div>
            <div className="list-column">
              {features.slice(3).map((feature, idx) => (
                <div key={idx} className="feature-item">
                  <div className="feature-number">{feature.id}</div>
                  <span className="feature-label">{feature.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="distinctive-visual">
          <div className="circular-graphic">
            <div className="center-circle">
              <div className="mini-dots"></div>
              <div className="mini-dots inverted"></div>
            </div>
            
            {/* Orbital dots */}
            {[...Array(24)].map((_, i) => (
              <div 
                key={i} 
                className="orbital-dot" 
                style={{ 
                  transform: `rotate(${i * 15}deg) translateX(140px)` 
                }}
              ></div>
            ))}

            {/* Connecting lines illustration */}
            <div className="connector-line line-1"></div>
            <div className="connector-line line-2"></div>
            <div className="connector-dot dot-1"></div>
            <div className="connector-dot dot-2"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DistinctiveFeatures;
