import express from 'express'
import { body } from 'express-validator'
import {
  getGoals,
  getGoalById,
  createGoal,
  updateGoal,
  deleteGoal,
} from '../controllers/goalController.js'
import { protect } from '../middleware/authMiddleware.js'

const router = express.Router()

router.use(protect)

router
  .route('/')
  .get(getGoals)
  .post(
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('priority')
      .optional()
      .isIn(['low', 'medium', 'high'])
      .withMessage('Priority must be low, medium, or high'),
    body('status')
      .optional()
      .isIn(['active', 'completed'])
      .withMessage('Status must be active or completed'),
    createGoal
  )

router
  .route('/:id')
  .get(getGoalById)
  .put(
    body('priority')
      .optional()
      .isIn(['low', 'medium', 'high'])
      .withMessage('Priority must be low, medium, or high'),
    body('status')
      .optional()
      .isIn(['active', 'completed'])
      .withMessage('Status must be active or completed'),
    updateGoal
  )
  .delete(deleteGoal)

export default router
