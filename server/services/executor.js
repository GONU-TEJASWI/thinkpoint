const vm = require('vm');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * Execute user code against provided test cases (sample or hidden)
 */
function executeCode(language, code, problem, mode = 'run') {
  const normLang = (language || '').toLowerCase().trim();

  // ROUTE JAVA EXECUTION TO REAL JAVA COMPILER & RUNNER
  if (normLang === 'java' || normLang === 'java 17' || (normLang.includes('java') && !normLang.includes('script'))) {
    return executeJavaCode(code, problem, mode);
  }

  // STANDARD JAVASCRIPT / PYTHON EXECUTION
  const startTime = Date.now();
  const testCases = mode === 'submit' 
    ? [...problem.sampleTestCases, ...problem.hiddenTestCases]
    : problem.sampleTestCases;

  let totalCases = testCases.length;
  let passedCases = 0;
  const results = [];
  let overallStatus = mode === 'submit' ? 'Accepted' : 'Passed';
  let firstError = null;

  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i];
    const isHidden = i >= problem.sampleTestCases.length;

    try {
      const execResult = runSingleTestCase(normLang, code, problem, testCase.input);
      const passed = deepEqual(execResult.actual, testCase.expected);

      if (passed) {
        passedCases++;
      } else {
        if (overallStatus === 'Passed' || overallStatus === 'Accepted') {
          overallStatus = 'Wrong Answer';
        }
      }

      results.push({
        caseNum: i + 1,
        isHidden,
        input: isHidden ? '[Hidden]' : JSON.stringify(testCase.input),
        expected: isHidden ? '[Hidden]' : JSON.stringify(testCase.expected),
        actual: isHidden ? (passed ? '[Hidden Passed]' : '[Hidden Failed]') : JSON.stringify(execResult.actual),
        passed,
        logs: execResult.logs || []
      });
    } catch (err) {
      if (!firstError) firstError = err;
      const isSyntax = err instanceof SyntaxError;
      const isTimeout = err.code === 'ERR_SCRIPT_EXECUTION_TIMEOUT' || (err.message && err.message.includes('timed out'));
      overallStatus = isSyntax ? 'Compilation Error' : (isTimeout ? 'Time Limit Exceeded' : 'Runtime Error');
      results.push({
        caseNum: i + 1,
        isHidden,
        input: isHidden ? '[Hidden]' : JSON.stringify(testCase.input),
        expected: isHidden ? '[Hidden]' : JSON.stringify(testCase.expected),
        actual: isTimeout ? 'Time Limit Exceeded (Execution took > 3000ms)' : ('Error: ' + err.message),
        passed: false,
        error: isTimeout ? 'Time Limit Exceeded' : err.message,
        logs: []
      });
      break;
    }
  }

  const duration = Date.now() - startTime;
  const memory = Math.floor(15 + Math.random() * 12);

  return {
    status: overallStatus,
    totalCases,
    passedCases,
    results,
    runtimeMs: duration + Math.floor(Math.random() * 10) + 1,
    memoryMb: memory,
    error: firstError ? firstError.message : null
  };
}

/**
 * Native Java 17/25 Execution Engine
 */
function executeJavaCode(code, problem, mode = 'run') {
  const startTime = Date.now();
  const testCases = mode === 'submit' 
    ? [...problem.sampleTestCases, ...problem.hiddenTestCases]
    : problem.sampleTestCases;

  let totalCases = testCases.length;
  let passedCases = 0;
  const results = [];
  let overallStatus = mode === 'submit' ? 'Accepted' : 'Passed';
  let firstError = null;

  if (!code || !code.includes('class Solution')) {
    return {
      status: 'Compilation Error',
      totalCases,
      passedCases: 0,
      results: testCases.map((tc, i) => ({
        caseNum: i + 1,
        isHidden: i >= problem.sampleTestCases.length,
        input: i >= problem.sampleTestCases.length ? '[Hidden]' : JSON.stringify(tc.input),
        expected: i >= problem.sampleTestCases.length ? '[Hidden]' : JSON.stringify(tc.expected),
        actual: "Error: Java code must declare 'class Solution'",
        passed: false,
        logs: []
      })),
      runtimeMs: 0,
      memoryMb: 24,
      error: "Java code must declare 'class Solution'"
    };
  }

  const scratchBase = path.join(__dirname, '../scratch');
  if (!fs.existsSync(scratchBase)) {
    try { fs.mkdirSync(scratchBase, { recursive: true }); } catch (e) {}
  }

  const tempDir = path.join(scratchBase, 'java_' + Date.now() + '_' + Math.floor(Math.random() * 10000));
  try {
    fs.mkdirSync(tempDir, { recursive: true });
  } catch (e) {}

  const caseStatements = testCases.map((tc, idx) => '          case ' + idx + ': ' + getJavaCaseCode(problem.id, tc.input) + ' break;').join('\n');

  const mainJavaContent = `import java.util.*;

${code}

public class Main {
  public static void main(String[] args) {
    if (args.length == 0) return;
    int c = Integer.parseInt(args[0]);
    Solution sol = new Solution();
    switch (c) {
${caseStatements}
    }
  }
}
`;

  fs.writeFileSync(path.join(tempDir, 'Main.java'), mainJavaContent, 'utf8');

  // 1. Compile Java Code
  try {
    execSync('javac Main.java', { cwd: tempDir, stdio: 'pipe' });
  } catch (compileErr) {
    const errStr = compileErr.stderr ? compileErr.stderr.toString() : (compileErr.stdout ? compileErr.stdout.toString() : compileErr.message);
    const cleanErr = cleanJavaCompilerError(errStr);
    try { fs.rmSync(tempDir, { recursive: true, force: true }); } catch (e) {}
    
    return {
      status: 'Compilation Error',
      totalCases,
      passedCases: 0,
      results: testCases.map((tc, i) => ({
        caseNum: i + 1,
        isHidden: i >= problem.sampleTestCases.length,
        input: i >= problem.sampleTestCases.length ? '[Hidden]' : JSON.stringify(tc.input),
        expected: i >= problem.sampleTestCases.length ? '[Hidden]' : JSON.stringify(tc.expected),
        actual: 'Compilation Error:\n' + cleanErr,
        passed: false,
        logs: []
      })),
      runtimeMs: Date.now() - startTime,
      memoryMb: 24,
      error: cleanErr
    };
  }

  // 2. Execute Test Cases using Java JVM
  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i];
    const isHidden = i >= problem.sampleTestCases.length;

    try {
      const out = execSync('java -cp . Main ' + i, { cwd: tempDir, timeout: 4000 }).toString().trim();
      const actualVal = parseJavaOutput(out, testCase.expected);
      const passed = deepEqual(actualVal, testCase.expected);

      if (passed) {
        passedCases++;
      } else {
        if (overallStatus === 'Passed' || overallStatus === 'Accepted') {
          overallStatus = 'Wrong Answer';
        }
      }

      results.push({
        caseNum: i + 1,
        isHidden,
        input: isHidden ? '[Hidden]' : JSON.stringify(testCase.input),
        expected: isHidden ? '[Hidden]' : JSON.stringify(testCase.expected),
        actual: isHidden ? (passed ? '[Hidden Passed]' : '[Hidden Failed]') : JSON.stringify(actualVal),
        passed,
        logs: []
      });
    } catch (err) {
      if (!firstError) firstError = err;
      const isTimeout = err.code === 'ERR_SCRIPT_EXECUTION_TIMEOUT' || (err.message && err.message.includes('timed out'));
      overallStatus = isTimeout ? 'Time Limit Exceeded' : 'Runtime Error';
      results.push({
        caseNum: i + 1,
        isHidden,
        input: isHidden ? '[Hidden]' : JSON.stringify(testCase.input),
        expected: isHidden ? '[Hidden]' : JSON.stringify(testCase.expected),
        actual: isTimeout ? 'Time Limit Exceeded (Execution took > 4000ms)' : ('Runtime Error: ' + err.message),
        passed: false,
        error: isTimeout ? 'Time Limit Exceeded' : err.message,
        logs: []
      });
      break;
    }
  }

  try { fs.rmSync(tempDir, { recursive: true, force: true }); } catch (e) {}

  const duration = Date.now() - startTime;
  return {
    status: overallStatus,
    totalCases,
    passedCases,
    results,
    runtimeMs: duration,
    memoryMb: 24,
    error: firstError ? firstError.message : null
  };
}

function cleanJavaCompilerError(rawErrStr) {
  let errStr = (rawErrStr || '').trim();
  errStr = errStr.replace(/.*Main\.java:/g, 'Main.java:');
  return errStr || 'Java compilation failed.';
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
    case 'two-sum': return 'twoSum';
    case 'valid-parentheses': return 'isValid';
    case 'longest-substring-without-repeating-characters': return 'lengthOfLongestSubstring';
    case 'container-with-most-water': return 'maxArea';
    case 'climbing-stairs': return 'climbStairs';
    case 'median-of-two-sorted-arrays': return 'findMedianSortedArrays';
    default: return norm.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
  }
}

function formatJavaVal(v) {
  if (Array.isArray(v)) return 'new int[]{' + v.join(', ') + '}';
  if (typeof v === 'string') return JSON.stringify(v);
  return String(v);
}

function getJavaCaseCode(problem, input) {
  const probObj = typeof problem === 'object' ? problem : null;
  const pId = typeof problem === 'string' ? problem : (problem ? problem.id : '');
  const method = (probObj && (probObj.methodName || probObj.functionName)) || getMethodNameFromId(pId);
  const norm = (pId || '').toLowerCase().trim();

  const keys = Object.keys(input || {});
  const argsList = keys.map(k => formatJavaVal(input[k])).join(', ');

  if (norm === 'two-sum' || method === 'twoSum') {
    return 'System.out.println(Arrays.toString(sol.' + method + '(' + argsList + ')));';
  }
  return 'System.out.println(sol.' + method + '(' + argsList + '));';
}

function parseJavaOutput(rawStr, expectedVal) {
  const str = (rawStr || '').trim();
  if (typeof expectedVal === 'number') {
    return Number(str);
  }
  if (typeof expectedVal === 'boolean') {
    return str.toLowerCase() === 'true';
  }
  if (Array.isArray(expectedVal)) {
    try {
      return JSON.parse(str);
    } catch (e) {
      if (str.startsWith('[') && str.endsWith(']')) {
        return str.slice(1, -1).split(',').map(s => Number(s.trim()));
      }
    }
  }
  if (str.startsWith('"') && str.endsWith('"')) {
    return str.slice(1, -1);
  }
  return str;
}

function runSingleTestCase(language, code, problem, inputParams) {
  const logs = [];
  const mockConsole = {
    log: (...args) => logs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ')),
    error: (...args) => logs.push('[ERROR] ' + args.join(' ')),
    warn: (...args) => logs.push('[WARN] ' + args.join(' '))
  };

  const normLang = (language || '').toLowerCase().trim();

  if (normLang === 'javascript' || normLang === 'js') {
    return runJavaScript(code, problem, inputParams, mockConsole, logs);
  } else if (normLang === 'python' || normLang === 'py') {
    return runPythonTranspiled(code, problem, inputParams, mockConsole, logs);
  } else if (normLang === 'cpp' || normLang === 'c++') {
    return runSimulatedCompiled(code, problem, inputParams, mockConsole, logs, 'cpp');
  } else {
    throw new Error(`Unsupported language: ${language}`);
  }
}

function runJavaScript(code, problem, inputParams, mockConsole, logs) {
  const contextObj = {
    console: mockConsole,
    __input__: inputParams,
    Map, Set, Math, Array, Object, String, Number, Boolean, RegExp, JSON
  };
  const context = vm.createContext(contextObj);

  const fullScript = code + '\n; const __runner__ = ' + getJSInvoker(problem) + ';\n__runner__(__input__);';
  const script = new vm.Script(fullScript);
  const actual = script.runInContext(context, { timeout: 3000 });

  return { actual, logs };
}

function getJSInvoker(problem) {
  const probObj = typeof problem === 'object' ? problem : null;
  const pId = typeof problem === 'string' ? problem : (problem ? problem.id : '');
  const fnName = (probObj && (probObj.functionName || probObj.methodName)) || getMethodNameFromId(pId);

  return `(function(__input__) {
    const keys = Object.keys(__input__ || {});
    const args = keys.map(k => __input__[k]);
    return ${fnName}(...args);
  })`;
}

function runPythonTranspiled(code, problemId, inputParams, mockConsole, logs) {
  let jsCode = code
    .replace(/def\s+(\w+)\s*\(([^)]*)\)\s*->\s*[^:]*:/g, 'function $1($2) {')
    .replace(/self,\s*/g, '')
    .replace(/elif\s+/g, '} else if ')
    .replace(/if\s+(.*?):/g, 'if ($1) {')
    .replace(/else:/g, '} else {')
    .replace(/for\s+(\w+),\s*(\w+)\s+in\s+enumerate\((\w+)\):/g, 'for (let $1 = 0; $1 < $3.length; $1++) { let $2 = $3[$1];')
    .replace(/for\s+(\w+)\s+in\s+range\((.*?)\):/g, 'for (let $1 = 0; $1 < $2; $1++) {')
    .replace(/len\((\w+)\)/g, '$1.length')
    .replace(/max\((.*?)\)/g, 'Math.max($1)')
    .replace(/min\((.*?)\)/g, 'Math.min($1)')
    .replace(/and\s+/g, '&& ')
    .replace(/or\s+/g, '|| ')
    .replace(/not\s+/g, '!')
    .replace(/True/g, 'true')
    .replace(/False/g, 'false')
    .replace(/return\s+/g, 'return ')
    .replace(/class Solution:/g, '// class Solution');

  const openCount = (jsCode.match(/\{/g) || []).length;
  const closeCount = (jsCode.match(/\}/g) || []).length;
  for (let i = 0; i < openCount - closeCount; i++) {
    jsCode += '\n}';
  }

  return runJavaScript(jsCode, problemId, inputParams, mockConsole, logs);
}

function runSimulatedCompiled(code, problemId, inputParams, mockConsole, logs, lang) {
  if (!code.includes('{') || !code.includes('}')) {
    throw new SyntaxError("Missing enclosing block braces '{ }'");
  }

  let jsCode = code
    .replace(/public\s+int\s+add\(int\s+a,\s+int\s+b\)/g, 'function add(a, b)')
    .replace(/int\s+add\(int\s+a,\s+int\s+b\)/g, 'function add(a, b)')
    .replace(/public\s+int\s+subtract\(int\s+a,\s+int\s+b\)/g, 'function subtract(a, b)')
    .replace(/int\s+subtract\(int\s+a,\s+int\s+b\)/g, 'function subtract(a, b)')
    .replace(/public\s+int\s+multiply\(int\s+a,\s+int\s+b\)/g, 'function multiply(a, b)')
    .replace(/int\s+multiply\(int\s+a,\s+int\s+b\)/g, 'function multiply(a, b)')
    .replace(/public\s+int\s+larger\(int\s+a,\s+int\s+b\)/g, 'function larger(a, b)')
    .replace(/int\s+larger\(int\s+a,\s+int\s+b\)/g, 'function larger(a, b)')
    .replace(/public\s+String\s+checkEvenOdd\(int\s+n\)/g, 'function checkEvenOdd(n)')
    .replace(/string\s+checkEvenOdd\(int\s+n\)/g, 'function checkEvenOdd(n)')
    .replace(/public\s+int\s+remainder\(int\s+a,\s+int\s+b\)/g, 'function remainder(a, b)')
    .replace(/int\s+remainder\(int\s+a,\s+int\s+b\)/g, 'function remainder(a, b)')
    .replace(/public\s+int\s+square\(int\s+n\)/g, 'function square(n)')
    .replace(/int\s+square\(int\s+n\)/g, 'function square(n)')
    .replace(/public\s+int\[\]\s+twoSum\(int\[\]\s+nums,\s+int\s+target\)/g, 'function twoSum(nums, target)')
    .replace(/vector<int>\s+twoSum\(vector<int>&\s+nums,\s+int\s+target\)/g, 'function twoSum(nums, target)')
    .replace(/public\s+boolean\s+isValid\(String\s+s\)/g, 'function isValid(s)')
    .replace(/bool\s+isValid\(string\s+s\)/g, 'function isValid(s)')
    .replace(/public\s+int\s+lengthOfLongestSubstring\(String\s+s\)/g, 'function lengthOfLongestSubstring(s)')
    .replace(/int\s+lengthOfLongestSubstring\(string\s+s\)/g, 'function lengthOfLongestSubstring(s)')
    .replace(/public\s+int\s+maxArea\(int\[\]\s+height\)/g, 'function maxArea(height)')
    .replace(/int\s+maxArea\(vector<int>&\s+height\)/g, 'function maxArea(height)')
    .replace(/public\s+int\s+climbStairs\(int\s+n\)/g, 'function climbStairs(n)')
    .replace(/int\s+climbStairs\(int\s+n\)/g, 'function climbStairs(n)')
    .replace(/public\s+double\s+findMedianSortedArrays\(int\[\]\s+nums1,\s+int\[\]\s+nums2\)/g, 'function findMedianSortedArrays(nums1, nums2)')
    .replace(/double\s+findMedianSortedArrays\(vector<int>&\s+nums1,\s+vector<int>&\s+nums2\)/g, 'function findMedianSortedArrays(nums1, nums2)')
    .replace(/class Solution\s*\{/g, '')
    .replace(/Map<.*?>\s+(\w+)\s*=\s*new HashMap<\(\);/g, 'const $1 = new Map();')
    .replace(/unordered_map<.*?>\s+(\w+);/g, 'const $1 = new Map();')
    .replace(/\.size\(\)/g, '.length')
    .replace(/Math\.max/g, 'Math.max')
    .replace(/Math\.min/g, 'Math.min');

  return runJavaScript(jsCode, problemId, inputParams, mockConsole, logs);
}

function deepEqual(a, b) {
  if (a === b) return true;
  if (typeof a !== typeof b) return false;
  if (typeof a === 'number' && typeof b === 'number') return Math.abs(a - b) < 1e-5;
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (!deepEqual(a[i], b[i])) return false;
    }
    return true;
  }
  if (typeof a === 'object' && a !== null && b !== null) {
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    if (keysA.length !== keysB.length) return false;
    for (let key of keysA) {
      if (!deepEqual(a[key], b[key])) return false;
    }
    return true;
  }
  return false;
}

module.exports = { executeCode };
