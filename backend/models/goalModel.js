import mongoose from 'mongoose'

const subtaskSchema = new mongoose.Schema({
  text:      { type: String, required: true, trim: true, maxlength: 200 },
  completed: { type: Boolean, default: false },
})

const goalSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, default: '', trim: true, maxlength: 500 },
    category: { type: String, default: 'General', trim: true, maxlength: 50 },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    status: {
      type: String,
      enum: ['active', 'completed'],
      default: 'active',
    },
    dueDate:     { type: Date, default: null },
    completedAt: { type: Date, default: null },
    subtasks: { type: [subtaskSchema], default: [] },
    notes:    { type: String, default: '', trim: true, maxlength: 5000 },
  },
  { timestamps: true }
)

export default mongoose.model('Goal', goalSchema)
