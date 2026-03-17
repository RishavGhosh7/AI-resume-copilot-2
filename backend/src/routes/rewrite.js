import { Router } from 'express';
import { rewriteResume } from '../services/ai.js';

const router = Router();

/**
 * POST /api/rewrite
 * Body: { resumeText: string, jobDescription?: string }
 * Returns: { suggestions: [{ type, original, suggested, reason }] } — for ResumeEditor
 */
router.post('/rewrite', async (req, res) => {
  try {
    const { resumeText, jobDescription } = req.body || {};
    const text = (resumeText || '').trim();
    if (!text) {
      return res.status(400).json({ error: 'resumeText is required' });
    }
    const result = await rewriteResume(text, jobDescription || null);
    const suggestions = Array.isArray(result?.suggestions) ? result.suggestions : [];
    res.json({ suggestions });
  } catch (err) {
    console.error('Rewrite error:', err);
    res.status(500).json({
      error: err.message || 'Rewrite suggestions failed',
      ...(process.env.OPENAI_API_KEY ? {} : { hint: 'OPENAI_API_KEY may be missing' })
    });
  }
});

export default router;
