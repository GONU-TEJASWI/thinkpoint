import React from 'react';
import { RotateCcw, PlusCircle } from 'lucide-react';
import ThinkingJourney from './ThinkingJourney';
import ResultSection from './ResultSection';

export default function ThinkingResult({ 
  problemText, 
  resultData, 
  onTryAgain, 
  onNewProblem 
}) {
  return (
    <div className="main-content">
      <div className="result-container">
        <div className="result-header">
          <p className="result-header-title">THINKPOINT RESULT</p>
        </div>

        <div className="original-problem-card">
          <p className="original-problem-label">Your Problem</p>
          <p className="original-problem-text">"{problemText}"</p>
        </div>

        <ThinkingJourney currentStep="result" />

        <div className="sections-list">
          <ResultSection
            number="01"
            title="Thinking Point"
            content={resultData.thinkingPoint}
          />
          <ResultSection
            number="02"
            title="What I Notice"
            content={resultData.whatINotice}
          />
          <ResultSection
            number="03"
            title="Small Nudge"
            content={resultData.smallNudge}
            isFocus={true}
          />
          <ResultSection
            number="04"
            title="Try Again"
            content={resultData.tryAgain}
          />
          <ResultSection
            number="05"
            title="Reflection"
            content={resultData.reflection}
          />
        </div>

        <div className="result-actions">
          <button 
            type="button" 
            className="btn-secondary" 
            onClick={onTryAgain}
          >
            <RotateCcw size={16} />
            <span>Try Again</span>
          </button>
          <button 
            type="button" 
            className="btn-primary" 
            onClick={onNewProblem}
          >
            <PlusCircle size={16} />
            <span>New Problem</span>
          </button>
        </div>
      </div>
    </div>
  );
}
