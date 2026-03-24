import crypto from 'crypto'
import User from '../models/userModel.js'
import Goal from '../models/goalModel.js'

// POST /api/share/generate  (authenticated)
const generateShareToken = async (req, res) => {
  const token = crypto.randomBytes(24).toString('hex')
  await User.findByIdAndUpdate(req.user._id, { shareToken: token })
  res.json({ token })
}

// DELETE /api/share/revoke  (authenticated)
const revokeShareToken = async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, { shareToken: null })
  res.json({ message: 'Share link revoked' })
}

// GET /api/share/:token  (PUBLIC — no auth middleware)
const getSharedGoals = async (req, res) => {
  const user = await User.findOne({ shareToken: req.params.token }).select('name')

  if (!user) {
    res.status(404)
    throw new Error('Share link not found or has been revoked')
  }

  const goals = await Goal.find({ user: user._id })
    .select('title description category priority status dueDate subtasks notes createdAt')
    .sort({ createdAt: -1 })

  res.json({ ownerName: user.name, goals })
}

export { generateShareToken, revokeShareToken, getSharedGoals }
