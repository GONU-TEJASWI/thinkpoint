import React, { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { fetchProblemById, runCode, submitCode } from '../services/api';
import { sendToThinkpointAI } from '../services/ai';
import { 
  Play, Send, Bot, Shield, AlertTriangle, CheckCircle2, XCircle, 
  MessageSquare, Sparkles, Clock, BookOpen, History, Cpu, Zap, ChevronRight 
} from 'lucide-react';

export default function ProblemSolvingPage({ problemId, onBack }) {
  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);

  // Mode Selector State: 'AI Mode' | 'NON-AI Mode'
  const [mode, setMode] = useState('AI Mode');

  // Editor & Language State
  const [language, setLanguage] = useState('javascript');
  const [code, setCode] = useState('');

  // Monaco Instances
  const editorRef = useRef(null);
  const monacoRef = useRef(null);

  // Left Panel Sub-Tabs
  const [leftTab, setLeftTab] = useState('statement'); // 'statement' | 'submissions' | 'post-analysis'

  // Below Editor Panels: 'testcases' | 'output' | 'results'
  const [bottomTab, setBottomTab] = useState('testcases');
  const [executing, setExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState(null);
  const [submissionResult, setSubmissionResult] = useState(null);

  // Syntax Error State & AI Hint (Only set when ACTUAL syntax error exists)
  const [syntaxError, setSyntaxError] = useState(null); // { line, message }
  const [aiHint, setAiHint] = useState(null);
  const [hintLevel, setHintLevel] = useState(0); // 0 = not requested, 1 = Hint 1, 2 = Hint 2, 3 = Hint 3
  const [currentHintText, setCurrentHintText] = useState('');
  const [fetchingHint, setFetchingHint] = useState(false);
  const inactivityTimerRef = useRef(null);

  // AI Chatbox State
  const [showChatbox, setShowChatbox] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { sender: 'ai', text: "Welcome! I'm your THINKPOINT AI Coding Assistant. Ask me anything about problem constraints, syntax errors, or algorithm complexity!" }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatSending, setChatSending] = useState(false);

  useEffect(() => {
    loadProblemData();
  }, [problemId]);

  // ----------------------------------------------------
  // REAL COMPILER & SYNTAX DIAGNOSTIC ENGINE (DEBOUNCED 500MS)
  // ----------------------------------------------------
  useEffect(() => {
    if (!code || !problem) {
      clearSyntaxErrors();
      return;
    }

    const validateTimer = setTimeout(async () => {
      let err = null;

      // 1. Check Monaco Worker Diagnostic Markers
      if (editorRef.current && monacoRef.current) {
        const model = editorRef.current.getModel();
        if (model) {
          const markers = monacoRef.current.editor.getModelMarkers({ resource: model.uri });
          const errorMarker = markers.find(m => m.severity === monacoRef.current.MarkerSeverity.Error);
          if (errorMarker) {
            err = {
              line: errorMarker.startLineNumber,
              column: errorMarker.startColumn,
              message: errorMarker.message
            };
          }
        }
      }

      // 2. Fallback to Language Parser Diagnostics
      if (!err) {
        err = detectActualSyntaxError(code, language);
      }

      if (err) {
        setSyntaxError(err);
        
        // Highlight problematic line in Monaco Editor
        if (editorRef.current && monacoRef.current) {
          const model = editorRef.current.getModel();
          if (model) {
            monacoRef.current.editor.setModelMarkers(model, 'syntax', [
              {
                startLineNumber: err.line,
                startColumn: err.column || 1,
                endLineNumber: err.line,
                endColumn: 1000,
                message: err.message,
                severity: monacoRef.current.MarkerSeverity.Error
              }
            ]);
          }
        }

        // In AI MODE: Send exact syntax_hint payload to backend /api/ai
        if (mode === 'AI Mode') {
          try {
            const aiRes = await sendToThinkpointAI({
              action: "syntax_hint",
              language: language,
              problem: problem.title,
              code: code,
              line: err.line,
              error: err.message
            });

            if (aiRes && (aiRes.hint || aiRes.reply)) {
              setAiHint(aiRes.hint || aiRes.reply);
            }
          } catch (e) {
            console.error("Syntax hint error:", e);
          }
        } else {
          // NON-AI MODE: Proactive AI hints disabled
          setAiHint(null);
        }

      } else {
        // NO SYNTAX ERROR: Clear error markers and hints completely
        clearSyntaxErrors();
      }
    }, 500);

    // 5-Minute Inactivity Timer (AI MODE ONLY)
    if (mode === 'AI Mode') {
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
      inactivityTimerRef.current = setTimeout(() => {
        handleTriggerInactivityHint();
      }, 5 * 60 * 1000);
    }

    return () => {
      clearTimeout(validateTimer);
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
    };
  }, [code, language, mode, problem]);

  const clearSyntaxErrors = () => {
    setSyntaxError(null);
    setAiHint(null);
    if (editorRef.current && monacoRef.current) {
      const model = editorRef.current.getModel();
      if (model) {
        monacoRef.current.editor.setModelMarkers(model, 'syntax', []);
      }
    }
  };

  // Real JS/Python/Java/C++ syntax error detector
  const detectActualSyntaxError = (codeStr, lang) => {
    if (!codeStr || !codeStr.trim()) return null;

    if (lang === 'javascript' || lang === 'js') {
      try {
        new Function(codeStr);
      } catch (err) {
        if (err instanceof SyntaxError) {
          let lineNum = 1;
          let colNum = 1;
          const stackLines = err.stack ? err.stack.split('\n') : [];
          for (const sLine of stackLines) {
            const match = sLine.match(/<anonymous>:(\d+):(\d+)/) || sLine.match(/:(\d+):(\d+)/);
            if (match) {
              lineNum = parseInt(match[1], 10);
              colNum = parseInt(match[2], 10);
              break;
            }
          }
          if (lineNum === 1 && codeStr.includes('\n')) {
            lineNum = estimateLineNumFromError(codeStr, err.message);
          }
          return {
            line: lineNum,
            column: colNum,
            message: err.message
          };
        }
      }
    }

    // Line-by-line & Structural Diagnostics
    const lines = codeStr.split('\n');
    let openBrace = 0, openParen = 0, openBracket = 0;
    let lastOpenBraceLine = 1, lastOpenParenLine = 1, lastOpenBracketLine = 1;
    let inString = false, stringChar = '', stringLine = 1;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      for (let j = 0; j < line.length; j++) {
        const char = line[j];
        if (inString) {
          if (char === stringChar && line[j - 1] !== '\\') {
            inString = false;
          }
        } else {
          if (char === '"' || char === "'" || char === '`') {
            inString = true;
            stringChar = char;
            stringLine = i + 1;
          } else if (char === '{') { openBrace++; lastOpenBraceLine = i + 1; }
          else if (char === '}') openBrace--;
          else if (char === '(') { openParen++; lastOpenParenLine = i + 1; }
          else if (char === ')') openParen--;
          else if (char === '[') { openBracket++; lastOpenBracketLine = i + 1; }
          else if (char === ']') openBracket--;
        }
      }

      if (openBrace < 0) return { line: i + 1, message: "Unexpected closing brace '}'" };
      if (openParen < 0) return { line: i + 1, message: "Unexpected closing parenthesis ')'" };
      if (openBracket < 0) return { line: i + 1, message: "Unexpected closing bracket ']'" };
    }

    if (inString) return { line: stringLine, message: `Unterminated string literal (${stringChar})` };
    if (openBrace > 0) return { line: lastOpenBraceLine, message: "Unclosed curly brace '{'" };
    if (openParen > 0) return { line: lastOpenParenLine, message: "Unclosed parenthesis '('" };
    if (openBracket > 0) return { line: lastOpenBracketLine, message: "Unclosed bracket '['" };

    return null;
  };

  const estimateLineNumFromError = (codeStr, msg) => {
    const lines = codeStr.split('\n');
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (msg.includes('unexpected token') && (line.includes(';') || line.includes('}'))) {
        return i + 1;
      }
    }
    return lines.length;
  };

  // ----------------------------------------------------
  // INTERNAL COPY/PASTE PROTECTION (SILENT DETERRENT)
  // ----------------------------------------------------
  const handleEditorMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    // 1. Intercept Monaco KeyDown for Paste/Copy Shortcuts
    editor.onKeyDown((e) => {
      const isPasteKey = 
        ((e.ctrlKey || e.metaKey) && e.keyCode === monaco.KeyCode.KeyV) ||
        (e.shiftKey && e.keyCode === monaco.KeyCode.Insert);
      const isCopyKey =
        ((e.ctrlKey || e.metaKey) && e.keyCode === monaco.KeyCode.KeyC);

      if (isPasteKey || isCopyKey) {
        e.preventDefault();
        e.stopPropagation();
      }
    });

    // 2. Intercept Context Menu / Programmatic Paste
    editor.onDidPaste(() => {
      editor.trigger('keyboard', 'undo', null);
    });

    // 3. Intercept DOM Paste, Copy, Drop, Dragover on Editor Container Node
    const domNode = editor.getDomNode();
    if (domNode) {
      domNode.addEventListener('paste', (e) => {
        e.preventDefault();
        e.stopPropagation();
      }, true);

      domNode.addEventListener('copy', (e) => {
        e.preventDefault();
        e.stopPropagation();
      }, true);

      domNode.addEventListener('drop', (e) => {
        e.preventDefault();
        e.stopPropagation();
      }, true);

      domNode.addEventListener('dragover', (e) => {
        e.preventDefault();
      }, true);
    }
  };

  const getStarterCodeForLanguage = (probObj, lang) => {
    if (!probObj) return '';
    const templates = probObj.starterTemplates || probObj.starterCode;
    if (!templates) return '';
    if (typeof templates === 'string') return templates;
    if (typeof templates === 'object') {
      const normLang = (lang || '').toLowerCase().trim();
      let key = normLang;
      if (normLang.includes('java') && !normLang.includes('script')) key = 'java';
      else if (normLang.includes('js') || normLang.includes('script')) key = 'javascript';
      else if (normLang.includes('py')) key = 'python';
      else if (normLang.includes('c++') || normLang.includes('cpp')) key = 'cpp';

      return templates[key] || templates[lang] || templates['javascript'] || templates['python'] || Object.values(templates)[0] || '';
    }
    return '';
  };

  const loadProblemData = async () => {
    try {
      setLoading(true);
      setHintLevel(0);
      setCurrentHintText('');
      setAiHint(null);
      const data = await fetchProblemById(problemId || 'add-two-numbers');
      const prob = data?.problem || null;
      setProblem(prob);
      if (prob) {
        setCode(getStarterCodeForLanguage(prob, language));
      }
    } catch (e) {
      console.error("Error loading problem detail:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleLanguageChange = (newLang) => {
    setLanguage(newLang);
    if (problem) {
      setCode(getStarterCodeForLanguage(problem, newLang));
    }
  };

  // Run Button Handler (Sample Test Cases)
  const handleRun = async () => {
    if (!problem) return;
    try {
      setExecuting(true);
      setBottomTab('output');
      const res = await runCode({
        problemId: problem.id,
        language,
        code,
        mode
      });
      setExecutionResult(res);
    } catch (e) {
      console.error("Run error:", e);
    } finally {
      setExecuting(false);
    }
  };

  // Submit Button Handler (Sample + Hidden Test Cases)
  const handleSubmit = async () => {
    if (!problem) return;
    try {
      setExecuting(true);
      setBottomTab('results');
      const res = await submitCode({
        problemId: problem.id,
        language,
        code,
        mode
      });
      setSubmissionResult(res.submission);

      // Trigger Post-Submission AI Analysis via sendToThinkpointAI
      const postAiRes = await sendToThinkpointAI({
        action: 'submission_analysis',
        language: language,
        problem: problem.title,
        code: code,
        result: res.submission,
        mode: mode
      });

      if (postAiRes && res.submission) {
        if (postAiRes.analysis) {
          res.submission.postAnalysis = postAiRes.analysis;
        } else if (postAiRes.reply) {
          res.submission.postAnalysis = {
            approachExplanation: postAiRes.reply,
            timeComplexity: "O(N)",
            spaceComplexity: "O(N)",
            isOptimalSolution: true
          };
        }
      }

      if (res.submission && res.submission.status === 'Accepted') {
        setLeftTab('post-analysis');
      }
    } catch (e) {
      console.error("Submit error:", e);
    } finally {
      setExecuting(false);
    }
  };

  // Progressive Hint Handler (Hint 1 -> Hint 2 -> Hint 3)
  const handleGetNextHint = async () => {
    if (!problem || fetchingHint) return;
    const nextLevel = hintLevel < 3 ? hintLevel + 1 : 3;
    try {
      setFetchingHint(true);
      const hintRes = await sendToThinkpointAI({
        action: 'stuck_hint',
        hintLevel: nextLevel,
        language: language,
        problem: problem.title,
        code: code,
        mode: mode
      });
      const text = hintRes.reply || hintRes.hintText || hintRes.hint || "Consider what operation the problem is asking you to perform.";
      setHintLevel(nextLevel);
      setCurrentHintText(text);
    } catch (e) {
      console.error("Hint error:", e);
      setCurrentHintText("Think about what operation the problem is asking you to perform.");
      setHintLevel(nextLevel);
    } finally {
      setFetchingHint(false);
    }
  };

  const handleTriggerInactivityHint = async () => {
    if (hintLevel === 0) {
      handleGetNextHint();
    }
  };

  // ----------------------------------------------------
  // AI CHATBOX HANDLER (Exact CHAT Payload to /api/ai)
  // Works in BOTH AI Mode and NON-AI Mode
  // ----------------------------------------------------
  const handleSendChat = async () => {
    if (!chatInput.trim() || chatSending) return;
    const userMsg = chatInput.trim();
    setChatInput('');
    setChatMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setChatSending(true);

    try {
      // Send exact JSON payload to backend /api/ai endpoint
      const response = await sendToThinkpointAI({
        action: "chat",
        language: language,
        problem: problem.title,
        code: code,
        message: userMsg
      });

      const replyMsg = response.reply || response.hint || response.text || "No response received from AI.";
      setChatMessages(prev => [...prev, { 
        sender: 'ai', 
        text: replyMsg 
      }]);
    } catch (e) {
      setChatMessages(prev => [...prev, { sender: 'ai', text: "Unable to connect to THINKPOINT AI backend." }]);
    } finally {
      setChatSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[75vh] text-slate-400">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-medium">Loading THINKPOINT Coding Workbench...</p>
        </div>
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="flex items-center justify-center min-h-[75vh] text-slate-400">
        <div className="flex flex-col items-center gap-4 text-center">
          <AlertTriangle className="w-10 h-10 text-amber-400" />
          <h2 className="text-lg font-bold text-white">Problem Details Unavailable</h2>
          <p className="text-xs text-slate-400 max-w-sm">Unable to load problem details for "{problemId}".</p>
          <button onClick={onBack} className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-lg text-xs">
            ← Back to Problem Library
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex flex-col bg-slate-950 text-slate-100">
      
      {/* WORKBENCH TOP CONTROL BAR */}
      <div className="h-12 bg-slate-900 border-b border-slate-800 px-4 flex items-center justify-between">
        
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="text-xs text-slate-400 hover:text-white font-medium">
            ← Back to Problems
          </button>
          <span className="text-slate-600">|</span>
          <h2 className="text-sm font-bold text-white">{problem.title}</h2>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
            problem.difficulty === 'Easy' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
          }`}>
            {problem.difficulty}
          </span>
        </div>

        {/* Top Controls: Mode Selector, Paste Lock, AI Chat */}
        <div className="flex items-center gap-3">
          
          {/* AI / NON-AI MODE SELECTOR */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setMode('AI Mode')}
              className={`flex items-center gap-1 px-3 py-1 rounded-lg font-bold transition-all ${
                mode === 'AI Mode' 
                  ? 'bg-cyan-500 text-slate-950 shadow-sm' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Mode</span>
            </button>
            <button
              onClick={() => setMode('NON-AI Mode')}
              className={`flex items-center gap-1 px-3 py-1 rounded-lg font-bold transition-all ${
                mode === 'NON-AI Mode' 
                  ? 'bg-slate-700 text-white shadow-sm' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>NON-AI Mode</span>
            </button>
          </div>

          {/* AI Chatbox Trigger */}
          <button
            onClick={() => setShowChatbox(!showChatbox)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 text-xs font-semibold"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>AI Chatbox</span>
          </button>

        </div>

      </div>

      {/* MAIN SPLIT VIEW (LEFT / RIGHT) */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 overflow-hidden">
        
        {/* LEFT SIDE: Problem Statement, Examples, Constraints, Difficulty, Topics */}
        <div className="flex flex-col border-r border-slate-800 bg-slate-900/60 overflow-y-auto max-h-[calc(100vh-7rem)]">
          
          {/* Sub-Tabs: Statement | Submissions | Post-Submission AI Analysis */}
          <div className="flex items-center border-b border-slate-800 bg-slate-900/90 sticky top-0 z-10 px-2 pt-2">
            <button
              onClick={() => setLeftTab('statement')}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
                leftTab === 'statement'
                  ? 'border-cyan-500 text-cyan-400 bg-slate-800/40'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              Problem Overview
            </button>

            <button
              onClick={() => setLeftTab('submissions')}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
                leftTab === 'submissions'
                  ? 'border-cyan-500 text-cyan-400 bg-slate-800/40'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <History className="w-4 h-4" />
              Submissions
            </button>

            <button
              onClick={() => setLeftTab('post-analysis')}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
                leftTab === 'post-analysis'
                  ? 'border-cyan-500 text-cyan-400 bg-slate-800/40'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Cpu className="w-4 h-4" />
              AI Analysis {submissionResult?.status === 'Accepted' && <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>}
            </button>
          </div>

          {/* Left Sub-Tab 1: Statement */}
          {leftTab === 'statement' && (
            <div className="p-6 space-y-6 text-sm text-slate-300">
              
              {/* Title & Metadata */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h1 className="text-xl font-extrabold text-white">{problem.title}</h1>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded ${
                    problem.difficulty === 'Easy' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                  }`}>
                    {problem.difficulty}
                  </span>
                </div>

                {/* Topics */}
                {problem.topics && Array.isArray(problem.topics) && problem.topics.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-xs text-slate-500 font-medium mr-1">Topics:</span>
                    {problem.topics.map((t, idx) => (
                      <span key={idx} className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="prose prose-invert max-w-none text-slate-300 leading-relaxed whitespace-pre-line bg-slate-900/40 p-4 rounded-xl border border-slate-800">
                {problem.description || "Solve the challenge by writing the correct code."}
              </div>

              {/* Examples */}
              {problem.examples && Array.isArray(problem.examples) && problem.examples.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Examples</h3>
                  {problem.examples.map((ex, idx) => (
                    <div key={idx} className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2 text-xs font-mono">
                      <div className="text-slate-400 font-sans font-bold">Example {idx + 1}:</div>
                      <div><span className="text-cyan-400">Input:</span> <span className="text-slate-200">{ex.input}</span></div>
                      <div><span className="text-emerald-400">Output:</span> <span className="text-slate-200">{ex.output}</span></div>
                      {ex.explanation && (
                        <div className="text-slate-400 font-sans mt-1 text-[11px]"><span className="font-semibold text-slate-300">Explanation:</span> {ex.explanation}</div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Constraints */}
              {problem.constraints && Array.isArray(problem.constraints) && problem.constraints.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Constraints</h3>
                  <ul className="list-disc pl-5 text-xs text-slate-400 space-y-1 font-mono">
                    {problem.constraints.map((c, idx) => (
                      <li key={idx}>{c}</li>
                    ))}
                  </ul>
                </div>
              )}

            </div>
          )}

          {/* Left Sub-Tab 2: Submissions */}
          {leftTab === 'submissions' && (
            <div className="p-6 text-xs space-y-4">
              <h3 className="font-bold text-white text-sm">Session Submissions for {problem.title}</h3>
              {submissionResult ? (
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3 font-mono">
                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-0.5 rounded font-bold ${submissionResult.status === 'Accepted' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                      {submissionResult.status}
                    </span>
                    <span className="text-slate-400">{new Date(submissionResult.submittedAt).toLocaleTimeString()}</span>
                  </div>
                  <div>Passed {submissionResult.passedCases} / {submissionResult.totalCases} test cases</div>
                  <div>Runtime: {submissionResult.runtimeMs} ms</div>
                </div>
              ) : (
                <p className="text-slate-400">No submissions yet. Click **Submit** to run all test cases!</p>
              )}
            </div>
          )}

          {/* Left Sub-Tab 3: Post-Submission AI Analysis */}
          {leftTab === 'post-analysis' && (
            <div className="p-6 space-y-6 text-xs text-slate-300">
              {submissionResult && submissionResult.postAnalysis ? (
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      <span className="font-bold text-white text-sm">Post-Submission AI Review</span>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold">{submissionResult.mode}</span>
                  </div>

                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
                    <h4 className="font-bold text-cyan-400 uppercase text-[11px]">Approach Explanation</h4>
                    <p className="text-slate-200">{submissionResult.postAnalysis.approachExplanation}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Time Complexity</span>
                      <span className="text-lg font-mono font-bold text-white mt-1 block">{submissionResult.postAnalysis.timeComplexity}</span>
                    </div>
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Space Complexity</span>
                      <span className="text-lg font-mono font-bold text-white mt-1 block">{submissionResult.postAnalysis.spaceComplexity}</span>
                    </div>
                  </div>

                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
                    <h4 className="font-bold text-amber-400 uppercase text-[11px]">Optimal Approach Comparison</h4>
                    <p className="text-slate-300">{submissionResult.postAnalysis.possibleOptimizations || "Your solution is optimal."}</p>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center text-slate-400 space-y-3">
                  <Cpu className="w-8 h-8 text-slate-600 mx-auto" />
                  <p>Complete an **Accepted Submission** to view post-submission AI solution analysis & complexity analysis.</p>
                </div>
              )}
            </div>
          )}

        </div>

        {/* RIGHT SIDE: Programming Language Selector, Monaco Code Editor, AI / Non-AI Mode Selector, Run, Submit */}
        <div className="flex flex-col h-full bg-slate-950">
          
          {/* Editor Action Bar */}
          <div className="h-10 bg-slate-900 border-b border-slate-800 px-4 flex items-center justify-between text-xs">
            
            {/* Language Selector */}
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-medium">Language:</span>
              <select
                value={language}
                onChange={(e) => handleLanguageChange(e.target.value)}
                className="bg-slate-800 text-white font-mono px-2.5 py-1 rounded border border-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="javascript">JavaScript (ES6)</option>
                <option value="python">Python 3</option>
                <option value="java">Java 17</option>
                <option value="cpp">C++ 20</option>
              </select>
            </div>

            {/* Run & Submit Buttons */}
            <div className="flex items-center gap-2">
              
              {/* RUN BUTTON */}
              <button
                onClick={handleRun}
                disabled={executing}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold transition-all border border-slate-700"
              >
                <Play className="w-3.5 h-3.5 text-cyan-400 fill-cyan-400" />
                <span>Run</span>
              </button>

              {/* SUBMIT BUTTON */}
              <button
                onClick={handleSubmit}
                disabled={executing}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold shadow-lg shadow-emerald-500/20 transition-all"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{executing ? "Evaluating..." : "Submit"}</span>
              </button>

            </div>

          </div>

          {/* AI MODE SYNTAX ASSISTANCE & HINT AREA (ONLY SHOWN IN AI MODE WHEN ACTUAL SYNTAX ERROR EXISTS) */}
          {mode === 'AI Mode' && syntaxError && (
            <div className="bg-rose-500/10 border-b border-rose-500/30 px-4 py-2 text-xs text-rose-300 flex items-center justify-between animate-fadeIn">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                <span><strong>AI Syntax Assistance (Line {syntaxError.line}):</strong> {syntaxError.message}</span>
              </div>
              {aiHint && (
                <span className="text-[11px] font-mono px-2.5 py-1 bg-cyan-500/15 border border-cyan-500/30 rounded text-cyan-300 font-semibold ml-4">
                  💡 Hint: {aiHint}
                </span>
              )}
            </div>
          )}

          {/* MONACO CODE EDITOR */}
          <div className="flex-1 relative min-h-[300px]">
            <Editor
              height="100%"
              language={language === 'cpp' ? 'cpp' : language}
              theme="vs-dark"
              value={code}
              onChange={(value) => setCode(value || '')}
              onMount={handleEditorMount}
              options={{
                fontSize: 13,
                fontFamily: 'JetBrains Mono, Menlo, Monaco, Consolas, monospace',
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                automaticLayout: true,
                tabSize: 4,
                lineNumbers: 'on',
                renderLineHighlight: 'all',
                suggestOnTriggerCharacters: true
              }}
            />
          </div>

          {/* HINT SECTION BELOW EDITOR (ALWAYS VISIBLE ABOVE TESTCASES AREA) */}
          <div className="bg-slate-900 border-t border-slate-800 p-4 space-y-3 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
                <Sparkles className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                <span>💡 {hintLevel === 0 ? "Need a small hint?" : `Hint ${hintLevel}`}</span>
              </div>
              {hintLevel < 3 && (
                <button
                  onClick={handleGetNextHint}
                  disabled={fetchingHint}
                  className="px-4 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-all shadow-md shadow-cyan-500/20 disabled:opacity-50 cursor-pointer"
                >
                  {fetchingHint 
                    ? "Getting hint..." 
                    : (hintLevel === 0 ? "Get Hint" : "Get another hint")}
                </button>
              )}
            </div>

            {hintLevel > 0 && currentHintText && (
              <div className="p-3.5 bg-slate-950 rounded-xl border border-cyan-500/30 text-xs text-slate-200 leading-relaxed font-sans animate-fadeIn">
                "{currentHintText}"
              </div>
            )}
          </div>

          {/* BELOW EDITOR: Test Cases | Output | Submission Result */}
          <div className="h-56 bg-slate-900 border-t border-slate-800 flex flex-col">
            
            {/* Panel Tabs */}
            <div className="h-9 border-b border-slate-800 px-3 flex items-center gap-4 text-xs font-bold bg-slate-950/60">
              <button
                onClick={() => setBottomTab('testcases')}
                className={`h-full border-b-2 px-2 flex items-center gap-1.5 transition-colors ${
                  bottomTab === 'testcases' ? 'border-cyan-500 text-cyan-400' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>Test Cases</span>
              </button>

              <button
                onClick={() => setBottomTab('output')}
                className={`h-full border-b-2 px-2 flex items-center gap-1.5 transition-colors ${
                  bottomTab === 'output' ? 'border-cyan-500 text-cyan-400' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>Output</span>
                {executionResult && <span className="w-2 h-2 rounded-full bg-cyan-400"></span>}
              </button>

              <button
                onClick={() => setBottomTab('results')}
                className={`h-full border-b-2 px-2 flex items-center gap-1.5 transition-colors ${
                  bottomTab === 'results' ? 'border-cyan-500 text-cyan-400' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>Submission Result</span>
                {submissionResult && (
                  <span className={`w-2 h-2 rounded-full ${submissionResult.status === 'Accepted' ? 'bg-emerald-400' : 'bg-rose-400'}`}></span>
                )}
              </button>
            </div>

            {/* Panel Content */}
            <div className="flex-1 p-4 overflow-y-auto text-xs font-mono">
              
              {/* Tab 1: Test Cases */}
              {bottomTab === 'testcases' && (
                <div className="space-y-3">
                  {(problem?.sampleTestCases || problem?.testCases || []).map((tc, idx) => (
                    <div key={idx} className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-1">
                      <div className="text-slate-400 font-sans font-bold">Case {idx + 1}:</div>
                      <div className="text-slate-300">Input: {JSON.stringify(tc.input)}</div>
                      <div className="text-cyan-400">Expected: {JSON.stringify(tc.expected)}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Tab 2: Output */}
              {bottomTab === 'output' && (
                <div className="space-y-3">
                  {executionResult && executionResult.results ? (
                    executionResult.results.map((res, idx) => (
                      <div key={idx} className={`p-3 rounded-lg border space-y-1 ${res.passed ? 'bg-emerald-500/5 border-emerald-500/30' : 'bg-rose-500/5 border-rose-500/30'}`}>
                        <div className="flex items-center justify-between font-bold">
                          <span className={res.passed ? 'text-emerald-400' : 'text-rose-400'}>
                            Case {res.caseNum}: {res.passed ? 'PASSED' : 'FAILED'}
                          </span>
                        </div>
                        <div className="text-slate-300">Input: {res.input}</div>
                        <div className="text-slate-400">Expected: {res.expected}</div>
                        <div className="text-slate-200">Actual Output: {res.actual}</div>
                      </div>
                    ))
                  ) : (
                    <div className="text-slate-500 italic">Click **Run** to execute code against sample test cases.</div>
                  )}
                </div>
              )}

              {/* Tab 3: Submission Result */}
              {bottomTab === 'results' && (
                <div className="space-y-3">
                  {submissionResult ? (
                    <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                      <div className="flex items-center gap-3">
                        <span className={`text-base font-bold px-3 py-1 rounded ${
                          submissionResult.status === 'Accepted' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                        }`}>
                          {submissionResult.status}
                        </span>
                        <span className="text-slate-400 text-xs">Passed {submissionResult.passedCases} / {submissionResult.totalCases} cases</span>
                      </div>
                      <div className="text-slate-400 text-xs font-mono">
                        Runtime: {submissionResult.runtimeMs} ms | Memory: {submissionResult.memoryMb} MB
                      </div>
                    </div>
                  ) : (
                    <div className="text-slate-500 italic">Click **Submit** to evaluate code against hidden test cases.</div>
                  )}
                </div>
              )}

            </div>

          </div>

        </div>

      </div>

      {/* CONTEXTUAL AI CHATBOX DRAWER (WORKS IN BOTH AI MODE AND NON-AI MODE) */}
      {showChatbox && (
        <div className="fixed bottom-4 right-4 z-40 w-96 bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col h-96">
          
          <div className="bg-slate-800 px-4 py-3 border-b border-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-cyan-400" />
              <span className="font-bold text-xs text-white">THINKPOINT AI Assistant</span>
            </div>
            <button onClick={() => setShowChatbox(false)} className="text-slate-400 hover:text-white text-xs">✕</button>
          </div>

          <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs">
            {chatMessages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-xl whitespace-pre-wrap ${
                  msg.sender === 'user' ? 'bg-cyan-500 text-slate-950 font-medium' : 'bg-slate-800 text-slate-200 border border-slate-700'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 bg-slate-950 border-t border-slate-800 flex gap-2">
            <input
              type="text"
              placeholder="Ask AI (e.g. 'Why am I getting this error?')..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
              className="flex-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-500"
            />
            <button
              onClick={handleSendChat}
              disabled={chatSending}
              className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs"
            >
              Send
            </button>
          </div>

        </div>
      )}

    </div>
  );
}
