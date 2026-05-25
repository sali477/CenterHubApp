import mongoose from 'mongoose';

const examQuestionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  type: {
    type: String,
    enum: ['multiple_choice', 'true_false', 'short_answer'],
    default: 'multiple_choice',
  },
  options: [String],
  correctAnswer: mongoose.Schema.Types.Mixed,
  points: { type: Number, default: 1 },
});

const examSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: String,
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    questions: [examQuestionSchema],
    duration: {
      type: Number,
      default: 60,
    },
    totalPoints: {
      type: Number,
      default: 100,
    },
    passingScore: {
      type: Number,
      default: 60,
    },
    scheduledAt: Date,
    isAIGenerated: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    attempts: [
      {
        student: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        score: Number,
        answers: [mongoose.Schema.Types.Mixed],
        startedAt: Date,
        completedAt: Date,
      },
    ],
  },
  { timestamps: true }
);

const Exam = mongoose.model('Exam', examSchema);
export default Exam;
