import React from 'react';
import Navbar from '../components/landing/Navbar';
import Hero from '../components/landing/Hero';
import FeaturesGrid from '../components/landing/FeaturesGrid';
import AccountSection from '../components/landing/AccountSection';
import DistinctiveFeatures from '../components/landing/DistinctiveFeatures';
import Footer from '../components/landing/Footer';
import './Home.css'; // Leaving old one but overriding content

const Home = () => {
  return (
    <div className="home-page">
      <Navbar />
      <Hero />
      <FeaturesGrid />
      <AccountSection />
      <DistinctiveFeatures />
      <Footer />
    </div>
  );
};

export default Home;