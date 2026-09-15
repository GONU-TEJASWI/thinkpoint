import React, { useState, useEffect } from 'react';
import { fetchSubmissions } from '../services/api';
import { History, Filter, CheckCircle2, XCircle, Clock, Eye, Code2 } from 'lucide-react';

export default function SubmissionHistory({ onSelectProblem }) {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [modeFilter, setModeFilter] = useState('All');
  const [selectedSub, setSelectedSub] = useState(null);

  useEffect(() => {
    loadSubmissions();
  }, [statusFilter, modeFilter]);

  const loadSubmissions = async () => {
    try {
      setLoading(true);
      const data = await fetchSubmissions({
        status: statusFilter,
        mode: modeFilter
      });
      setSubmissions(data.submissions || []);
    } catch (e) {
      console.error("Error loading submissions:", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <History className="w-7 h-7 text-cyan-400" />
            Submission History
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Review past solution attempts, execution runtimes, and post-submission AI solution analysis.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex items-center gap-3">
          
          <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-300">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span>Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-white font-semibold focus:outline-none cursor-pointer"
            >
              <option value="All" className="bg-slate-900">All Verdicts</option>
              <option value="Accepted" className="bg-slate-900 text-emerald-400">Accepted</option>
              <option value="Wrong Answer" className="bg-slate-900 text-rose-400">Wrong Answer</option>
              <option value="Compilation Error" className="bg-slate-900 text-amber-400">Compilation Error</option>
            </select>
          </div>

          <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-300">
            <span>Mode:</span>
            <select
              value={modeFilter}
              onChange={(e) => setModeFilter(e.target.value)}
              className="bg-transparent text-white font-semibold focus:outline-none cursor-pointer"
            >
              <option value="All" className="bg-slate-900">All Modes</option>
              <option value="AI Mode" className="bg-slate-900 text-cyan-400">AI Mode</option>
              <option value="NON-AI Mode" className="bg-slate-900 text-slate-300">NON-AI Mode</option>
            </select>
          </div>

        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-12 text-center text-slate-400">Loading submission log...</div>
        ) : submissions.length === 0 ? (
          <div className="p-12 text-center text-slate-400">No submissions found matching filters.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-slate-400 uppercase bg-slate-800/60 border-b border-slate-800">
                <tr>
                  <th className="px-6 py-4">Submission ID</th>
                  <th className="px-6 py-4">Problem</th>
                  <th className="px-6 py-4">Verdict</th>
                  <th className="px-6 py-4">Language</th>
                  <th className="px-6 py-4">Mode</th>
                  <th className="px-6 py-4">Runtime</th>
                  <th className="px-6 py-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {submissions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4 font-mono text-slate-400">{sub.id}</td>
                    <td className="px-6 py-4 font-bold text-white">{sub.problemTitle}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded font-bold ${
                        sub.status === 'Accepted' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                      }`}>
                        {sub.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono capitalize">{sub.language}</td>
                    <td className="px-6 py-4">{sub.mode}</td>
                    <td className="px-6 py-4 font-mono">{sub.runtimeMs} ms</td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setSelectedSub(sub)}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-400 font-semibold"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Submission Details Modal */}
      {selectedSub && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-2xl max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-base">Submission Details: {selectedSub.problemTitle}</h3>
              <button onClick={() => setSelectedSub(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs font-mono bg-slate-800/40 p-3 rounded-xl">
              <div>Status: <span className="text-emerald-400 font-bold">{selectedSub.status}</span></div>
              <div>Language: {selectedSub.language}</div>
              <div>Mode: {selectedSub.mode}</div>
              <div>Runtime: {selectedSub.runtimeMs} ms</div>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-400 uppercase">Submitted Code</span>
              <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-cyan-300 overflow-x-auto">
                {selectedSub.code}
              </pre>
            </div>

            {selectedSub.postAnalysis && (
              <div className="p-4 rounded-xl bg-cyan-950/30 border border-cyan-500/20 text-xs space-y-2">
                <h4 className="font-bold text-cyan-400">Post-Submission AI Solution Review</h4>
                <p className="text-slate-300">{selectedSub.postAnalysis.approachExplanation}</p>
                <div className="flex gap-4 text-slate-400 font-mono">
                  <span>Time: {selectedSub.postAnalysis.timeComplexity}</span>
                  <span>Space: {selectedSub.postAnalysis.spaceComplexity}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
