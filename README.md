# THINKPOINT — AI-Guided Coding & Problem Solving Platform

THINKPOINT is an intelligent, interactive coding platform designed to build algorithmic problem-solving skills for beginners and computer science students. Rather than providing direct copy-paste solutions, THINKPOINT utilizes structured, progressive guidance, real-time syntax assistance, and multi-language execution to help students learn effectively.

---

## Key Features

1. **7 Core Beginner Algorithmic Problems**:
   - Add Two Numbers
   - Subtract Two Numbers
   - Multiply Two Numbers
   - Find the Larger Number
   - Check Even or Odd
   - Find the Remainder
   - Square of a Number
   *Each problem includes synchronized method signatures across Java 17, JavaScript, Python 3, and C++ 20.*

2. **Dual Mode Workbench**:
   - **AI Mode**: Active real-time syntax error detection, automated proactive hints, progressive 3-level hints, and post-submission complexity analysis.
   - **NON-AI Mode**: Traditional competitive programming workbench for self-reliant assessment.

3. **Multi-Language Sandbox Execution**:
   - Direct support for **Java 17** (compiled & executed via local JDK) and **JavaScript ES6** (executed via Node.js runtime).
   - Instant sample test case evaluation (Run) and hidden test suite verification (Submit).

4. **Monaco Code Editor**:
   - Professional IDE experience powered by VS Code's Monaco Editor with syntax highlighting, error markers, and silent copy/paste learning protection.

5. **Real User Statistics & Achievements**:
   - Dashboard & Profile reflect **100% real user activity** (Problems Solved, Total Submissions, Accuracy Rate, Daily Streaks, and Level Badges).
   - Zero hardcoded or fake statistics.

6. **Interactive AI Coding Assistant**:
   - Built-in contextual AI Chatbox accessible across both modes for clarifying problem constraints, syntax errors, and algorithm concepts.

---

## Technologies Used

- **Frontend**: React 18, Vite 5, Tailwind CSS 4, Monaco Editor (`@monaco-editor/react`), Lucide React icons, Recharts
- **Backend**: Node.js, Express.js, CORS, Dotenv
- **AI Backend**: OpenRouter API (`openrouter/free` model gateway)
- **Code Execution**: Java 17 JDK (`javac` / `java`), Node.js ES6 runtime

---

## System Requirements

1. **Node.js**: Node.js v18.0.0 or higher (with npm) installed.
2. **Java 17 JDK**: Java 17 JDK installed and added to the system PATH.
   - Verify by running `java -version` and `javac -version` in your terminal.

---

## Setup & Environment Configuration

### 1. Install Dependencies
Navigate to the project root directory and run:
```bash
npm install
```

### 2. Environment Variables Setup
Copy `.env.example` to create your local `.env` file:
```bash
cp .env.example .env
```
*(On Windows Command Prompt, use `copy .env.example .env`)*

Open `.env` and set your OpenRouter API key:
```env
OPENROUTER_API_KEY=your_actual_openrouter_api_key_here
PORT=5000
```

> ⚠️ **SECURITY WARNING**:
> The AI features require the student's or reviewer's own OpenRouter API key. **NEVER** commit or share your `.env` file publicly. A free API key can be obtained at [OpenRouter API Keys](https://openrouter.ai/keys).

---

## Running the Application

### 1. Start the Backend Server
In the project root directory, run:
```bash
node server/server.js
# OR
npm run server
```
The Express backend server will start running on **`http://localhost:5000`**.

### 2. Start the Frontend Application
In a separate terminal window, run:
```bash
npm run dev
```
The Vite development server will start running on **`http://localhost:5173`**.

### 3. Access THINKPOINT
Open your web browser and navigate to:
**`http://localhost:5173`**

---

## Project Structure Overview

```
thinkpoint/
├── package.json               # Project dependencies and scripts
├── vite.config.js             # Vite configuration
├── tailwind.config.js         # Tailwind CSS styling configuration
├── .env.example               # Template for environment variables (safe)
├── README.md                  # Project documentation & setup guide
├── server/                    # Node.js / Express Backend
│   ├── server.js              # Express app entry point
│   ├── data/                  # Problem datasets & starter templates
│   ├── routes/                # API routes (execution, AI, problems, auth)
│   └── services/              # Executor service (Java 17 / JS runners) & AI gateway
└── src/                       # React Frontend Application
    ├── components/            # UI components (Navbar, Sidebar, Badges, etc.)
    ├── pages/                 # Main views (Dashboard, Problem Library, Workbench, Profile)
    ├── services/              # Frontend API & AI client integration
    ├── App.jsx                # Main application component & router
    └── main.jsx               # React entry point
```

---

## License & Submission Notice

Created for academic submission and project review. All problem datasets, execution logic, and AI prompt templates belong to the THINKPOINT project.
