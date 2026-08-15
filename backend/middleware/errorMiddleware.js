const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`)
  res.status(404)
  next(error)
}

const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode

  // Unexpected failures often carry SDK or driver internals. Log them
  // server-side and send the client something safe to display.
  if (statusCode >= 500) {
    console.error(`[${req.method} ${req.originalUrl}]`, err)
  }

  const safeMessage = statusCode >= 500
    ? 'Something went wrong on our end. Please try again.'
    : err.message

  res.status(statusCode).json({
    message: safeMessage,
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
  })
}

export { notFound, errorHandler }