import express from 'express'
import rateLimit from 'express-rate-limit'
import { body } from 'express-validator'
import { suggestGoals } from '../controllers/aiController.js'
import { protect } from '../middleware/authMiddleware.js'

const router = express.Router()

// Tighter rate limit for AI endpoint (Claude API costs money)
const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  message: { message: 'Too many AI requests — try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
})

router.use(protect)
router.post(
  '/suggest-goals',
  aiLimiter,
  body('intent').trim().notEmpty().withMessage('Intent is required'),
  suggestGoals
)

export default router
