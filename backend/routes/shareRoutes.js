import express from 'express'
import { generateShareToken, revokeShareToken, getSharedGoals } from '../controllers/shareController.js'
import { protect } from '../middleware/authMiddleware.js'

const router = express.Router()

// Public — no auth
router.get('/:token', getSharedGoals)

// Protected
router.post('/generate', protect, generateShareToken)
router.delete('/revoke', protect, revokeShareToken)

export default router
