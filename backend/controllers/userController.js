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
    avatar: user.avatar,
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
    avatar: user.avatar,
    token: generateToken(user._id),
  })
}

const getMe = async (req, res) => {
  res.json(req.user)
}

const updateMe = async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    res.status(400)
    throw new Error(errors.array().map((e) => e.msg).join(', '))
  }

  const user = await User.findById(req.user._id)
  if (!user) {
    res.status(404)
    throw new Error('User not found')
  }

  const { name, email, avatar, currentPassword, newPassword } = req.body

  if (name !== undefined) user.name = name

  if (email !== undefined && email.toLowerCase() !== user.email) {
    const taken = await User.findOne({ email: email.toLowerCase() })
    if (taken) {
      res.status(400)
      throw new Error('That email is already in use')
    }
    user.email = email
  }

  if (avatar !== undefined) {
    if (avatar !== '' && !avatar.startsWith('data:image/')) {
      res.status(400)
      throw new Error('Avatar must be an image')
    }
    user.avatar = avatar
  }

  if (newPassword) {
    if (!currentPassword || !(await user.matchPassword(currentPassword))) {
      res.status(401)
      throw new Error('Current password is incorrect')
    }
    user.password = newPassword
  }

  await user.save()

  res.json({
    _id: user._id,
    name: user.name,
    email: user.email,
    avatar: user.avatar,
  })
}

export { registerUser, authUser, getMe, updateMe }