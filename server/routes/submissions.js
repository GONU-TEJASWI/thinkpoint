const express = require('express');
const router = express.Router();
const { submissionsHistory } = require('./execution');

// GET all submissions with filters
router.get('/', (req, res) => {
  const { problemId, status, mode, language } = req.query;
  let list = [...submissionsHistory];

  if (problemId) {
    list = list.filter(s => s.problemId === problemId);
  }
  if (status && status !== 'All') {
    list = list.filter(s => s.status.toLowerCase() === status.toLowerCase());
  }
  if (mode && mode !== 'All') {
    list = list.filter(s => s.mode.toLowerCase() === mode.toLowerCase());
  }
  if (language && language !== 'All') {
    list = list.filter(s => s.language.toLowerCase() === language.toLowerCase());
  }

  return res.json({
    total: list.length,
    submissions: list
  });
});

// GET submission detail by ID
router.get('/:id', (req, res) => {
  const submission = submissionsHistory.find(s => s.id === req.params.id);
  if (!submission) {
    return res.status(404).json({ error: "Submission not found" });
  }
  return res.json({ submission });
});

module.exports = router;
