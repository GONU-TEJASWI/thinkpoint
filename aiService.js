const https = require('https');

/**
 * THINKPOINT OpenRouter AI Backend Service
 * API Endpoint: https://openrouter.ai/api/v1/chat/completions
 * Model: openrouter/free
 */

const OPENROUTER_ENDPOINT = 'https://openrouter.ai/api/v1/chat/completions';
const MODEL_NAME = 'openrouter/free';

/**
 * Helper to execute HTTP POST to OpenRouter API
 */
async function callOpenRouter(messages, temperature = 0.7) {
  const rawKey = process.env.OPENROUTER_API_KEY;
  const apiKey = rawKey ? rawKey.trim() : '';

  if (!apiKey || apiKey === 'your_openrouter_api_key_here') {
    throw new Error('OPENROUTER_API_KEY is missing. Please add your OpenRouter API key (sk-or-v1-...) to .env');
  }

  if (apiKey.startsWith('sk-proj-')) {
    console.warn('[OpenRouter Key Check] Provided key starts with sk-proj- (OpenAI key format). OpenRouter requires an OpenRouter key starting with sk-or-v1- from https://openrouter.ai/keys');
  }

  const postData = JSON.stringify({
    model: MODEL_NAME,
    messages: messages,
    temperature: temperature
  });

  return new Promise((resolve, reject) => {
    const url = new URL(OPENROUTER_ENDPOINT);
    const options = {
      hostname: url.hostname,
      port: 443,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://thinkpoint.dev',
        'X-Title': 'THINKPOINT Coding Platform',
        'Content-Length': Buffer.byteLength(postData)
      },
      timeout: 15000
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            const parsed = JSON.parse(body);
            if (parsed.choices && parsed.choices[0] && parsed.choices[0].message) {
              resolve(parsed.choices[0].message.content.trim());
            } else {
              reject(new Error("Unexpected response structure from OpenRouter API"));
            }
          } catch (e) {
            reject(new Error("Failed to parse JSON response from OpenRouter API"));
          }
        } else {
          console.error(`[OpenRouter API Error Status ${res.statusCode}]`, body);
          if (res.statusCode === 401) {
            if (apiKey.startsWith('sk-proj-')) {
              reject(new Error("OpenRouter 401 Unauthorized: You provided an OpenAI key (sk-proj-...). OpenRouter requires an OpenRouter API key (sk-or-v1-...) from https://openrouter.ai/keys"));
            } else {
              reject(new Error("OpenRouter 401 Unauthorized: Invalid API key. Obtain a free key at https://openrouter.ai/keys"));
            }
          } else {
            reject(new Error(`OpenRouter API error (${res.statusCode}): ${body || res.statusMessage}`));
          }
        }
      });
    });

    req.on('error', err => reject(err));
    req.on('timeout', () => {
      req.destroy();
      reject(new Error("OpenRouter API request timed out after 15 seconds"));
    });

    req.write(postData);
    req.end();
  });
}

/**
 * 1. Syntax Hint Action Handler
 */
async function getSyntaxHint({ language, problemTitle, code, line, error }) {
  try {
    const systemPrompt = `You are THINKPOINT AI Syntax Assistant. Your goal is to guide students with educational hints when they encounter syntax or runtime errors. 
Rules:
- Give a short, concise, educational hint (1-2 sentences max).
- Explain WHY the error happened and how to think about fixing it.
- NEVER give the full corrected solution code.
- Focus on the specific line and error provided.`;

    const userPrompt = `Problem: ${problemTitle || 'Coding Problem'}
Language: ${language || 'javascript'}
Error Line: ${line || 1}
Error Message: ${error || 'Syntax Error'}
User Code:
\`\`\`${language}
${code || ''}
\`\`\``;

    const reply = await callOpenRouter([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ], 0.3);

    return { error: false, hint: reply, reply: reply };
  } catch (err) {
    console.warn('[OpenRouter Syntax Hint Error]', err.message);
    const lineStr = line ? ` on line ${line}` : '';
    const fallbackText = `Check your syntax${lineStr}. In ${language || 'code'}, ensure statements are properly terminated and brackets are matched. (${err.message})`;
    return { error: true, hint: fallbackText, reply: fallbackText };
  }
}

/**
 * 2. Interactive AI Chat Assistant Handler
 */
async function chatWithAI({ message, problemTitle, code, language, mode, submissionResult }) {
  try {
    const systemPrompt = `You are THINKPOINT AI Assistant, an expert competitive programming coach.
Rules:
- Be encouraging, clear, and concise in your explanations.
- Help the user understand algorithms, logic, syntax, or edge cases.
- Do NOT output full ready-to-copy code solutions unless explicitly requested.
- Focus on guiding the user step-by-step.`;

    const contextInfo = `Context:
- Problem: ${problemTitle || 'General Coding'}
- Language: ${language || 'javascript'}
- Mode: ${mode || 'AI Mode'}
${code ? `- Current Code:\n\`\`\`${language}\n${code}\n\`\`\`` : ''}
${submissionResult ? `- Recent Submission Result: ${JSON.stringify(submissionResult)}` : ''}`;

    const reply = await callOpenRouter([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `${contextInfo}\n\nStudent Question: ${message}` }
    ], 0.7);

    return { error: false, reply: reply, text: reply };
  } catch (err) {
    console.warn('[OpenRouter Chat Error]', err.message);
    const fallbackText = `Unable to connect to OpenRouter AI: ${err.message}`;
    return { error: true, reply: fallbackText, text: fallbackText };
  }
}

const BEGINNER_HINTS = {
  "Add Two Numbers": {
    1: "What arithmetic operation is needed?",
    2: "Which operator performs addition?",
    3: "Apply that operation to the two input values."
  },
  "Subtract Two Numbers": {
    1: "Look at the order of the two numbers.",
    2: "Which arithmetic operator performs subtraction?",
    3: "Use the first number as the starting value and subtract the second."
  },
  "Multiply Two Numbers": {
    1: "What operation combines the two numbers repeatedly?",
    2: "Which operator represents multiplication?",
    3: "Apply that operator to the two inputs."
  },
  "Find the Larger Number": {
    1: "You need to compare the two values.",
    2: "Think about a condition that checks which value is greater.",
    3: "Return whichever value satisfies the comparison."
  },
  "Check Even or Odd": {
    1: "Think about what happens when a number is divided by 2.",
    2: "What operator can tell you the remainder?",
    3: "Check whether the remainder after division by 2 is zero."
  },
  "Find the Remainder": {
    1: "You need to find what is left over after dividing the first number by the second.",
    2: "Which arithmetic operator calculates the remainder of division?",
    3: "Apply the modulo operator (%) with the first number on the left and the second number on the right."
  },
  "Square of a Number": {
    1: "What does it mean to square a number mathematically?",
    2: "How can you multiply a number by itself?",
    3: "Multiply the input number by itself using the multiplication operator."
  }
};

/**
 * 3. Inactivity / Stuck Hint Action Handler (5-Minute Condition)
 */
async function getStuckHint({ problemTitle, code, language, timeSpentMinutes = 5, hintLevel = 1 }) {
  if (BEGINNER_HINTS[problemTitle] && BEGINNER_HINTS[problemTitle][hintLevel]) {
    const hintText = BEGINNER_HINTS[problemTitle][hintLevel];
    return {
      error: false,
      hintLevel: hintLevel,
      hintTitle: `Hint ${hintLevel}`,
      hintText: hintText,
      suggestion: hintLevel < 3 ? "Click 'Get another hint' for more guidance." : "Now write your code!",
      reply: hintText,
      timeSpentMinutes
    };
  }

  try {
    let levelInstruction = "";
    if (hintLevel === 1) {
      levelInstruction = "Provide a very small conceptual clue (Hint 1). Ask a leading question or point to the core concept. Do NOT mention specific code syntax or operators yet.";
    } else if (hintLevel === 2) {
      levelInstruction = "Provide a more specific directional hint (Hint 2). Suggest key operators, conditions, or data structures needed, without giving the complete code statement.";
    } else {
      levelInstruction = "Provide direct guidance toward the approach (Hint 3). Break down the exact logical steps. NEVER output full copy-paste code solutions like 'return a + b;'!";
    }

    const systemPrompt = `You are THINKPOINT AI Coach. The user is requesting a Progressive Hint (Hint ${hintLevel} of 3) for a coding problem.
CRITICAL RULE: Hints must NEVER provide the complete code solution (e.g. 'return a + b;'). The learner MUST write the code themselves.
${levelInstruction}
Be clear, encouraging, and concise (1-2 sentences max).`;

    const userPrompt = `Problem: ${problemTitle || 'Challenge'}
Language: ${language || 'javascript'}
Current Code:
\`\`\`${language}
${code || ''}
\`\`\``;

    const reply = await callOpenRouter([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ], 0.5);

    return {
      error: false,
      hintLevel: hintLevel,
      hintTitle: `Hint ${hintLevel}`,
      hintText: reply,
      suggestion: hintLevel < 3 ? "Click 'Get another hint' for more guidance." : "Now write your code!",
      reply: reply,
      timeSpentMinutes
    };
  } catch (err) {
    console.warn('[OpenRouter Stuck Hint Error]', err.message);
    return {
      error: true,
      hintLevel: hintLevel,
      hintTitle: `Hint ${hintLevel}`,
      hintText: `Consider the problem requirements and key operations. (${err.message})`,
      suggestion: "Think about key data structures or operations.",
      reply: `Consider the problem requirements and key operations. (${err.message})`,
      timeSpentMinutes
    };
  }
}

/**
 * 4. Post-Submission Code Analysis Handler (Accepted Submissions)
 */
async function analyzeSubmission({ problemTitle, code, language, result, mode }) {
  try {
    const systemPrompt = `You are THINKPOINT Code Reviewer. Analyze the user's accepted code submission.
Return a STRICT valid JSON object with EXACTLY these key names:
{
  "approachExplanation": "Clear description of the algorithm/approach used by the submitted code.",
  "timeComplexity": "Big-O time complexity (e.g. O(N), O(N^2), O(N log N))",
  "spaceComplexity": "Big-O space complexity (e.g. O(1), O(N))",
  "isOptimalSolution": true or false,
  "possibleOptimizations": "Specific suggestions to improve speed, memory, or readability, or stating it is already optimal.",
  "betterApproach": {
    "name": "Name of optimal approach/pattern",
    "whyBetter": "Explanation of why this approach is superior"
  }
}
Do NOT include markdown wrapping or extra text outside the JSON object.`;

    const userPrompt = `Problem: ${problemTitle || 'Challenge'}
Language: ${language || 'javascript'}
Code:
\`\`\`${language}
${code || ''}
\`\`\``;

    const rawReply = await callOpenRouter([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ], 0.2);

    let parsedAnalysis;
    try {
      const cleanJson = rawReply.replace(/```json/gi, '').replace(/```/g, '').trim();
      parsedAnalysis = JSON.parse(cleanJson);
    } catch (e) {
      parsedAnalysis = {
        approachExplanation: rawReply,
        timeComplexity: "O(N)",
        spaceComplexity: "O(N)",
        isOptimalSolution: true,
        possibleOptimizations: "Solution successfully accepted.",
        betterApproach: { name: "Optimal Pattern", whyBetter: "Direct state lookup minimizes overhead." }
      };
    }

    return { error: false, analysis: parsedAnalysis, reply: parsedAnalysis.approachExplanation };
  } catch (err) {
    console.warn('[OpenRouter Submission Analysis Error]', err.message);
    const fallbackAnalysis = {
      approachExplanation: `Unable to connect to OpenRouter AI: ${err.message}`,
      timeComplexity: "O(N)",
      spaceComplexity: "O(N)",
      isOptimalSolution: true,
      possibleOptimizations: "Solution successfully passed all test cases.",
      betterApproach: {
        name: "Optimal Pattern",
        whyBetter: "Minimizes unnecessary state recalculation."
      }
    };
    return { error: true, analysis: fallbackAnalysis, reply: fallbackAnalysis.approachExplanation };
  }
}

module.exports = {
  callOpenRouter,
  getSyntaxHint,
  chatWithAI,
  getStuckHint,
  analyzeSubmission
};
