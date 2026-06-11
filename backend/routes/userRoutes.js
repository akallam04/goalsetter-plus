import express from 'express'
import { body } from 'express-validator'
import { authUser, registerUser, getMe, updateMe } from '../controllers/userController.js'
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

router.put(
  '/me',
  protect,
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('email').optional().isEmail().withMessage('Valid email is required'),
  body('newPassword').optional().isLength({ min: 6 }).withMessage('New password must be at least 6 chars'),
  updateMe
)

export default router