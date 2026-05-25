import mongoose from 'mongoose';

const enrollmentSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    center: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Center',
    },
    status: {
      type: String,
      enum: ['active', 'completed', 'cancelled', 'pending'],
      default: 'pending',
    },
    progress: {
      completedVideos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Video' }],
      completedPdfs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'PDF' }],
      completedQuizzes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Quiz' }],
      completedExams: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Exam' }],
      percentage: { type: Number, default: 0 },
      lastAccessedAt: Date,
    },
    payment: {
      amount: Number,
      status: {
        type: String,
        enum: ['pending', 'paid', 'refunded'],
        default: 'pending',
      },
      provider: {
        type: String,
        enum: ['stripe', 'cmi', 'free'],
        default: 'free',
      },
      transactionId: String,
      paidAt: Date,
    },
    enrolledAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: Date,
  },
  { timestamps: true }
);

enrollmentSchema.index({ student: 1, course: 1 }, { unique: true });

const Enrollment = mongoose.model('Enrollment', enrollmentSchema);
export default Enrollment;
