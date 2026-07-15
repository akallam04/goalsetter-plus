// Seeds (or resets) the public demo account so recruiters can explore
// the app without signing up. Safe to re-run: it only touches the demo
// user and replaces that user's goals.
//
//   cd backend && npm run seed:demo
//
// The demo credentials are intentionally public: they are baked into the
// "Try the demo" button on the sign-in page.
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import User from '../models/userModel.js'
import Goal from '../models/goalModel.js'

dotenv.config()

const DEMO = {
  name: 'Demo Operator',
  email: 'demo@goalsetter.app',
  password: 'demo-goals-2026',
  shareToken: 'demoboard',
}

const day = (offset, hour = 12) => {
  const d = new Date()
  d.setDate(d.getDate() + offset)
  d.setHours(hour, 0, 0, 0)
  return d
}

const ACTIVE_GOALS = [
  {
    title: 'Ship portfolio v3 with case studies',
    description: 'Three deep-dive writeups with metrics, before/after visuals, and architecture notes.',
    category: 'Career', priority: 'high', dueDate: day(3), createdAt: day(-9),
    subtasks: [
      { text: 'Draft Goalsetter+ case study', completed: true },
      { text: 'Record 60s demo video', completed: true },
      { text: 'Lighthouse pass over 95', completed: false },
    ],
    notes: 'Recruiter feedback: lead with outcomes, not tech lists.',
  },
  {
    title: 'Apply to 6 backend internships',
    description: 'Prioritize teams working on distributed systems.',
    category: 'Career', priority: 'high', dueDate: day(-2), createdAt: day(-12),
    subtasks: [
      { text: 'Refresh resume', completed: true },
      { text: 'Shortlist companies', completed: true },
      { text: 'Send applications', completed: false },
    ],
  },
  {
    title: 'Run a sub-28 minute 5k',
    description: 'Interval training twice a week, long run on Saturdays.',
    category: 'Fitness', priority: 'medium', dueDate: day(6), createdAt: day(-21),
    subtasks: [
      { text: 'Week 1 intervals', completed: true },
      { text: 'Week 2 intervals', completed: false },
      { text: 'Time trial', completed: false },
    ],
  },
  {
    title: 'Finish system design course',
    description: 'Two modules left: caching strategies and message queues.',
    category: 'Learning', priority: 'medium', dueDate: day(14), createdAt: day(-30),
  },
  {
    title: 'Build a 3-month emergency fund',
    description: 'Automatic transfer every payday.',
    category: 'Finance', priority: 'low', dueDate: null, createdAt: day(-40),
  },
  {
    title: 'Read Deep Work and take notes',
    category: 'Personal', priority: 'low', dueDate: day(20), createdAt: day(-6),
  },
  {
    title: 'Sketch daily for 30 days',
    description: 'One page a day, any subject, no erasing.',
    category: 'Creative', priority: 'medium', dueDate: day(11), createdAt: day(-19),
    subtasks: [
      { text: 'Days 1 to 10', completed: true },
      { text: 'Days 11 to 20', completed: false },
    ],
  },
]

// completedAt offsets build a believable heatmap: a current streak plus
// scattered history over the last six weeks.
const COMPLETED_GOALS = [
  { title: 'Learn CSS color-mix and ship theming', category: 'Learning', priority: 'medium', done: 0 },
  { title: 'Publish blog post on Redux Toolkit patterns', category: 'Career', priority: 'medium', done: 0 },
  { title: 'Set up MongoDB Atlas backups', category: 'Learning', priority: 'high', done: -1 },
  { title: '10k steps for 14 straight days', category: 'Fitness', priority: 'medium', done: -2 },
  { title: 'Refactor JWT auth flow', category: 'Career', priority: 'high', done: -3 },
  { title: 'Meal prep every Sunday for a month', category: 'Fitness', priority: 'low', done: -5 },
  { title: 'Negotiate phone plan down 30 percent', category: 'Finance', priority: 'low', done: -9 },
  { title: 'Morning routine: 6am wakeups x21', category: 'Personal', priority: 'medium', done: -14 },
  { title: 'Watercolor basics course', category: 'Creative', priority: 'low', done: -21 },
  { title: 'Automate weekly budget report', category: 'Finance', priority: 'medium', done: -30 },
  { title: 'Declutter and rebuild workspace', category: 'Personal', priority: 'low', done: -42 },
]

async function run() {
  if (!process.env.MONGO_URI) {
    console.error('MONGO_URI missing. Run from backend/ with .env present.')
    process.exit(1)
  }
  await mongoose.connect(process.env.MONGO_URI)
  console.log('Connected.')

  let user = await User.findOne({ email: DEMO.email })
  if (user) {
    user.name = DEMO.name
    user.password = DEMO.password
    user.shareToken = DEMO.shareToken
    await user.save()
    console.log('Demo user refreshed.')
  } else {
    user = await User.create({ name: DEMO.name, email: DEMO.email, password: DEMO.password })
    user.shareToken = DEMO.shareToken
    await user.save()
    console.log('Demo user created.')
  }

  const removed = await Goal.deleteMany({ user: user._id })
  console.log(`Cleared ${removed.deletedCount} old demo goals.`)

  const docs = [
    ...ACTIVE_GOALS.map((g) => ({ ...g, user: user._id, status: 'active' })),
    ...COMPLETED_GOALS.map(({ done, ...g }) => ({
      ...g,
      user: user._id,
      status: 'completed',
      completedAt: day(done, 17),
      createdAt: day(done - 10),
      dueDate: day(done + 2),
    })),
  ]
  await Goal.create(docs)
  console.log(`Seeded ${docs.length} goals (${ACTIVE_GOALS.length} active, ${COMPLETED_GOALS.length} completed).`)
  console.log(`Demo login: ${DEMO.email} / ${DEMO.password}`)
  console.log(`Public board: /share/${DEMO.shareToken}`)

  await mongoose.disconnect()
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
