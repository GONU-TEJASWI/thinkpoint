import React from 'react';

const STEPS = [
  { id: 'detect', label: 'DETECT' },
  { id: 'understand', label: 'UNDERSTAND' },
  { id: 'nudge', label: 'NUDGE' },
  { id: 'retry', label: 'RETRY' },
  { id: 'reflect', label: 'REFLECT' }
];

export default function ThinkingJourney({ currentStep = 'detect' }) {
  const getStepStatus = (stepId) => {
    if (stepId === 'nudge' && (currentStep === 'result' || currentStep === 'nudge')) {
      return 'focus';
    }
    if (stepId === currentStep) {
      return 'active';
    }
    const stepOrder = ['detect', 'understand', 'nudge', 'retry', 'reflect'];
    const currentIndex = stepOrder.indexOf(currentStep);
    const stepIndex = stepOrder.indexOf(stepId);

    if (currentStep === 'result') {
      return stepId === 'nudge' ? 'focus' : 'completed';
    }
    
    if (currentIndex !== -1 && stepIndex < currentIndex) {
      return 'completed';
    }
    return '';
  };

  return (
    <div className="journey-bar" aria-label="Learning Journey Progress">
      {STEPS.map((step, idx) => {
        const status = getStepStatus(step.id);
        return (
          <React.Fragment key={step.id}>
            <div className={`journey-step ${status}`}>
              <span>{step.label}</span>
            </div>
            {idx < STEPS.length - 1 && (
              <span className="journey-connector">→</span>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
