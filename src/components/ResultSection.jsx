import React from 'react';

export default function ResultSection({ number, title, content, isFocus = false }) {
  if (!content) return null;

  return (
    <div className={`section-card ${isFocus ? 'nudge-focus' : ''}`}>
      {isFocus && <div className="nudge-badge">Core Intervention</div>}
      <div className="section-card-header">
        <span className="section-number">{number}</span>
        <h3 className="section-title">{title}</h3>
      </div>
      <div className="section-body">
        {content}
      </div>
    </div>
  );
}
