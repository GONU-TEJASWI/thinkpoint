const express = require('express');
const router = express.Router();
const problems = require('../data/problemsData');
const { executeCode } = require('../services/executor');
const { analyzeSubmission } = require('../services/aiService');
const { getCurrentUser } = require('./auth');

// Shared submissions database (in-memory)
const submissionsHistory = [];

function findProblemById(id) {
  if (!id) return null;
  const target = id.toLowerCase().trim();
  const targetClean = target.replace(/[^a-z0-9]/g, '');

  return problems.find(p => {
    const pId = p.id.toLowerCase();
    const pIdClean = pId.replace(/[^a-z0-9]/g, '');
    const pTitleClean = p.title.toLowerCase().replace(/[^a-z0-9]/g, '');

    return (
      pId === target ||
      pIdClean === targetClean ||
      pTitleClean === targetClean ||
      pId.replace(/-the-/g, '-') === target.replace(/-the-/g, '-') ||
      target.replace(/-the-/g, '-') === pId.replace(/-the-/g, '-') ||
      pId.replace(/^check-/, '') === target.replace(/^check-/, '')
    );
  });
}

// RUN endpoint: Sample test cases only (does NOT increment total submissions)
router.post('/run', (req, res) => {
  const { problemId, language, code, mode } = req.body;
  const problem = findProblemById(problemId);

  if (!problem) {
    return res.status(404).json({ error: "Problem not found" });
  }

  try {
    const executionResult = executeCode(language, code, problem, 'run');
    return res.json({
      type: 'run',
      mode: mode || 'AI Mode',
      ...executionResult
    });
  } catch (err) {
    return res.status(500).json({
      type: 'run',
      status: 'Compilation Error',
      error: err.message,
      results: []
    });
  }
});

// SUBMIT endpoint: Sample + Hidden test cases (creates real submission record)
router.post('/submit', async (req, res) => {
  const { problemId, language, code, mode } = req.body;
  const problem = findProblemById(problemId);

  if (!problem) {
    return res.status(404).json({ error: "Problem not found" });
  }

  try {
    const user = getCurrentUser();
    const executionResult = executeCode(language, code, problem, 'submit');

    // Generate Post-Submission AI Analysis if submission is Accepted
    let postAnalysis = null;
    if (executionResult.status === 'Accepted') {
      postAnalysis = await analyzeSubmission({
        problem,
        code,
        language,
        result: executionResult,
        mode: mode || 'AI Mode'
      });
    }

    // Save submission record tied to current user ID
    const submissionRecord = {
      id: `sub-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      userId: user ? user.id : 'user-default',
      problemId: problem.id,
      problemTitle: problem.title,
      difficulty: problem.difficulty,
      language,
      mode: mode || 'AI Mode',
      status: executionResult.status,
      runtimeMs: executionResult.runtimeMs,
      memoryMb: executionResult.memoryMb,
      submittedAt: new Date().toISOString(),
      code,
      passedCases: executionResult.passedCases,
      totalCases: executionResult.totalCases,
      results: executionResult.results,
      error: executionResult.error,
      postAnalysis
    };

    submissionsHistory.unshift(submissionRecord);

    return res.json({
      type: 'submit',
      submission: submissionRecord
    });
  } catch (err) {
    return res.status(500).json({
      type: 'submit',
      status: 'Compilation Error',
      error: err.message
    });
  }
});

module.exports = { router, submissionsHistory };
