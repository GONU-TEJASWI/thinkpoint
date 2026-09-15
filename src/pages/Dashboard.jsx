import React, { useState, useEffect } from 'react';
import { fetchDashboardStats, updateDailyGoal } from '../services/api';
import { 
  Trophy, CheckCircle2, FileText, Target, Flame, 
  ArrowUpRight, Sparkles, Clock, ChevronRight, BarChart2, Edit2, Check, AlertCircle 
} from 'lucide-react';

const defaultStats = {
  solvedCount: 0,
  totalSubmissions: 0,
  accuracy: 0,
  streak: 0,
  dailyGoal: 3,
  solvedToday: 0,
  difficultyBreakdown: {
    easy: { solved: 0, total: 7 },
    medium: { solved: 0, total: 2 },
    hard: { solved: 0, total: 1 }
  },
  topicProgress: [],
  recentSubmissions: []
};

export default function Dashboard({ onSelectProblem, onNavigate, onUpdateUser }) {
  const [stats, setStats] = useState(defaultStats);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(false);
  const [editingGoal, setEditingGoal] = useState(false);
  const [goalInput, setGoalInput] = useState(3);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      setApiError(false);
      const data = await fetchDashboardStats();
      if (data && typeof data === 'object') {
        setStats(data);
        if (data.user && onUpdateUser) {
          onUpdateUser(data.user);
        }
        setGoalInput(data.dailyGoal || 3);
      } else {
        setStats(defaultStats);
      }
    } catch (e) {
      console.warn("API Error loading dashboard stats:", e.message);
      setApiError(true);
      setStats(defaultStats);
    } finally {
      setLoading(false);
    }
  };

  const handleGoalSave = async () => {
    try {
      const res = await updateDailyGoal(goalInput);
      if (res && res.success) {
        setStats(prev => ({ ...prev, dailyGoal: Number(goalInput) }));
        setEditingGoal(false);
      }
    } catch (e) {
      console.error("Error updating goal:", e);
      setStats(prev => ({ ...prev, dailyGoal: Number(goalInput) }));
      setEditingGoal(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh] text-slate-400">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-medium">Loading THINKPOINT Dashboard...</p>
        </div>
      </div>
    );
  }

  const currentStats = stats || defaultStats;
  const solvedCount = currentStats.solvedCount ?? 0;
  const totalSubmissions = currentStats.totalSubmissions ?? 0;
  const accuracy = currentStats.accuracy ?? 0;
  const streak = currentStats.streak ?? 0;
  const dailyGoal = currentStats.dailyGoal ?? 3;
  const solvedToday = currentStats.solvedToday ?? 0;
  const difficultyBreakdown = currentStats.difficultyBreakdown || defaultStats.difficultyBreakdown;
  const topicProgress = currentStats.topicProgress || defaultStats.topicProgress;
  const recentSubmissions = currentStats.recentSubmissions || [];

  const totalAvailable = (difficultyBreakdown.easy?.total || 0) + (difficultyBreakdown.medium?.total || 0) + (difficultyBreakdown.hard?.total || 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Warning Notice if API error occurs */}
      {apiError && (
        <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400" />
            <span>Backend statistics service is synchronizing.</span>
          </div>
          <button onClick={loadStats} className="underline font-bold text-amber-200">Retry</button>
        </div>
      )}

      {/* Banner / Welcome */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-700/60 p-6 sm:p-8">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              Welcome Back to THINKPOINT
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Ready to solve your next coding challenge?
            </h1>
            <p className="text-sm text-slate-400 mt-2 max-w-xl">
              Toggle between <strong className="text-cyan-400">AI Mode</strong> for real-time pedagogical hints and <strong className="text-slate-200">NON-AI Mode</strong> for competitive practice.
            </p>
          </div>
          <button
            onClick={() => onNavigate('problems')}
            className="self-start md:self-center flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold shadow-lg shadow-cyan-500/25 transition-all transform hover:-translate-y-0.5"
          >
            <span>Explore Problems</span>
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Card 1: Solved */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Problems Solved</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-white tracking-tight">{solvedCount}</span>
            <span className="text-xs text-slate-400">Total Available: {totalAvailable}</span>
          </div>
          <div className="mt-3 w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${totalAvailable > 0 ? Math.min((solvedCount / totalAvailable) * 100, 100) : 0}%` }}></div>
          </div>
        </div>

        {/* Card 2: Submissions */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total Submissions</span>
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-white tracking-tight">{totalSubmissions}</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-3">Recorded across all modes</p>
        </div>

        {/* Card 3: Accuracy */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Accuracy Rate</span>
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
              <Trophy className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-white tracking-tight">{accuracy}%</span>
          </div>
          <div className="mt-3 w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div className="bg-cyan-400 h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(accuracy, 100)}%` }}></div>
          </div>
        </div>

        {/* Card 4: Daily Streak */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Current Streak</span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Flame className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-amber-400 tracking-tight">{streak} Days</span>
            {streak > 0 && <span className="text-xs text-amber-500 font-semibold">Active 🔥</span>}
          </div>
          <p className="text-[11px] text-slate-500 mt-3">Solve 1 problem daily to keep it!</p>
        </div>

      </div>

      {/* Main Section: Progress & Daily Goal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Cols: Easy/Medium/Hard + Topic Progress */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Difficulty Progress Card */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <BarChart2 className="w-5 h-5 text-cyan-400" />
                Difficulty Progress
              </h2>
              <span className="text-xs text-slate-400">Total Solved: {solvedCount}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* Easy */}
              <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-emerald-400 uppercase">Easy</span>
                  <span className="text-xs text-slate-300 font-mono">
                    {difficultyBreakdown.easy?.solved || 0} / {difficultyBreakdown.easy?.total || 0}
                  </span>
                </div>
                <div className="w-full bg-slate-700/60 rounded-full h-2 overflow-hidden mb-2">
                  <div 
                    className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
                    style={{ width: `${difficultyBreakdown.easy?.total > 0 ? Math.min((difficultyBreakdown.easy.solved / difficultyBreakdown.easy.total) * 100, 100) : 0}%` }}
                  ></div>
                </div>
                <p className="text-[11px] text-slate-400">
                  {difficultyBreakdown.easy?.total > 0 ? Math.round((difficultyBreakdown.easy.solved / difficultyBreakdown.easy.total) * 100) : 0}% Mastered
                </p>
              </div>

              {/* Medium */}
              <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-amber-400 uppercase">Medium</span>
                  <span className="text-xs text-slate-300 font-mono">
                    {difficultyBreakdown.medium?.solved || 0} / {difficultyBreakdown.medium?.total || 0}
                  </span>
                </div>
                <div className="w-full bg-slate-700/60 rounded-full h-2 overflow-hidden mb-2">
                  <div 
                    className="bg-amber-500 h-full rounded-full transition-all duration-500" 
                    style={{ width: `${difficultyBreakdown.medium?.total > 0 ? Math.min((difficultyBreakdown.medium.solved / difficultyBreakdown.medium.total) * 100, 100) : 0}%` }}
                  ></div>
                </div>
                <p className="text-[11px] text-slate-400">
                  {difficultyBreakdown.medium?.total > 0 ? Math.round((difficultyBreakdown.medium.solved / difficultyBreakdown.medium.total) * 100) : 0}% Mastered
                </p>
              </div>

              {/* Hard */}
              <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-rose-400 uppercase">Hard</span>
                  <span className="text-xs text-slate-300 font-mono">
                    {difficultyBreakdown.hard?.solved || 0} / {difficultyBreakdown.hard?.total || 0}
                  </span>
                </div>
                <div className="w-full bg-slate-700/60 rounded-full h-2 overflow-hidden mb-2">
                  <div 
                    className="bg-rose-500 h-full rounded-full transition-all duration-500" 
                    style={{ width: `${difficultyBreakdown.hard?.total > 0 ? Math.min((difficultyBreakdown.hard.solved / difficultyBreakdown.hard.total) * 100, 100) : 0}%` }}
                  ></div>
                </div>
                <p className="text-[11px] text-slate-400">
                  {difficultyBreakdown.hard?.total > 0 ? Math.round((difficultyBreakdown.hard.solved / difficultyBreakdown.hard.total) * 100) : 0}% Mastered
                </p>
              </div>

            </div>
          </div>

          {/* Topic-Wise Progress */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-base font-bold text-white mb-6">Topic-Wise Progress</h2>
            {topicProgress && topicProgress.length > 0 ? (
              <div className="space-y-4">
                {topicProgress.map((item, idx) => (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-200">{item.topic}</span>
                      <span className="text-slate-400 font-mono">{item.solved} / {item.total} ({item.percentage}%)</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(item.percentage, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">No topic data available yet.</p>
            )}
          </div>

        </div>

        {/* Right Col: Daily Coding Goal Widget + Quick Recommendation */}
        <div className="space-y-6">
          
          {/* Daily Goal Card */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-bold text-white">Daily Coding Goal</h3>
              </div>
              <button 
                onClick={() => setEditingGoal(!editingGoal)}
                className="text-xs text-slate-400 hover:text-cyan-400 flex items-center gap-1"
              >
                {editingGoal ? <Check className="w-3.5 h-3.5" /> : <Edit2 className="w-3.5 h-3.5" />}
                {editingGoal ? "Cancel" : "Edit"}
              </button>
            </div>

            <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/50 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 block">Today's Target</span>
                {editingGoal ? (
                  <div className="flex items-center gap-2 mt-1">
                    <input 
                      type="number"
                      min="1"
                      max="10"
                      value={goalInput}
                      onChange={(e) => setGoalInput(e.target.value)}
                      className="w-16 px-2 py-1 bg-slate-900 border border-cyan-500 rounded text-sm text-white font-mono"
                    />
                    <button 
                      onClick={handleGoalSave}
                      className="px-2.5 py-1 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded"
                    >
                      Save
                    </button>
                  </div>
                ) : (
                  <span className="text-xl font-extrabold text-white font-mono">
                    {solvedToday} / {dailyGoal} Problems
                  </span>
                )}
              </div>

              <div className="w-12 h-12 rounded-full border-4 border-cyan-500 flex items-center justify-center text-xs font-bold text-cyan-400 font-mono">
                {Math.min(100, Math.round((solvedToday / Math.max(1, dailyGoal)) * 100))}%
              </div>
            </div>

            <p className="text-xs text-slate-400">
              {solvedToday >= dailyGoal 
                ? "🎉 Daily goal completed! Keep going!"
                : `Solve ${dailyGoal - solvedToday} more problem${(dailyGoal - solvedToday) === 1 ? '' : 's'} today to reach your daily milestone!`
              }
            </p>
          </div>

          {/* Quick Problem Recommendation */}
          <div className="bg-gradient-to-b from-slate-900 to-slate-900/80 border border-cyan-500/20 rounded-2xl p-6">
            <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/30">
              RECOMMENDED FOR YOU
            </span>
            <h4 className="text-base font-bold text-white mt-3">Add Two Numbers</h4>
            <p className="text-xs text-slate-400 mt-1 line-clamp-2">
              Given two numbers, calculate and return their sum. Great beginner exercise.
            </p>
            <div className="flex items-center gap-2 mt-4">
              <span className="text-[11px] font-semibold text-emerald-400 px-2 py-0.5 bg-emerald-500/10 rounded">Easy</span>
              <span className="text-[11px] text-slate-400">95.5% Acceptance</span>
            </div>
            <button
              onClick={() => onSelectProblem('add-two-numbers')}
              className="mt-5 w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <span>Start Solving</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>

      {/* Recent Submissions Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-cyan-400" />
            Recent Submissions
          </h3>
          <button 
            onClick={() => onNavigate('submissions')}
            className="text-xs text-cyan-400 hover:underline font-medium"
          >
            View All Submissions →
          </button>
        </div>

        <div className="overflow-x-auto">
          {recentSubmissions.length > 0 ? (
            <table className="w-full text-left text-xs">
              <thead className="text-slate-400 uppercase bg-slate-800/40 border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">Problem</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Language</th>
                  <th className="px-4 py-3">Mode</th>
                  <th className="px-4 py-3">Runtime</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {recentSubmissions.map((sub, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-4 py-3.5 font-semibold text-white">
                      {sub.problemTitle}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        sub.status === 'Accepted' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                      }`}>
                        {sub.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 font-mono capitalize">{sub.language}</td>
                    <td className="px-4 py-3.5">{sub.mode}</td>
                    <td className="px-4 py-3.5 font-mono">{sub.runtimeMs} ms</td>
                    <td className="px-4 py-3.5 text-right">
                      <button 
                        onClick={() => onSelectProblem(sub.problemId)}
                        className="text-cyan-400 hover:text-cyan-300 font-medium"
                      >
                        Open Code
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-xs text-slate-400 py-4 italic">No recent submissions recorded yet.</p>
          )}
        </div>
      </div>

    </div>
  );
}
