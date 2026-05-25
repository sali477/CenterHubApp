import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema(
  {
    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    reportedUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    reportedCenter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Center',
    },
    reason: {
      type: String,
      required: true,
    },
    description: String,
    status: {
      type: String,
      enum: ['pending', 'reviewed', 'resolved', 'dismissed'],
      default: 'pending',
    },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    resolution: String,
  },
  { timestamps: true }
);

const Report = mongoose.model('Report', reportSchema);
export default Report;
