import express from 'express'
import { body } from 'express-validator'
import { authUser, registerUser, getMe } from '../controllers/userController.js'
import { protect } from '../middleware/authMiddleware.js'

const router = express.Router()

router.post(
  '/',
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 chars'),
  registerUser
)

router.post(
  '/login',
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
  authUser
)

router.get('/me', protect, getMe)

export default router