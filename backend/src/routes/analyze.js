import { Router } from 'express';
import { analyzeResume } from '../services/ai.js';

const router = Router();

/**
 * POST /api/resume/analyze
 * Body: { resumeText: string } or multipart file (future)
 * Returns: { score, issues, strengths?, weaknesses?, suggestions? } — shape for ATSScoreCard
 */
router.post('/analyze', async (req, res) => {
  try {
    const resumeText = req.body?.resumeText?.trim();
    if (!resumeText) {
      return res.status(400).json({ error: 'resumeText is required' });
    }
    const result = await analyzeResume(resumeText);
    res.json(result);
  } catch (err) {
    console.error('Analyze error:', err);
    res.status(500).json({
      error: err.message || 'Resume analysis failed',
      ...(process.env.OPENAI_API_KEY ? {} : { hint: 'OPENAI_API_KEY may be missing' })
    });
  }
});

export default router;
