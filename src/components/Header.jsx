import React from 'react';
import { Lightbulb, User } from 'lucide-react';

export default function Header() {
  return (
    <header className="header">
      <a href="#" className="header-logo">
        <span className="logo-badge">
          <Lightbulb size={18} />
        </span>
        <span>THINKPOINT</span>
      </a>

      <nav className="header-nav">
        <a href="#practice" className="nav-link active">Practice</a>
        <a href="#progress" className="nav-link">Progress</a>

        <div className="student-indicator">
          <span className="student-avatar">
            <User size={13} />
          </span>
          <span>Student</span>
        </div>
      </nav>
    </header>
  );
}
