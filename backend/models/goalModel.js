import mongoose from 'mongoose'

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
    dueDate: { type: Date, default: null },
  },
  { timestamps: true }
)

export default mongoose.model('Goal', goalSchema)
