const express = require('express');
const router = express.Router();
const { getCurrentUser } = require('./auth');
const { submissionsHistory } = require('./execution');
const problemsData = require('../data/problemsData');

function calculateUserStats(user) {
  const userId = user ? user.id : null;
  const userSubs = submissionsHistory.filter(s => s.userId === userId);

  // 1. Total Submissions (Submit actions only)
  const totalSubmissions = userSubs.length;

  // 2. Accepted Submissions
  const acceptedSubs = userSubs.filter(s => s.status === 'Accepted');

  // 3. Unique Solved Problems
  const solvedProblemIds = new Set(acceptedSubs.map(s => s.problemId));
  const solvedCount = solvedProblemIds.size;

  // 4. Accuracy Rate (0% if no submissions)
  const accuracy = totalSubmissions > 0 
    ? Number(((acceptedSubs.length / totalSubmissions) * 100).toFixed(1)) 
    : 0;

  // 5. Total Available Problems by Difficulty
  const easyProblems = problemsData.filter(p => (p.difficulty || '').toLowerCase() === 'easy');
  const mediumProblems = problemsData.filter(p => (p.difficulty || '').toLowerCase() === 'medium');
  const hardProblems = problemsData.filter(p => (p.difficulty || '').toLowerCase() === 'hard');

  const easyTotal = easyProblems.length;
  const mediumTotal = mediumProblems.length;
  const hardTotal = hardProblems.length;

  // 6. Solved Unique Problems by Difficulty
  const easySolved = easyProblems.filter(p => solvedProblemIds.has(p.id)).length;
  const mediumSolved = mediumProblems.filter(p => solvedProblemIds.has(p.id)).length;
  const hardSolved = hardProblems.filter(p => solvedProblemIds.has(p.id)).length;

  const difficultyBreakdown = {
    easy: { solved: Math.min(easySolved, easyTotal), total: easyTotal },
    medium: { solved: Math.min(mediumSolved, mediumTotal), total: mediumTotal },
    hard: { solved: Math.min(hardSolved, hardTotal), total: hardTotal }
  };

  // 7. Daily Goal & Unique Solved Today
  const todayStr = new Date().toISOString().slice(0, 10);
  const todayAcceptedSubs = acceptedSubs.filter(s => s.submittedAt && s.submittedAt.slice(0, 10) === todayStr);
  const solvedTodaySet = new Set(todayAcceptedSubs.map(s => s.problemId));
  const solvedToday = solvedTodaySet.size;
  const dailyGoal = user && user.dailyGoal ? Number(user.dailyGoal) : 3;

  // 8. Streak Calculation (Consecutive Days with Accepted Submissions)
  const activeDates = Array.from(new Set(acceptedSubs.map(s => s.submittedAt ? s.submittedAt.slice(0, 10) : ''))).filter(Boolean).sort().reverse();

  let streak = 0;
  if (activeDates.length > 0) {
    const today = new Date();
    const todayFormatted = today.toISOString().slice(0, 10);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayFormatted = yesterday.toISOString().slice(0, 10);

    if (activeDates.includes(todayFormatted) || activeDates.includes(yesterdayFormatted)) {
      let checkDate = activeDates.includes(todayFormatted) ? new Date(today) : new Date(yesterday);
      while (true) {
        const checkStr = checkDate.toISOString().slice(0, 10);
        if (activeDates.includes(checkStr)) {
          streak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          break;
        }
      }
    }
  }

  // 9. Topic-Wise Progress (Dynamic)
  const topicMap = {};
  problemsData.forEach(p => {
    if (p.topics && Array.isArray(p.topics)) {
      p.topics.forEach(t => {
        if (!topicMap[t]) topicMap[t] = { total: 0, solvedSet: new Set() };
        topicMap[t].total += 1;
        if (solvedProblemIds.has(p.id)) {
          topicMap[t].solvedSet.add(p.id);
        }
      });
    }
  });

  const topicProgress = Object.keys(topicMap).map(topic => {
    const total = topicMap[topic].total;
    const solved = topicMap[topic].solvedSet.size;
    const percentage = total > 0 ? Math.round((solved / total) * 100) : 0;
    return { topic, solved, total, percentage };
  });

  // 10. Recent Submissions for User
  const recentSubmissions = userSubs.slice(0, 5);

  return {
    user: {
      ...user,
      solvedCount,
      totalSubmissions,
      accuracy,
      streak,
      dailyGoal,
      solvedToday,
      easySolved, mediumSolved, hardSolved,
      easyTotal, mediumTotal, hardTotal
    },
    solvedCount,
    totalSubmissions,
    accuracy,
    streak,
    dailyGoal,
    solvedToday,
    difficultyBreakdown,
    topicProgress,
    recentSubmissions
  };
}

const getStatsHandler = (req, res) => {
  try {
    const user = getCurrentUser();
    const stats = calculateUserStats(user);
    return res.json(stats);
  } catch (err) {
    console.error("Dashboard stats error:", err);
    return res.status(500).json({ error: "Failed to load stats" });
  }
};

router.get('/', getStatsHandler);
router.get('/stats', getStatsHandler);

module.exports = router;
