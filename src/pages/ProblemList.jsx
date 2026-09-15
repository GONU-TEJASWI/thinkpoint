import React, { useState, useEffect } from 'react';
import { fetchProblems } from '../services/api';
import { Search, Filter, CheckCircle2, Circle, Clock, Tag, ChevronRight, Code2 } from 'lucide-react';

export default function ProblemList({ onSelectProblem }) {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('All');
  const [topicFilter, setTopicFilter] = useState('All');

  useEffect(() => {
    loadProblems();
  }, [search, difficultyFilter, topicFilter]);

  const loadProblems = async () => {
    try {
      setLoading(true);
      const data = await fetchProblems({
        search,
        difficulty: difficultyFilter,
        topic: topicFilter
      });
      setProblems(data.problems || []);
    } catch (e) {
      console.error("Error loading problems:", e);
    } finally {
      setLoading(false);
    }
  };

  const topicsList = ["All", "Arrays", "Strings", "Hash Table", "Dynamic Programming", "Two Pointers", "Stack", "Sliding Window", "Binary Search"];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Code2 className="w-7 h-7 text-cyan-400" />
            Problem Library
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Choose a challenge and select your preferred practice mode (<strong className="text-cyan-400">AI Mode</strong> or <strong className="text-slate-300">NON-AI Mode</strong>).
          </p>
        </div>
      </div>

      {/* Filter Controls Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
        
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search problems or topics..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 transition-colors"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
          
          {/* Difficulty Dropdown */}
          <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-300">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span>Difficulty:</span>
            <select
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value)}
              className="bg-transparent text-white font-semibold focus:outline-none cursor-pointer"
            >
              <option value="All" className="bg-slate-900 text-white">All Difficulties</option>
              <option value="Easy" className="bg-slate-900 text-emerald-400">Easy</option>
              <option value="Medium" className="bg-slate-900 text-amber-400">Medium</option>
              <option value="Hard" className="bg-slate-900 text-rose-400">Hard</option>
            </select>
          </div>

          {/* Topic Dropdown */}
          <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-300">
            <Tag className="w-3.5 h-3.5 text-slate-400" />
            <span>Topic:</span>
            <select
              value={topicFilter}
              onChange={(e) => setTopicFilter(e.target.value)}
              className="bg-transparent text-white font-semibold focus:outline-none cursor-pointer"
            >
              {topicsList.map((t, idx) => (
                <option key={idx} value={t} className="bg-slate-900 text-white">{t}</option>
              ))}
            </select>
          </div>

        </div>

      </div>

      {/* Problem Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-12 text-center text-slate-400">
            <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            Loading problem set...
          </div>
        ) : problems.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            No problems found matching your filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-slate-400 uppercase text-xs bg-slate-800/60 border-b border-slate-800">
                <tr>
                  <th className="px-6 py-4 w-16">Status</th>
                  <th className="px-6 py-4">Title</th>
                  <th className="px-6 py-4">Difficulty</th>
                  <th className="px-6 py-4">Topics</th>
                  <th className="px-6 py-4">Acceptance</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {problems.map((prob) => (
                  <tr
                    key={prob.id}
                    onClick={() => onSelectProblem(prob.id)}
                    className="hover:bg-slate-800/40 transition-colors cursor-pointer group"
                  >
                    {/* Solved Status Icon */}
                    <td className="px-6 py-4">
                      {prob.solvedStatus === 'Solved' ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" title="Solved" />
                      ) : prob.solvedStatus === 'Attempted' ? (
                        <Clock className="w-5 h-5 text-amber-400" title="Attempted" />
                      ) : (
                        <Circle className="w-5 h-5 text-slate-600" title="Unsolved" />
                      )}
                    </td>

                    {/* Title */}
                    <td className="px-6 py-4 font-semibold text-white group-hover:text-cyan-400 transition-colors">
                      {prob.title}
                    </td>

                    {/* Difficulty Badge */}
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-lg text-xs font-bold ${
                          prob.difficulty === 'Easy'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : prob.difficulty === 'Medium'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                        }`}
                      >
                        {prob.difficulty}
                      </span>
                    </td>

                    {/* Topic Tags */}
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1.5">
                        {prob.topics.map((t, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded bg-slate-800 text-[11px] font-medium text-slate-400 border border-slate-700"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Acceptance % */}
                    <td className="px-6 py-4 font-mono text-slate-300 text-xs">
                      {prob.acceptanceRate}
                    </td>

                    {/* Action Button */}
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectProblem(prob.id);
                        }}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 group-hover:bg-cyan-500 group-hover:text-slate-950 text-cyan-400 font-semibold text-xs transition-all"
                      >
                        <span>Solve</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
