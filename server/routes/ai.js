const express = require('express');
const router = express.Router();
const problems = require('../data/problemsData');
const { getSyntaxHint, chatWithAI, getStuckHint, analyzeSubmission } = require('../services/aiService');

/**
 * UNIFIED AI ENDPOINT: POST /api/ai
 * Accepts payload with { action, language, problem, code, line, error, message, result, mode, timeSpentMinutes }
 */
router.post('/', async (req, res) => {
  const { action, language, problem, code, line, error, message, result, mode, timeSpentMinutes } = req.body;

  const problemTitle = typeof problem === 'string' ? problem : (problem ? problem.title : 'Coding Challenge');

  try {
    switch (action) {
      case 'syntax_hint': {
        const hintRes = await getSyntaxHint({
          language: language || 'javascript',
          problemTitle,
          code: code || '',
          line: line || 1,
          error: error || 'Syntax error'
        });
        return res.json(hintRes);
      }

      case 'chat': {
        const chatRes = await chatWithAI({
          message: message || '',
          problemTitle,
          code: code || '',
          language: language || 'javascript',
          mode: mode || 'AI Mode',
          submissionResult: result || null
        });
        return res.json(chatRes);
      }

      case 'stuck_hint':
      case 'inactivity_hint': {
        const { hintLevel } = req.body;
        const stuckRes = await getStuckHint({
          problemTitle,
          code: code || '',
          language: language || 'javascript',
          timeSpentMinutes: timeSpentMinutes || 5,
          hintLevel: parseInt(hintLevel, 10) || 1
        });
        return res.json(stuckRes);
      }

      case 'submission_analysis':
      case 'post_submission_analysis': {
        const analysisRes = await analyzeSubmission({
          problemTitle,
          code: code || '',
          language: language || 'javascript',
          result: result || { status: 'Accepted' },
          mode: mode || 'AI Mode'
        });
        return res.json(analysisRes);
      }

      default: {
        // Fallback for unknown actions or general chat
        const defaultRes = await chatWithAI({
          message: message || 'Hello AI',
          problemTitle,
          code: code || '',
          language: language || 'javascript',
          mode: mode || 'AI Mode'
        });
        return res.json(defaultRes);
      }
    }
  } catch (err) {
    console.error('[API /api/ai Error]', err.message);
    return res.status(500).json({
      error: true,
      reply: 'AI service is temporarily unavailable. Please try again.',
      hint: 'AI service is temporarily unavailable. Please try again.'
    });
  }
});

// ----------------------------------------------------
// BACKWARD COMPATIBILITY SUB-ROUTES
// ----------------------------------------------------

router.post('/syntax-check', async (req, res) => {
  const { code, language, problemId } = req.body;
  const problemObj = problems.find(p => p.id === problemId);
  const result = await getSyntaxHint({
    code: code || '',
    language: language || 'javascript',
    problemTitle: problemObj ? problemObj.title : 'Coding Problem'
  });
  return res.json(result);
});

router.post('/stuck-hint', async (req, res) => {
  const { problemId, code, language, timeSpentMinutes } = req.body;
  const problemObj = problems.find(p => p.id === problemId);
  const hintResult = await getStuckHint({
    problemTitle: problemObj ? problemObj.title : 'Coding Challenge',
    code: code || '',
    language: language || 'javascript',
    timeSpentMinutes: timeSpentMinutes || 5
  });
  return res.json(hintResult);
});

router.post('/post-analysis', async (req, res) => {
  const { problemId, code, language, result, mode } = req.body;
  const problemObj = problems.find(p => p.id === problemId);
  const analysisRes = await analyzeSubmission({
    problemTitle: problemObj ? problemObj.title : 'Coding Problem',
    code: code || '',
    language: language || 'javascript',
    result: result || { status: 'Accepted' },
    mode: mode || 'AI Mode'
  });
  return res.json({ analysis: analysisRes.analysis });
});

router.post('/chat', async (req, res) => {
  const { message, problemId, code, language, mode, submissionResult } = req.body;
  const problemObj = problems.find(p => p.id === problemId);
  const chatResponse = await chatWithAI({
    message: message || '',
    problemTitle: problemObj ? problemObj.title : '',
    code: code || '',
    language: language || 'javascript',
    mode: mode || 'AI Mode',
    submissionResult: submissionResult || null
  });
  return res.json(chatResponse);
});

module.exports = router;
