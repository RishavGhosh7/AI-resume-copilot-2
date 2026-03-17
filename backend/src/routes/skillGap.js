import { Router } from 'express';
import { getSkillGaps } from '../services/ai.js';

const router = Router();

/**
 * POST /api/skill-gap
 * Body: { resumeText: string, jobDescription?: string }
 * Returns: { skills: [{ name, level, required, status }], recommendations } — for SkillGapAnalysis
 */
router.post('/skill-gap', async (req, res) => {
  try {
    const { resumeText, jobDescription } = req.body || {};
    const text = (resumeText || '').trim();
    if (!text) {
      return res.status(400).json({ error: 'resumeText is required' });
    }
    const result = await getSkillGaps(text, jobDescription || '');
    res.json(result);
  } catch (err) {
    console.error('Skill gap error:', err);
    res.status(500).json({
      error: err.message || 'Skill gap analysis failed',
      ...(process.env.OPENAI_API_KEY ? {} : { hint: 'OPENAI_API_KEY may be missing' })
    });
  }
});

export default router;
