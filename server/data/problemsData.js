const problems = [
  {
    id: "add-two-numbers",
    title: "Add Two Numbers",
    difficulty: "Easy",
    topics: ["Math", "Beginner"],
    acceptanceRate: "95.5%",
    solvedStatus: "Unsolved",
    methodName: "add",
    functionName: "add",
    supportedLanguages: ["javascript", "java", "python", "cpp"],
    description: "Given two numbers, calculate and return their sum.",
    constraints: [
      "-10^9 <= a, b <= 10^9"
    ],
    examples: [
      { input: "a = 5, b = 3", output: "8" },
      { input: "a = 10, b = 7", output: "17" }
    ],
    sampleTestCases: [
      { input: { a: 5, b: 3 }, expected: 8 },
      { input: { a: 10, b: 7 }, expected: 17 }
    ],
    testCases: [
      { input: { a: 5, b: 3 }, expected: 8 },
      { input: { a: 10, b: 7 }, expected: 17 }
    ],
    hiddenTestCases: [
      { input: { a: 0, b: 0 }, expected: 0 },
      { input: { a: -5, b: 3 }, expected: -2 },
      { input: { a: 100, b: 25 }, expected: 125 }
    ],
    starterCode: `function add(a, b) {\n    // Write your code here\n    \n}`,
    starterTemplates: {
      javascript: `function add(a, b) {\n    // Write your code here\n    \n}`,
      python: `class Solution:\n    def add(self, a: int, b: int) -> int:\n        # Write your code here\n        pass`,
      java: `class Solution {\n    public int add(int a, int b) {\n        // Write your code here\n        return 0;\n    }\n}`,
      cpp: `class Solution {\npublic:\n    int add(int a, int b) {\n        // Write your code here\n        return 0;\n    }\n};`
    }
  },
  {
    id: "subtract-two-numbers",
    title: "Subtract Two Numbers",
    difficulty: "Easy",
    topics: ["Math", "Beginner"],
    acceptanceRate: "94.8%",
    solvedStatus: "Unsolved",
    methodName: "subtract",
    functionName: "subtract",
    supportedLanguages: ["javascript", "java", "python", "cpp"],
    description: "Given two numbers, calculate the first number minus the second number.",
    constraints: [
      "-10^9 <= a, b <= 10^9"
    ],
    examples: [
      { input: "a = 10, b = 4", output: "6" },
      { input: "a = 20, b = 5", output: "15" }
    ],
    sampleTestCases: [
      { input: { a: 10, b: 4 }, expected: 6 },
      { input: { a: 20, b: 5 }, expected: 15 }
    ],
    testCases: [
      { input: { a: 10, b: 4 }, expected: 6 },
      { input: { a: 20, b: 5 }, expected: 15 }
    ],
    hiddenTestCases: [
      { input: { a: 0, b: 5 }, expected: -5 },
      { input: { a: -5, b: 3 }, expected: -8 },
      { input: { a: 100, b: 25 }, expected: 75 }
    ],
    starterCode: `function subtract(a, b) {\n    // Write your code here\n    \n}`,
    starterTemplates: {
      javascript: `function subtract(a, b) {\n    // Write your code here\n    \n}`,
      python: `class Solution:\n    def subtract(self, a: int, b: int) -> int:\n        # Write your code here\n        pass`,
      java: `class Solution {\n    public int subtract(int a, int b) {\n        // Write your code here\n        return 0;\n    }\n}`,
      cpp: `class Solution {\npublic:\n    int subtract(int a, int b) {\n        // Write your code here\n        return 0;\n    }\n};`
    }
  },
  {
    id: "multiply-two-numbers",
    title: "Multiply Two Numbers",
    difficulty: "Easy",
    topics: ["Math", "Beginner"],
    acceptanceRate: "93.9%",
    solvedStatus: "Unsolved",
    methodName: "multiply",
    functionName: "multiply",
    supportedLanguages: ["javascript", "java", "python", "cpp"],
    description: "Given two numbers, calculate their product.",
    constraints: [
      "-10^9 <= a, b <= 10^9"
    ],
    examples: [
      { input: "a = 4, b = 5", output: "20" },
      { input: "a = 10, b = 3", output: "30" }
    ],
    sampleTestCases: [
      { input: { a: 4, b: 5 }, expected: 20 },
      { input: { a: 10, b: 3 }, expected: 30 }
    ],
    testCases: [
      { input: { a: 4, b: 5 }, expected: 20 },
      { input: { a: 10, b: 3 }, expected: 30 }
    ],
    hiddenTestCases: [
      { input: { a: 0, b: 5 }, expected: 0 },
      { input: { a: -5, b: 3 }, expected: -15 },
      { input: { a: -4, b: -2 }, expected: 8 }
    ],
    starterCode: `function multiply(a, b) {\n    // Write your code here\n    \n}`,
    starterTemplates: {
      javascript: `function multiply(a, b) {\n    // Write your code here\n    \n}`,
      python: `class Solution:\n    def multiply(self, a: int, b: int) -> int:\n        # Write your code here\n        pass`,
      java: `class Solution {\n    public int multiply(int a, int b) {\n        // Write your code here\n        return 0;\n    }\n}`,
      cpp: `class Solution {\npublic:\n    int multiply(int a, int b) {\n        // Write your code here\n        return 0;\n    }\n};`
    }
  },
  {
    id: "find-the-larger-number",
    title: "Find the Larger Number",
    difficulty: "Easy",
    topics: ["Conditionals", "Beginner"],
    acceptanceRate: "92.1%",
    solvedStatus: "Unsolved",
    methodName: "larger",
    functionName: "larger",
    supportedLanguages: ["javascript", "java", "python", "cpp"],
    description: "Given two numbers, return the larger number.",
    constraints: [
      "-10^9 <= a, b <= 10^9"
    ],
    examples: [
      { input: "a = 8, b = 5", output: "8" },
      { input: "a = 3, b = 10", output: "10" }
    ],
    sampleTestCases: [
      { input: { a: 8, b: 5 }, expected: 8 },
      { input: { a: 3, b: 10 }, expected: 10 }
    ],
    testCases: [
      { input: { a: 8, b: 5 }, expected: 8 },
      { input: { a: 3, b: 10 }, expected: 10 }
    ],
    hiddenTestCases: [
      { input: { a: 5, b: 5 }, expected: 5 },
      { input: { a: -2, b: -8 }, expected: -2 },
      { input: { a: -10, b: 4 }, expected: 4 }
    ],
    starterCode: `function larger(a, b) {\n    // Write your code here\n    \n}`,
    starterTemplates: {
      javascript: `function larger(a, b) {\n    // Write your code here\n    \n}`,
      python: `class Solution:\n    def larger(self, a: int, b: int) -> int:\n        # Write your code here\n        pass`,
      java: `class Solution {\n    public int larger(int a, int b) {\n        // Write your code here\n        return 0;\n    }\n}`,
      cpp: `class Solution {\npublic:\n    int larger(int a, int b) {\n        // Write your code here\n        return 0;\n    }\n};`
    }
  },
  {
    id: "check-even-or-odd",
    title: "Check Even or Odd",
    difficulty: "Easy",
    topics: ["Conditionals", "Math", "Beginner"],
    acceptanceRate: "91.4%",
    solvedStatus: "Unsolved",
    methodName: "checkEvenOdd",
    functionName: "checkEvenOdd",
    supportedLanguages: ["javascript", "java", "python", "cpp"],
    description: "Given an integer, determine whether it is even or odd. Return \"Even\" or \"Odd\".",
    constraints: [
      "-10^9 <= n <= 10^9"
    ],
    examples: [
      { input: "n = 6", output: '"Even"' },
      { input: "n = 7", output: '"Odd"' }
    ],
    sampleTestCases: [
      { input: { n: 6 }, expected: "Even" },
      { input: { n: 7 }, expected: "Odd" }
    ],
    testCases: [
      { input: { n: 6 }, expected: "Even" },
      { input: { n: 7 }, expected: "Odd" }
    ],
    hiddenTestCases: [
      { input: { n: 0 }, expected: "Even" },
      { input: { n: -4 }, expected: "Even" },
      { input: { n: -7 }, expected: "Odd" }
    ],
    starterCode: `function checkEvenOdd(n) {\n    // Write your code here\n    \n}`,
    starterTemplates: {
      javascript: `function checkEvenOdd(n) {\n    // Write your code here\n    \n}`,
      python: `class Solution:\n    def checkEvenOdd(self, n: int) -> str:\n        # Write your code here\n        pass`,
      java: `class Solution {\n    public String checkEvenOdd(int n) {\n        // Write your code here\n        return "";\n    }\n}`,
      cpp: `class Solution {\npublic:\n    string checkEvenOdd(int n) {\n        // Write your code here\n        return "";\n    }\n};`
    }
  },
  {
    id: "find-the-remainder",
    title: "Find the Remainder",
    difficulty: "Easy",
    topics: ["Math", "Beginner"],
    acceptanceRate: "90.7%",
    solvedStatus: "Unsolved",
    methodName: "remainder",
    functionName: "remainder",
    supportedLanguages: ["javascript", "java", "python", "cpp"],
    description: "Given two integers, return the remainder when the first number is divided by the second.",
    constraints: [
      "1 <= a, b <= 10^9"
    ],
    examples: [
      { input: "a = 10, b = 3", output: "1" },
      { input: "a = 20, b = 6", output: "2" }
    ],
    sampleTestCases: [
      { input: { a: 10, b: 3 }, expected: 1 },
      { input: { a: 20, b: 6 }, expected: 2 }
    ],
    testCases: [
      { input: { a: 10, b: 3 }, expected: 1 },
      { input: { a: 20, b: 6 }, expected: 2 }
    ],
    hiddenTestCases: [
      { input: { a: 8, b: 2 }, expected: 0 },
      { input: { a: 7, b: 4 }, expected: 3 },
      { input: { a: 15, b: 4 }, expected: 3 }
    ],
    starterCode: `function remainder(a, b) {\n    // Write your code here\n    \n}`,
    starterTemplates: {
      javascript: `function remainder(a, b) {\n    // Write your code here\n    \n}`,
      python: `class Solution:\n    def remainder(self, a: int, b: int) -> int:\n        # Write your code here\n        pass`,
      java: `class Solution {\n    public int remainder(int a, int b) {\n        // Write your code here\n        return 0;\n    }\n}`,
      cpp: `class Solution {\npublic:\n    int remainder(int a, int b) {\n        // Write your code here\n        return 0;\n    }\n};`
    }
  },
  {
    id: "square-of-a-number",
    title: "Square of a Number",
    difficulty: "Easy",
    topics: ["Math", "Beginner"],
    acceptanceRate: "96.2%",
    solvedStatus: "Unsolved",
    methodName: "square",
    functionName: "square",
    supportedLanguages: ["javascript", "java", "python", "cpp"],
    description: "Given a number, return its square.",
    constraints: [
      "-10^4 <= n <= 10^4"
    ],
    examples: [
      { input: "n = 5", output: "25" },
      { input: "n = 10", output: "100" }
    ],
    sampleTestCases: [
      { input: { n: 5 }, expected: 25 },
      { input: { n: 10 }, expected: 100 }
    ],
    testCases: [
      { input: { n: 5 }, expected: 25 },
      { input: { n: 10 }, expected: 100 }
    ],
    hiddenTestCases: [
      { input: { n: 0 }, expected: 0 },
      { input: { n: -4 }, expected: 16 },
      { input: { n: 12 }, expected: 144 }
    ],
    starterCode: `function square(n) {\n    // Write your code here\n    \n}`,
    starterTemplates: {
      javascript: `function square(n) {\n    // Write your code here\n    \n}`,
      python: `class Solution:\n    def square(self, n: int) -> int:\n        # Write your code here\n        pass`,
      java: `class Solution {\n    public int square(int n) {\n        // Write your code here\n        return 0;\n    }\n}`,
      cpp: `class Solution {\npublic:\n    int square(int n) {\n        // Write your code here\n        return 0;\n    }\n};`
    }
  },
  {
    id: "two-sum",
    title: "Two Sum",
    difficulty: "Easy",
    topics: ["Arrays", "Hash Table"],
    acceptanceRate: "49.2%",
    solvedStatus: "Solved",
    description: `Given an array of integers \`nums\` and an integer \`target\`, return indices of the two numbers such that they add up to \`target\`.

You may assume that each input would have **exactly one solution**, and you may not use the same element twice.

You can return the answer in any order.`,
    constraints: [
      "2 <= nums.length <= 10^4",
      "-10^9 <= nums[i] <= 10^9",
      "-10^9 <= target <= 10^9",
      "Only one valid answer exists."
    ],
    examples: [
      {
        input: "nums = [2,7,11,15], target = 9",
        output: "[0,1]",
        explanation: "Because nums[0] + nums[1] == 9, we return [0, 1]."
      },
      {
        input: "nums = [3,2,4], target = 6",
        output: "[1,2]",
        explanation: "Because nums[1] + nums[2] == 6, we return [1, 2]."
      },
      {
        input: "nums = [3,3], target = 6",
        output: "[0,1]",
        explanation: "Because nums[0] + nums[1] == 6, we return [0, 1]."
      }
    ],
    sampleTestCases: [
      { input: { nums: [2, 7, 11, 15], target: 9 }, expected: [0, 1] },
      { input: { nums: [3, 2, 4], target: 6 }, expected: [1, 2] },
      { input: { nums: [3, 3], target: 6 }, expected: [0, 1] }
    ],
    hiddenTestCases: [
      { input: { nums: [1, 5, 8, 12, 19], target: 20 }, expected: [2, 3] },
      { input: { nums: [-3, 4, 3, 90], target: 0 }, expected: [0, 2] },
      { input: { nums: [0, 4, 3, 0], target: 0 }, expected: [0, 3] },
      { input: { nums: [100, 200, 300, 400], target: 700 }, expected: [2, 3] }
    ],
    starterTemplates: {
      javascript: `function twoSum(nums, target) {\n    // Write your solution here\n    \n}`,
      python: `class Solution:\n    def twoSum(self, nums: list[int], target: int) -> list[int]:\n        # Write your solution here\n        pass`,
      java: `class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        // Write your solution here\n        return new int[]{};\n    }\n}`,
      cpp: `#include <vector>\n\nusing namespace std;\n\nclass Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        // Write your solution here\n        return {};\n    }\n};`
    }
  },
  {
    id: "valid-parentheses",
    title: "Valid Parentheses",
    difficulty: "Easy",
    topics: ["Strings", "Stack"],
    acceptanceRate: "40.5%",
    solvedStatus: "Solved",
    description: `Given a string \`s\` containing just the characters \`'(' \`, \`')'\`, \`'{'\`, \`'}'\`, \`'['\` and \`']'\`, determine if the input string is valid.

An input string is valid if:
1. Open brackets must be closed by the same type of brackets.
2. Open brackets must be closed in the correct order.
3. Every close bracket has a corresponding open bracket of the same type.`,
    constraints: [
      "1 <= s.length <= 10^4",
      "s consists of parentheses only '()[]{}'."
    ],
    examples: [
      { input: 's = "()"', output: "true" },
      { input: 's = "()[]{}"', output: "true" },
      { input: 's = "(]"', output: "false" }
    ],
    sampleTestCases: [
      { input: { s: "()" }, expected: true },
      { input: { s: "()[]{}" }, expected: true },
      { input: { s: "(]" }, expected: false }
    ],
    hiddenTestCases: [
      { input: { s: "([{}])" }, expected: true },
      { input: { s: "[(])" }, expected: false },
      { input: { s: "{" }, expected: false },
      { input: { s: "}}" }, expected: false }
    ],
    starterTemplates: {
      javascript: `function isValid(s) {\n    // Write your solution here\n    \n}`,
      python: `class Solution:\n    def isValid(self, s: str) -> bool:\n        # Write your solution here\n        pass`,
      java: `class Solution {\n    public boolean isValid(String s) {\n        // Write your solution here\n        return false;\n    }\n}`,
      cpp: `#include <string>\n\nusing namespace std;\n\nclass Solution {\npublic:\n    bool isValid(string s) {\n        // Write your solution here\n        return false;\n    }\n};`
    }
  },
  {
    id: "longest-substring-without-repeating-characters",
    title: "Longest Substring Without Repeating Characters",
    difficulty: "Medium",
    topics: ["Strings", "Sliding Window", "Hash Table"],
    acceptanceRate: "33.8%",
    solvedStatus: "Attempted",
    description: `Given a string \`s\`, find the length of the **longest substring** without repeating characters.`,
    constraints: [
      "0 <= s.length <= 5 * 10^4",
      "s consists of English letters, digits, symbols and spaces."
    ],
    examples: [
      { input: 's = "abcabcbb"', output: "3", explanation: 'The answer is "abc", with the length of 3.' },
      { input: 's = "bbbbb"', output: "1", explanation: 'The answer is "b", with the length of 1.' },
      { input: 's = "pwwkew"', output: "3", explanation: 'The answer is "wke", with the length of 3.' }
    ],
    sampleTestCases: [
      { input: { s: "abcabcbb" }, expected: 3 },
      { input: { s: "bbbbb" }, expected: 1 },
      { input: { s: "pwwkew" }, expected: 3 }
    ],
    hiddenTestCases: [
      { input: { s: "" }, expected: 0 },
      { input: { s: " " }, expected: 1 },
      { input: { s: "au" }, expected: 2 },
      { input: { s: "dvdf" }, expected: 3 }
    ],
    starterTemplates: {
      javascript: `function lengthOfLongestSubstring(s) {\n    // Write your solution here\n    \n}`,
      python: `class Solution:\n    def lengthOfLongestSubstring(self, s: str) -> int:\n        # Write your solution here\n        pass`,
      java: `class Solution {\n    public int lengthOfLongestSubstring(String s) {\n        // Write your solution here\n        return 0;\n    }\n}`,
      cpp: `#include <string>\n\nusing namespace std;\n\nclass Solution {\npublic:\n    int lengthOfLongestSubstring(string s) {\n        // Write your solution here\n        return 0;\n    }\n};`
    }
  },
  {
    id: "container-with-most-water",
    title: "Container With Most Water",
    difficulty: "Medium",
    topics: ["Arrays", "Two Pointers", "Greedy"],
    acceptanceRate: "54.1%",
    solvedStatus: "Unsolved",
    description: `You are given an integer array \`height\` of length \`n\`. There are \`n\` vertical lines drawn such that the two endpoints of the \`i-th\` line are \`(i, 0)\` and \`(i, height[i])\`.

Find two lines that together with the x-axis form a container, such that the container contains the most water.

Return the maximum amount of water a container can store.`,
    constraints: [
      "n == height.length",
      "2 <= n <= 10^5",
      "0 <= height[i] <= 10^4"
    ],
    examples: [
      { input: "height = [1,8,6,2,5,4,8,3,7]", output: "49" },
      { input: "height = [1,1]", output: "1" }
    ],
    sampleTestCases: [
      { input: { height: [1, 8, 6, 2, 5, 4, 8, 3, 7] }, expected: 49 },
      { input: { height: [1, 1] }, expected: 1 }
    ],
    hiddenTestCases: [
      { input: { height: [4, 3, 2, 1, 4] }, expected: 16 },
      { input: { height: [1, 2, 1] }, expected: 2 },
      { input: { height: [2, 3, 10, 5, 7, 8, 9] }, expected: 36 }
    ],
    starterTemplates: {
      javascript: `function maxArea(height) {\n    // Write your solution here\n    \n}`,
      python: `class Solution:\n    def maxArea(self, height: list[int]) -> int:\n        # Write your solution here\n        pass`,
      java: `class Solution {\n    public int maxArea(int[] height) {\n        // Write your solution here\n        return 0;\n    }\n}`,
      cpp: `#include <vector>\n\nusing namespace std;\n\nclass Solution {\npublic:\n    int maxArea(vector<int>& height) {\n        // Write your solution here\n        return 0;\n    }\n};`
    }
  },
  {
    id: "climbing-stairs",
    title: "Climbing Stairs",
    difficulty: "Easy",
    topics: ["Dynamic Programming", "Math"],
    acceptanceRate: "52.3%",
    solvedStatus: "Solved",
    description: `You are climbing a staircase. It takes \`n\` steps to reach the top.

Each time you can either climb \`1\` or \`2\` steps. In how many distinct ways can you climb to the top?`,
    constraints: [
      "1 <= n <= 45"
    ],
    examples: [
      { input: "n = 2", output: "2", explanation: "1. 1 step + 1 step\n2. 2 steps" },
      { input: "n = 3", output: "3", explanation: "1. 1 step + 1 step + 1 step\n2. 1 step + 2 steps\n3. 2 steps + 1 step" }
    ],
    sampleTestCases: [
      { input: { n: 2 }, expected: 2 },
      { input: { n: 3 }, expected: 3 }
    ],
    hiddenTestCases: [
      { input: { n: 1 }, expected: 1 },
      { input: { n: 5 }, expected: 8 },
      { input: { n: 10 }, expected: 89 }
    ],
    starterTemplates: {
      javascript: `function climbStairs(n) {\n    // Write your solution here\n    \n}`,
      python: `class Solution:\n    def climbStairs(self, n: int) -> int:\n        # Write your solution here\n        pass`,
      java: `class Solution {\n    public int climbStairs(int n) {\n        // Write your solution here\n        return 0;\n    }\n}`,
      cpp: `class Solution {\npublic:\n    int climbStairs(int n) {\n        // Write your solution here\n        return 0;\n    }\n};`
    }
  },
  {
    id: "median-of-two-sorted-arrays",
    title: "Median of Two Sorted Arrays",
    difficulty: "Hard",
    topics: ["Arrays", "Binary Search", "Divide and Conquer"],
    acceptanceRate: "37.9%",
    solvedStatus: "Unsolved",
    description: `Given two sorted arrays \`nums1\` and \`nums2\` of size \`m\` and \`n\` respectively, return the median of the two sorted arrays.

The overall run time complexity should be **O(log (m+n))**.`,
    constraints: [
      "nums1.length == m",
      "nums2.length == n",
      "0 <= m <= 1000",
      "0 <= n <= 1000",
      "1 <= m + n <= 2000"
    ],
    examples: [
      { input: "nums1 = [1,3], nums2 = [2]", output: "2.00000" },
      { input: "nums1 = [1,2], nums2 = [3,4]", output: "2.50000" }
    ],
    sampleTestCases: [
      { input: { nums1: [1, 3], nums2: [2] }, expected: 2.0 },
      { input: { nums1: [1, 2], nums2: [3, 4] }, expected: 2.5 }
    ],
    hiddenTestCases: [
      { input: { nums1: [0, 0], nums2: [0, 0] }, expected: 0.0 },
      { input: { nums1: [], nums2: [1] }, expected: 1.0 },
      { input: { nums1: [2], nums2: [] }, expected: 2.0 }
    ],
    starterTemplates: {
      javascript: `function findMedianSortedArrays(nums1, nums2) {\n    // Write your solution here\n    \n}`,
      python: `class Solution:\n    def findMedianSortedArrays(self, nums1: list[int], nums2: list[int]) -> float:\n        # Write your solution here\n        pass`,
      java: `class Solution {\n    public double findMedianSortedArrays(int[] nums1, int[] nums2) {\n        // Write your solution here\n        return 0.0;\n    }\n}`,
      cpp: `#include <vector>\n\nusing namespace std;\n\nclass Solution {\npublic:\n    double findMedianSortedArrays(vector<int>& nums1, vector<int>& nums2) {\n        // Write your solution here\n        return 0.0;\n    }\n};`
    }
  }
];

module.exports = problems;
