import React from 'react';

export default function SplashScreen({ isExiting }) {
  return (
    <div className={`splash-container ${isExiting ? 'exiting' : ''}`}>
      <div className="splash-content">
        <div className="splash-logo-wrapper">
          <img src="/images/intrologo.png" alt="FreshLync Logo" className="splash-logo" />
        </div>

        <div className="splash-loader-track">
          <div className="splash-loader-bar" />
        </div>
      </div>
    </div>
  );
}
