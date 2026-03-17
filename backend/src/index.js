import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { getProviderInfo } from './services/ai.js';
import analyzeRoutes from './routes/analyze.js';
import matchRoutes from './routes/match.js';
import skillGapRoutes from './routes/skillGap.js';
import rewriteRoutes from './routes/rewrite.js';
import resumeRoutes from './routes/resume.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: true }));
app.use(express.json({ limit: '1mb' }));

app.use('/api/resume', resumeRoutes);
app.use('/api/resume', analyzeRoutes);
app.use('/api', matchRoutes);
app.use('/api', skillGapRoutes);
app.use('/api', rewriteRoutes);

app.get('/health', (_, res) => {
  res.json({ status: 'ok', ...getProviderInfo() });
});

const HOST = process.env.HOST || '0.0.0.0';
app.listen(PORT, HOST, () => {
  console.log(`AI Resume Copilot API running at http://${HOST}:${PORT}`);
});
