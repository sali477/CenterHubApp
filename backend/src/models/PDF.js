import mongoose from 'mongoose';

const pdfSchema = new mongoose.Schema(
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
    pages: {
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
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

const PDF = mongoose.model('PDF', pdfSchema);
export default PDF;
