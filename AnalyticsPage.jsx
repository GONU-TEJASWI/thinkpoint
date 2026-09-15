import React, { useState, useEffect } from 'react';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, 
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid 
} from 'recharts';
import { BarChart3, TrendingUp, Zap, Brain, AlertCircle } from 'lucide-react';
import { fetchDashboardStats } from '../services/api';

export default function AnalyticsPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const data = await fetchDashboardStats();
      if (data) setStats(data);
    } catch (e) {
      console.warn("Analytics stats load error:", e);
    } finally {
      setLoading(false);
    }
  };

  const accuracy = stats?.accuracy ?? 0;
  const solvedCount = stats?.solvedCount ?? 0;
  const difficultyBreakdown = stats?.difficultyBreakdown || { easy: { solved: 0, total: 7 }, medium: { solved: 0, total: 2 }, hard: { solved: 0, total: 1 } };
  const topicProgress = stats?.topicProgress || [];

  const difficultyData = [
    { name: 'Easy', value: difficultyBreakdown.easy?.solved || 0, color: '#10b981' },
    { name: 'Medium', value: difficultyBreakdown.medium?.solved || 0, color: '#f59e0b' },
    { name: 'Hard', value: difficultyBreakdown.hard?.solved || 0, color: '#f43f5e' },
  ];

  const topicChartData = topicProgress.map(t => ({
    topic: t.topic,
    score: t.percentage || 0
  }));

  const strongestTopic = topicProgress.length > 0 
    ? [...topicProgress].sort((a, b) => b.percentage - a.percentage)[0]
    : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <BarChart3 className="w-7 h-7 text-cyan-400" />
          Progress & Learning Analytics
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Deep-dive analysis of your problem-solving accuracy, topic mastery, and submission metrics.
        </p>
      </div>

      {/* Top Highlight Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-medium uppercase">Overall Accuracy</span>
            <h3 className="text-2xl font-extrabold text-white font-mono mt-0.5">{accuracy}%</h3>
            <span className="text-[11px] text-slate-400">Recorded from real submissions</span>
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-medium uppercase">Unique Solved</span>
            <h3 className="text-2xl font-extrabold text-white font-mono mt-0.5">{solvedCount}</h3>
            <span className="text-[11px] text-emerald-400 font-semibold">Verified submissions</span>
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
            <Brain className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-medium uppercase">Strongest Topic</span>
            <h3 className="text-xl font-extrabold text-white font-mono mt-0.5">
              {strongestTopic ? strongestTopic.topic : "N/A"}
            </h3>
            <span className="text-[11px] text-amber-400 font-semibold">
              {strongestTopic ? `${strongestTopic.percentage}% Mastery` : "Solve problems to reveal"}
            </span>
          </div>
        </div>

      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Chart 1: Topic Mastery Scores */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h3 className="text-base font-bold text-white">Topic Mastery Breakdown</h3>
          <div className="h-64 w-full">
            {topicChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topicChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="topic" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" domain={[0, 100]} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', color: '#fff' }} />
                  <Bar dataKey="score" fill="#06b6d4" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-500 text-xs italic">
                No topic data available yet.
              </div>
            )}
          </div>
        </div>

        {/* Chart 2: Difficulty Distribution */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h3 className="text-base font-bold text-white">Solved Difficulty Distribution</h3>
          <div className="h-64 w-full flex items-center justify-center">
            {solvedCount > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={difficultyData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {difficultyData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', color: '#fff' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-500 text-xs italic">
                Solve your first problem to see difficulty distribution.
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
