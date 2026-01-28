import React from 'react';
import { User, Briefcase, ArrowRight } from 'lucide-react';
import './AccountSection.css';

const AccountSection = () => {
  return (
    <section className="account-section">
      <div className="container">
        <h2 className="section-title text-center mb-16">
          Up-To-Date and Fast Banking <br />
          Services In One Place
        </h2>

        <div className="account-cards">
          {/* Card 1 */}
          <div className="account-card">
            <h3 className="card-heading">Types Of Business And <br />Personal Accounts</h3>
            <p className="card-txt">
              You Can Open Any Type Of Account, Including Personal And Business, 
              And Use All The Services.
            </p>
            <div className="visual-graphic graph-1">
              <div className="hex-grid">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="hex"></div>
                ))}
              </div>
            </div>
          </div>

          {/* Card 2 */}
          <div className="account-card">
            <h3 className="card-heading">Opening Of Essential Bank Account</h3>
            <p className="card-txt">
              It Is Possible To Open An Account Online In Just Two Clicks.
            </p>
            <div className="visual-graphic graph-2">
              <div className="connection-flow">
                <div className="node user"><User size={20} /></div>
                <div className="line"></div>
                <div className="node medium"></div>
                <div className="line"></div>
                <div className="card-rect">
                  <div className="chip-mini"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Card 3 */}
          <div className="account-card">
            <h3 className="card-heading">Information And Data Account</h3>
            <p className="card-txt">
              Practical Solutions And Use Of Modern Technologies.
            </p>
            <div className="visual-graphic graph-3">
              <div className="data-bars">
                <div className="bar bar-1"></div>
                <div className="bar bar-2"></div>
                <div className="bar bar-3"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AccountSection;
