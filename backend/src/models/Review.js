import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: true,
      maxlength: 1000,
    },
    center: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Center',
    },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Teacher',
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

reviewSchema.index({ center: 1, user: 1 }, { unique: true, sparse: true });
reviewSchema.index({ teacher: 1, user: 1 }, { unique: true, sparse: true });
reviewSchema.index({ course: 1, user: 1 }, { unique: true, sparse: true });

const Review = mongoose.model('Review', reviewSchema);
export default Review;
