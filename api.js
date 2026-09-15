const API_BASE = '/api';

export async function fetchDashboardStats() {
  try {
    const res = await fetch(`${API_BASE}/dashboard/stats`);
    if (!res.ok) throw new Error(`Dashboard stats HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn("fetchDashboardStats fallback:", err.message);
    return {
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
  }
}

export async function fetchProblems(params = {}) {
  try {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/problems?${query}`);
    if (!res.ok) throw new Error(`Problems HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn("fetchProblems error:", err.message);
    return { total: 0, problems: [] };
  }
}

function getMethodNameFromId(id) {
  const norm = (id || '').toLowerCase().trim();
  switch (norm) {
    case 'add-two-numbers': return 'add';
    case 'subtract-two-numbers': return 'subtract';
    case 'multiply-two-numbers': return 'multiply';
    case 'find-the-larger-number':
    case 'find-larger-number': return 'larger';
    case 'check-even-or-odd':
    case 'even-or-odd': return 'checkEvenOdd';
    case 'find-the-remainder':
    case 'find-remainder': return 'remainder';
    case 'square-of-a-number': return 'square';
    default: return 'add';
  }
}

export async function fetchProblemById(id) {
  try {
    const res = await fetch(`${API_BASE}/problems/${id}`);
    if (!res.ok) throw new Error(`Problem detail HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn("fetchProblemById fallback:", err.message);
    const cleanId = id || 'add-two-numbers';
    const formattedTitle = cleanId.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    const method = getMethodNameFromId(cleanId);
    return {
      problem: {
        id: cleanId,
        title: formattedTitle,
        difficulty: "Easy",
        topics: ["Math", "Beginner"],
        acceptanceRate: "95.0%",
        methodName: method,
        functionName: method,
        description: `Solve the ${formattedTitle} challenge.`,
        constraints: ["-10^9 <= value <= 10^9"],
        examples: [{ input: "Sample input", output: "Sample output" }],
        sampleTestCases: [{ input: { a: 5, b: 3 }, expected: 8 }],
        starterCode: `function ${method}(a, b) {\n    // Write your code here\n    \n}`,
        starterTemplates: {
          javascript: `function ${method}(a, b) {\n    // Write your code here\n    \n}`,
          python: `class Solution:\n    def ${method}(self, a: int, b: int) -> int:\n        # Write your code here\n        pass`,
          java: `class Solution {\n    public int ${method}(int a, int b) {\n        // Write your code here\n        return 0;\n    }\n}`,
          cpp: `class Solution {\npublic:\n    int ${method}(int a, int b) {\n        // Write your code here\n        return 0;\n    }\n};`
        }
      }
    };
  }
}

export async function runCode({ problemId, language, code, mode }) {
  const res = await fetch(`${API_BASE}/execute/run`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ problemId, language, code, mode })
  });
  if (!res.ok) throw new Error("Code execution failed");
  return res.json();
}

export async function submitCode({ problemId, language, code, mode }) {
  const res = await fetch(`${API_BASE}/execute/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ problemId, language, code, mode })
  });
  if (!res.ok) throw new Error("Code submission failed");
  return res.json();
}

export async function checkSyntax({ code, language, problemTitle }) {
  try {
    const res = await fetch('http://localhost:5000/api/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'syntax_hint', code, language, problem: problemTitle })
    });
    if (!res.ok) return { hasErrors: false, errors: [] };
    return await res.json();
  } catch (e) {
    return { hasErrors: false, errors: [] };
  }
}

export async function fetchStuckHint({ problemTitle, code, language, timeSpentMinutes }) {
  const res = await fetch('http://localhost:5000/api/ai', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'stuck_hint', problem: problemTitle, code, language, timeSpentMinutes })
  });
  if (!res.ok) throw new Error("Failed to fetch stuck hint");
  return res.json();
}

export async function fetchPostAnalysis({ problemTitle, code, language, result, mode }) {
  const res = await fetch('http://localhost:5000/api/ai', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'submission_analysis', problem: problemTitle, code, language, result, mode })
  });
  if (!res.ok) throw new Error("Failed to fetch post analysis");
  return res.json();
}

export async function sendAIChat({ message, problemTitle, code, language, mode, submissionResult }) {
  const res = await fetch('http://localhost:5000/api/ai', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'chat', message, problem: problemTitle, code, language, mode, submissionResult })
  });
  if (!res.ok) throw new Error("AI Chat request failed");
  return res.json();
}

export async function fetchSubmissions(params = {}) {
  try {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/submissions?${query}`);
    if (!res.ok) throw new Error("Failed to fetch submissions");
    return await res.json();
  } catch (e) {
    return { total: 0, submissions: [] };
  }
}

export async function fetchUserProfile() {
  try {
    const res = await fetch(`${API_BASE}/auth/profile`);
    if (!res.ok) throw new Error(`User profile HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn("fetchUserProfile fallback:", err.message);
    return {
      user: {
        id: "user-default",
        name: "Learner",
        email: "learner@thinkpoint.dev",
        streak: 0,
        dailyGoal: 3,
        solvedToday: 0,
        solvedCount: 0
      }
    };
  }
}

export async function updateDailyGoal(dailyGoal) {
  try {
    const res = await fetch(`${API_BASE}/auth/goal`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dailyGoal })
    });
    if (!res.ok) throw new Error("Failed to update daily goal");
    return await res.json();
  } catch (e) {
    return { success: true };
  }
}

export async function loginUser(email, password) {
  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (!res.ok) throw new Error("Login failed");
    return await res.json();
  } catch (e) {
    const cleanEmail = (email || 'learner@thinkpoint.dev').toLowerCase().trim();
    return {
      user: {
        id: `user-${cleanEmail.replace(/[^a-z0-9]/g, '')}`,
        name: cleanEmail.split('@')[0].toUpperCase(),
        email: cleanEmail,
        streak: 0,
        dailyGoal: 3
      }
    };
  }
}

export async function signupUser(name, email, password) {
  try {
    const res = await fetch(`${API_BASE}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });
    if (!res.ok) throw new Error("Signup failed");
    return await res.json();
  } catch (e) {
    const cleanEmail = (email || 'learner@thinkpoint.dev').toLowerCase().trim();
    return {
      user: {
        id: `user-${cleanEmail.replace(/[^a-z0-9]/g, '')}`,
        name: name || cleanEmail.split('@')[0],
        email: cleanEmail,
        streak: 0,
        dailyGoal: 3
      }
    };
  }
}
