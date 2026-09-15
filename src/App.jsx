import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import ProblemList from './pages/ProblemList';
import ProblemSolvingPage from './pages/ProblemSolvingPage';
import SubmissionHistory from './pages/SubmissionHistory';
import AnalyticsPage from './pages/AnalyticsPage';
import ProfilePage from './pages/ProfilePage';
import AuthPage from './pages/AuthPage';
import { fetchUserProfile } from './services/api';

export default function App() {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('thinkpoint_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const [activeTab, setActiveTab] = useState(() => (user ? 'dashboard' : 'auth'));
  const [selectedProblemId, setSelectedProblemId] = useState('two-sum');

  useEffect(() => {
    if (user) {
      localStorage.setItem('thinkpoint_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('thinkpoint_user');
      setActiveTab('auth');
    }
  }, [user]);

  const handleLoginSuccess = (loggedUser) => {
    setUser(loggedUser);
    localStorage.setItem('thinkpoint_user', JSON.stringify(loggedUser));
    setActiveTab('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('thinkpoint_user');
    setActiveTab('auth');
  };

  const handleSelectProblem = (problemId) => {
    setSelectedProblemId(problemId);
    setActiveTab('solve');
  };

  // PROTECTED ROUTE GUARD: If unauthenticated, ALWAYS render AuthPage FIRST
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500 selection:text-slate-950 flex flex-col justify-center py-12">
        <AuthPage onLoginSuccess={handleLoginSuccess} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500 selection:text-slate-950 flex flex-col">
      {/* Top Navbar Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        onLogout={handleLogout}
      />

      {/* Main View Area */}
      <main className="flex-1">
        {activeTab === 'dashboard' && (
          <Dashboard
            onSelectProblem={handleSelectProblem}
            onNavigate={(tab) => setActiveTab(tab)}
            onUpdateUser={(u) => setUser(prev => ({ ...prev, ...u }))}
          />
        )}

        {activeTab === 'problems' && (
          <ProblemList onSelectProblem={handleSelectProblem} />
        )}

        {activeTab === 'solve' && (
          <ProblemSolvingPage
            problemId={selectedProblemId}
            onBack={() => setActiveTab('problems')}
          />
        )}

        {activeTab === 'submissions' && (
          <SubmissionHistory onSelectProblem={handleSelectProblem} />
        )}

        {activeTab === 'analytics' && <AnalyticsPage />}

        {activeTab === 'profile' && (
          <ProfilePage
            user={user}
            onUpdateUser={(u) => setUser(u)}
            onLogout={handleLogout}
          />
        )}

        {activeTab === 'auth' && (
          <AuthPage onLoginSuccess={handleLoginSuccess} />
        )}
      </main>

      {/* Modern Footer */}
      {activeTab !== 'solve' && (
        <footer className="border-t border-slate-800 bg-slate-900/60 py-6 text-center text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-slate-300 font-mono">THINKPOINT</span>
              <span>— AI-Assisted Competitive Programming Platform</span>
            </div>
            <div>
              <span>Powered by Node REST API & Monaco Editor • OpenRouter AI Enabled</span>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}
