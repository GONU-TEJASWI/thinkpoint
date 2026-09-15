import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import ThinkingJourney from './ThinkingJourney';

export default function ProblemInput({ 
  problemText, 
  setProblemText, 
  onSubmit, 
  isLoading 
}) {
  const handleSubmit = (e) => {
    e.preventDefault();
    if (problemText.trim() && !isLoading) {
      onSubmit(problemText);
    }
  };

  const isSubmitDisabled = !problemText.trim() || isLoading;

  return (
    <div className="main-content">
      <div className="hero-section">
        <div className="hero-tag">
          <Sparkles size={13} />
          <span>Independent Learning Companion</span>
        </div>
        <h1 className="hero-title">Think better.<br />Learn independently.</h1>
        <p className="hero-subtitle">
          Get the right nudge when you're stuck — not the answer.
        </p>
      </div>

      <ThinkingJourney currentStep="detect" />

      <form className="input-card" onSubmit={handleSubmit}>
        <label htmlFor="problem-input" className="input-label">
          What are you working through?
        </label>
        <textarea
          id="problem-input"
          className="problem-textarea"
          value={problemText}
          onChange={(e) => setProblemText(e.target.value)}
          placeholder="Describe a problem, question, or concept you're stuck on..."
          disabled={isLoading}
        />

        <div className="input-actions">
          <button 
            type="submit" 
            className="submit-btn"
            disabled={isSubmitDisabled}
          >
            <span>Find My ThinkPoint</span>
            <ArrowRight size={18} />
          </button>

          <p className="input-guarantee">
            THINKPOINT helps you continue thinking instead of solving the problem for you.
          </p>
        </div>
      </form>
    </div>
  );
}
