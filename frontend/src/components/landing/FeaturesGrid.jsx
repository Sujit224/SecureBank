import React from 'react';
import { Globe, Shield, Smartphone, Zap, CreditCard, LayoutGrid } from 'lucide-react';
import './FeaturesGrid.css';

const FeaturesGrid = () => {
  const features = [
    {
      icon: <Zap size={32} />,
      title: "Simultaneous And Fast Operation",
      description: "Experience banking at the speed of life with instant transactions."
    },
    {
      icon: <LayoutGrid size={32} />,
      title: "Can Be Connected To All Accounts",
      description: "Manage all your financial assets from a single interface."
    },
    {
      icon: <Shield size={32} />,
      title: "Strong And Advanced Encryption",
      description: "Your data is protected by military-grade security protocols."
    },
    {
      icon: <Smartphone size={32} />,
      title: "Comprehensive Electronic Banking Services",
      description: "Full banking functionality right in your pocket."
    }
  ];

  return (
    <section className="features-grid-section">
      <div className="container">
        <div className="features-header">
          <h2 className="section-title">
            We Tried To Provide You <br />
            With All Global Banking <br />
            Services
          </h2>
          <p className="section-description">
            We Made Every Effort To Ensure That You Have Access To A 
            Comprehensive Range Of Global Banking Services. Our Aim Was To 
            Provide You With A Seamless Banking Experience That Caters To Your 
            Financial Needs Regardless Of Your Location.
            <br /><br />
            <button className="btn btn-dark" style={{ borderRadius: '50px', padding: '12px 32px' }}>
              Explore More →
            </button>
          </p>
        </div>

        <div className="features-grid">
          {features.map((feature, index) => (
            <div key={index} className="feature-card">
              <div className="feature-title-area">
                <h3>{feature.title}</h3>
              </div>
              <div className="feature-visual">
                <div className="feature-icon-circle">
                  {feature.icon}
                </div>
                {/* Decorative rings */}
                <div className="ring ring-1"></div>
                <div className="ring ring-2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesGrid;
