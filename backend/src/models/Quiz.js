import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctAnswer: { type: Number, required: true },
  explanation: String,
  points: { type: Number, default: 1 },
});

const quizSchema = new mongoose.Schema(
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
    questions: [questionSchema],
    timeLimit: {
      type: Number,
      default: 30,
    },
    passingScore: {
      type: Number,
      default: 60,
    },
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
        answers: [Number],
        completedAt: Date,
      },
    ],
  },
  { timestamps: true }
);

const Quiz = mongoose.model('Quiz', quizSchema);
export default Quiz;
