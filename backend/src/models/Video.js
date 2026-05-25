import mongoose from 'mongoose';

const videoSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: String,
    url: {
      type: String,
      required: true,
    },
    cloudinaryId: String,
    duration: {
      type: Number,
      default: 0,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    order: {
      type: Number,
      default: 0,
    },
    isPreview: {
      type: Boolean,
      default: false,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

const Video = mongoose.model('Video', videoSchema);
export default Video;
