const express = require('express');
const router = express.Router();
const problems = require('../data/problemsData');

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

// GET all problems with optional search, difficulty, and topic filters
router.get('/', (req, res) => {
  const { search, difficulty, topic } = req.query;
  let filtered = [...problems];

  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(p => p.title.toLowerCase().includes(q) || (p.topics && p.topics.some(t => t.toLowerCase().includes(q))));
  }

  if (difficulty && difficulty !== 'All') {
    filtered = filtered.filter(p => p.difficulty && p.difficulty.toLowerCase() === difficulty.toLowerCase());
  }

  if (topic && topic !== 'All') {
    filtered = filtered.filter(p => p.topics && p.topics.includes(topic));
  }

  // Return problem metadata without exposing hidden test cases directly in list
  const list = filtered.map(({ hiddenTestCases, ...rest }) => rest);
  return res.json({
    total: list.length,
    problems: list
  });
});

// GET single problem details by ID
router.get('/:id', (req, res) => {
  const problem = findProblemById(req.params.id);
  if (!problem) {
    return res.status(404).json({ error: "Problem not found" });
  }

  // Exclude hidden test cases from direct API response to ensure competitive integrity
  const { hiddenTestCases, ...safeProblem } = problem;
  return res.json({ problem: safeProblem });
});

module.exports = router;
