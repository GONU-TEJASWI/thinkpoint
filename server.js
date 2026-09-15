const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const { router: authRoutes } = require('./routes/auth');
const problemsRoutes = require('./routes/problems');
const { router: executionRoutes } = require('./routes/execution');
const aiRoutes = require('./routes/ai');
const submissionsRoutes = require('./routes/submissions');
const dashboardRoutes = require('./routes/dashboard');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/problems', problemsRoutes);
app.use('/api/execute', executionRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/submissions', submissionsRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'THINKPOINT REST API', timestamp: new Date().toISOString() });
});

// Serve static frontend in production if dist directory exists
const distPath = path.join(__dirname, '../dist');
app.use(express.static(distPath));
app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  res.sendFile(path.join(distPath, 'index.html'), (err) => {
    if (err) res.status(200).send('THINKPOINT Server Running');
  });
});

app.listen(PORT, () => {
  console.log(`🚀 THINKPOINT API Backend running on http://localhost:${PORT}`);
});
