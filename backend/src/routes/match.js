import { Router } from 'express';
import { getMatchScore } from '../services/ai.js';

const router = Router();

/**
 * POST /api/match
 * Body: { resumeText: string, jobDescription?: string }
 * Returns: { matchScore, matchedSkills, missingKeywords?, matchedCount?, totalRequirements?, explanation? } — for JobMatchCard
 */
router.post('/match', async (req, res) => {
  try {
    const { resumeText, jobDescription } = req.body || {};
    const text = (resumeText || '').trim();
    if (!text) {
      return res.status(400).json({ error: 'resumeText is required' });
    }
    const result = await getMatchScore(text, jobDescription || '');
    res.json(result);
  } catch (err) {
    console.error('Match error:', err);
    res.status(500).json({
      error: err.message || 'Job match scoring failed',
      ...(process.env.OPENAI_API_KEY ? {} : { hint: 'OPENAI_API_KEY may be missing' })
    });
  }
});

export default router;
