import { Router } from 'express';
import { generateResume } from '../services/ai.js';

const router = Router();

/**
 * POST /api/resume/generate
 * Body: { profile: object, jobDescription?: string, template?: string }
 * template: chronological | functional | modern | minimal
 * Returns: { resume, sections? }
 */
router.post('/generate', async (req, res) => {
  try {
    const { profile, jobDescription, template } = req.body || {};
    if (!profile || typeof profile !== 'object') {
      return res.status(400).json({ error: 'profile object is required' });
    }
    const result = await generateResume(profile, jobDescription || '', template || '');
    res.json(result);
  } catch (err) {
    console.error('Generate error:', err);
    res.status(500).json({
      error: err.message || 'Resume generation failed',
      ...(process.env.OPENAI_API_KEY ? {} : { hint: 'OPENAI_API_KEY may be missing' })
    });
  }
});

export default router;
