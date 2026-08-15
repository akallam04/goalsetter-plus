// Server and SDK messages are written for developers. Users get something
// they can act on, and internal details never reach the screen.
const LEAKY = /apiKey|authToken|X-Api-Key|Authorization|header|stack|ECONN|ENOTFOUND|mongo|prisma|at\s\w+\./i

export default function friendlyError(err, fallback = 'That did not work. Try again.') {
  if (!err?.response) return 'Cannot reach the server. Check your connection and try again.'

  const status = err.response.status
  if (status === 429) return 'Too many requests. Give it a minute and try again.'
  if (status >= 500) return 'The server had a problem. Try again in a moment.'

  // A short, non-technical server message is usually the most useful thing
  // we can say, for example "Invalid email or password"
  const msg = err.response.data?.message
  if (typeof msg === 'string' && msg.length < 120 && !LEAKY.test(msg)) return msg

  if (status === 401) return 'Your session expired. Sign in again.'
  return fallback
}
