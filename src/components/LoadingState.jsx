import React from 'react';
import { Compass } from 'lucide-react';
import ThinkingJourney from './ThinkingJourney';

export default function LoadingState() {
  return (
    <div className="main-content">
      <ThinkingJourney currentStep="understand" />

      <div className="loading-container">
        <div className="loading-pulse-ring">
          <Compass size={32} className="spin-icon" />
        </div>
        <h2 className="loading-title">Finding your ThinkPoint...</h2>
        <p className="loading-subtext">
          Understanding where your thinking is getting stuck.
        </p>
      </div>
    </div>
  );
}
