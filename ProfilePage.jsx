import React, { useState, useEffect } from 'react';
import { User, Flame, Trophy, Shield, Sparkles, Target, Settings, Check, Edit2, Award, LogOut, Lock } from 'lucide-react';
import { updateDailyGoal, fetchDashboardStats } from '../services/api';

export default function ProfilePage({ user, onUpdateUser, onLogout }) {
  const [stats, setStats] = useState(null);
  const [dailyGoal, setDailyGoal] = useState(user?.dailyGoal || 3);
  const [isEditing, setIsEditing] = useState(false);
  const [defaultMode, setDefaultMode] = useState('AI Mode');
  const [savedNotice, setSavedNotice] = useState(false);

  useEffect(() => {
    loadUserStats();
  }, []);

  const loadUserStats = async () => {
    try {
      const data = await fetchDashboardStats();
      if (data) {
        setStats(data);
        if (data.user && onUpdateUser) {
          onUpdateUser(data.user);
        }
        if (data.dailyGoal) setDailyGoal(data.dailyGoal);
      }
    } catch (e) {
      console.warn("Error loading stats for profile:", e);
    }
  };

  const handleSaveGoal = async () => {
    try {
      await updateDailyGoal(dailyGoal);
      setIsEditing(false);
      setSavedNotice(true);
      setTimeout(() => setSavedNotice(false), 3000);
      loadUserStats();
    } catch (e) {
      console.error("Failed to update goal:", e);
    }
  };

  const activeUser = stats?.user || user;
  const solvedCount = stats?.solvedCount ?? activeUser?.solvedCount ?? 0;
  const streak = stats?.streak ?? activeUser?.streak ?? 0;
  const accuracy = stats?.accuracy ?? activeUser?.accuracy ?? 0;

  // Master Badge Definitions with Real Unlocking Criteria
  const allBadges = [
    {
      id: "first-step",
      title: "First Step",
      desc: "Successfully solved your first programming challenge",
      icon: "🚀",
      color: "from-cyan-500/20 to-blue-500/10 border-cyan-500/30",
      isEarned: solvedCount >= 1
    },
    {
      id: "solver-5",
      title: "Problem Solver 5",
      desc: "Successfully solved 5 unique coding problems",
      icon: "⭐",
      color: "from-purple-500/20 to-indigo-500/10 border-purple-500/30",
      isEarned: solvedCount >= 5
    },
    {
      id: "streak-master",
      title: "Streak Master",
      desc: "Maintained a 7-day daily coding streak",
      icon: "🔥",
      color: "from-amber-500/20 to-orange-500/10 border-amber-500/30",
      isEarned: streak >= 7
    },
    {
      id: "ai-veteran",
      title: "AI Mode Veteran",
      desc: "Solved 10+ problems using Guided AI Hints",
      icon: "✨",
      color: "from-cyan-500/20 to-blue-500/10 border-cyan-500/30",
      isEarned: solvedCount >= 10
    },
    {
      id: "precision-coder",
      title: "Precision Coder",
      desc: "Maintained 100% submission accuracy across 3+ problems",
      icon: "🎯",
      color: "from-emerald-500/20 to-teal-500/10 border-emerald-500/30",
      isEarned: accuracy === 100 && solvedCount >= 3
    }
  ];

  const earnedBadges = allBadges.filter(b => b.isEarned);
  const lockedBadges = allBadges.filter(b => !b.isEarned);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Profile Header Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-6">
        <img
          src={activeUser?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"}
          alt="Avatar"
          className="w-24 h-24 rounded-2xl object-cover ring-2 ring-cyan-500/50 shadow-xl"
        />
        <div className="space-y-2 text-center sm:text-left flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <h1 className="text-2xl font-extrabold text-white tracking-tight">{activeUser?.name || "Learner"}</h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-bold self-center sm:self-auto">
              PRO LEARNER
            </span>
          </div>
          <p className="text-xs text-slate-400">{activeUser?.email || "user@thinkpoint.dev"} • Joined {activeUser?.joinedDate || "Today"}</p>
          
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-3">
            <span className="flex items-center gap-1 text-xs text-amber-400 font-bold px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded-full">
              <Flame className="w-3.5 h-3.5 fill-amber-500" />
              {streak} Days Streak
            </span>
            <span className="flex items-center gap-1 text-xs text-emerald-400 font-bold px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-full">
              <Trophy className="w-3.5 h-3.5" />
              {solvedCount} Solved
            </span>
            {onLogout && (
              <button
                onClick={onLogout}
                className="flex items-center gap-1.5 text-xs text-rose-400 font-bold px-3 py-1 bg-rose-500/10 border border-rose-500/30 rounded-full hover:bg-rose-500/20 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                Log Out
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Preferences & Daily Goal Settings */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-6">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Settings className="w-5 h-5 text-cyan-400" />
          Platform Preferences & Goals
        </h2>

        {savedNotice && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs rounded-xl flex items-center gap-2 font-medium">
            <Check className="w-4 h-4" />
            <span>Preferences updated successfully!</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Daily Goal Configuration */}
          <div className="p-5 rounded-xl bg-slate-800/40 border border-slate-700/50 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Target Daily Problems</span>
              <button onClick={() => setIsEditing(!isEditing)} className="text-xs text-cyan-400 hover:underline">
                {isEditing ? "Cancel" : "Edit"}
              </button>
            </div>

            {isEditing ? (
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={dailyGoal}
                  onChange={(e) => setDailyGoal(e.target.value)}
                  className="w-20 px-3 py-1.5 bg-slate-900 border border-cyan-500 rounded-lg text-sm text-white font-mono"
                />
                <button
                  onClick={handleSaveGoal}
                  className="px-3 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-lg"
                >
                  Save Goal
                </button>
              </div>
            ) : (
              <div className="text-2xl font-extrabold text-white font-mono">{dailyGoal} Problems / Day</div>
            )}
            <p className="text-[11px] text-slate-400">Streak counter increases when you complete your daily target.</p>
          </div>

          {/* Default Mode Preference */}
          <div className="p-5 rounded-xl bg-slate-800/40 border border-slate-700/50 space-y-3">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">Default Workbench Mode</span>
            <select
              value={defaultMode}
              onChange={(e) => setDefaultMode(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
            >
              <option value="AI Mode">AI Mode (Proactive Hints & Error Assistance)</option>
              <option value="NON-AI Mode">NON-AI Mode (Competitive Practice)</option>
            </select>
            <p className="text-[11px] text-slate-400">Pre-selects mode when opening a problem solving workspace.</p>
          </div>

        </div>
      </div>

      {/* Badges & Achievements */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-6">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Award className="w-5 h-5 text-amber-400" />
          Skill Badges & Achievements
        </h2>

        {/* Section 1: Earned Badges */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Earned ({earnedBadges.length})</h3>
          {earnedBadges.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {earnedBadges.map((b) => (
                <div key={b.id} className={`p-4 rounded-xl bg-gradient-to-r ${b.color} border flex items-center justify-between`}>
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{b.icon}</span>
                    <div>
                      <h4 className="text-sm font-bold text-white">{b.title}</h4>
                      <p className="text-xs text-slate-400 mt-0.5">{b.desc}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                    EARNED
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-slate-800/30 border border-slate-800 text-xs text-slate-400 italic">
              No achievements earned yet. Solve your first problem to unlock badges!
            </div>
          )}
        </div>

        {/* Section 2: Locked Achievements */}
        {lockedBadges.length > 0 && (
          <div className="space-y-3 pt-4 border-t border-slate-800">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-slate-500" />
              Locked Achievements ({lockedBadges.length})
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 opacity-60">
              {lockedBadges.map((b) => (
                <div key={b.id} className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl grayscale">{b.icon}</span>
                    <div>
                      <h4 className="text-sm font-bold text-slate-300">{b.title}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">{b.desc}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-500 border border-slate-700 flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    LOCKED
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
