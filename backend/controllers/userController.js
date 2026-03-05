import { validationResult } from 'express-validator'
import User from '../models/userModel.js'
import generateToken from '../utils/generateToken.js'

const registerUser = async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    res.status(400)
    throw new Error(errors.array().map((e) => e.msg).join(', '))
  }

  const { name, email, password } = req.body

  const exists = await User.findOne({ email })
  if (exists) {
    res.status(400)
    throw new Error('User already exists')
  }

  const user = await User.create({ name, email, password })

  res.status(201).json({
    _id: user._id,
    name: user.name,
    email: user.email,
    token: generateToken(user._id),
  })
}

const authUser = async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    res.status(400)
    throw new Error(errors.array().map((e) => e.msg).join(', '))
  }

  const { email, password } = req.body

  const user = await User.findOne({ email })
  if (!user || !(await user.matchPassword(password))) {
    res.status(401)
    throw new Error('Invalid email or password')
  }

  res.json({
    _id: user._id,
    name: user.name,
    email: user.email,
    token: generateToken(user._id),
  })
}

const getMe = async (req, res) => {
  res.json(req.user)
}

export { registerUser, authUser, getMe }