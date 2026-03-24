import { validationResult } from 'express-validator'
import mongoose from 'mongoose'
import Goal from '../models/goalModel.js'

const getGoals = async (req, res) => {
  const { status, category, priority, sortBy = 'createdAt', order = 'desc' } = req.query

  const filter = { user: req.user._id }
  if (status) filter.status = status
  if (category) filter.category = category
  if (priority) filter.priority = priority

  const allowedSort = ['createdAt', 'dueDate', 'priority', 'title']
  const sortField = allowedSort.includes(sortBy) ? sortBy : 'createdAt'
  const sortOrder = order === 'asc' ? 1 : -1

  const goals = await Goal.find(filter).sort({ [sortField]: sortOrder })
  res.json(goals)
}

const getGoalById = async (req, res) => {
  const { id } = req.params

  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400)
    throw new Error('Invalid goal id')
  }

  const goal = await Goal.findOne({ _id: id, user: req.user._id })

  if (!goal) {
    res.status(404)
    throw new Error('Goal not found')
  }

  res.json(goal)
}

const createGoal = async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    res.status(400)
    throw new Error(errors.array().map((e) => e.msg).join(', '))
  }

  const { title, description, category, priority, status, dueDate } = req.body

  const goal = await Goal.create({
    user: req.user._id,
    title,
    description,
    category,
    priority,
    status,
    dueDate: dueDate || null,
  })

  res.status(201).json(goal)
}

const updateGoal = async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    res.status(400)
    throw new Error(errors.array().map((e) => e.msg).join(', '))
  }

  const { id } = req.params

  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400)
    throw new Error('Invalid goal id')
  }

  const goal = await Goal.findOne({ _id: id, user: req.user._id })

  if (!goal) {
    res.status(404)
    throw new Error('Goal not found')
  }

  const fields = ['title', 'description', 'category', 'priority', 'status', 'dueDate', 'subtasks', 'notes']
  fields.forEach((field) => {
    if (req.body[field] !== undefined) goal[field] = req.body[field]
  })

  // Track exact completion time
  if (req.body.status === 'completed' && !goal.completedAt) {
    goal.completedAt = new Date()
  } else if (req.body.status === 'active') {
    goal.completedAt = null
  }

  const updatedGoal = await goal.save()
  res.json(updatedGoal)
}

const deleteGoal = async (req, res) => {
  const { id } = req.params

  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400)
    throw new Error('Invalid goal id')
  }

  const goal = await Goal.findOne({ _id: id, user: req.user._id })

  if (!goal) {
    res.status(404)
    throw new Error('Goal not found')
  }

  await goal.deleteOne()
  res.json({ message: 'Goal removed', id })
}

const getGoalStats = async (req, res) => {
  const userId = req.user._id

  const total     = await Goal.countDocuments({ user: userId })
  const active    = await Goal.countDocuments({ user: userId, status: 'active' })
  const completed = await Goal.countDocuments({ user: userId, status: 'completed' })

  const now      = new Date()
  const todayUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))

  const overdue = await Goal.countDocuments({
    user: userId,
    status: 'active',
    dueDate: { $ne: null, $lt: todayUTC },
  })

  res.json({ total, active, completed, overdue })
}

const getGoalAnalytics = async (req, res) => {
  const userId = req.user._id
  const days   = Math.min(Number(req.query.days) || 30, 90)
  const since  = new Date()
  since.setDate(since.getDate() - days)
  since.setHours(0, 0, 0, 0)

  // Completions per day — use completedAt (accurate) with MST timezone grouping
  const completionsByDay = await Goal.aggregate([
    {
      $match: {
        user: userId,
        status: 'completed',
        completedAt: { $gte: since },
      },
    },
    {
      $group: {
        _id:   { $dateToString: { format: '%Y-%m-%d', date: '$completedAt', timezone: 'America/Denver' } },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ])

  // Goals by category with completion breakdown
  const byCategory = await Goal.aggregate([
    { $match: { user: userId } },
    {
      $group: {
        _id:       '$category',
        total:     { $sum: 1 },
        completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
      },
    },
    { $sort: { total: -1 } },
    { $limit: 8 },
  ])

  res.json({ completionsByDay, byCategory })
}

export { getGoals, getGoalById, createGoal, updateGoal, deleteGoal, getGoalStats, getGoalAnalytics }
