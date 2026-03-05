import jwt from 'jsonwebtoken'
import User from '../models/userModel.js'

const protect = async (req, res, next) => {
  let token

  if (req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1]
  }

  if (!token) {
    res.status(401)
    throw new Error('Not authorized, no token')
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = await User.findById(decoded.id).select('-password')
    if (!req.user) {
      res.status(401)
      throw new Error('Not authorized')
    }
    next()
  } catch (err) {
    res.status(401)
    throw new Error('Not authorized, token failed')
  }
}

export { protect }