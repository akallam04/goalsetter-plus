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

  const fields = ['title', 'description', 'category', 'priority', 'status', 'dueDate']
  fields.forEach((field) => {
    if (req.body[field] !== undefined) goal[field] = req.body[field]
  })

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

export { getGoals, getGoalById, createGoal, updateGoal, deleteGoal }
