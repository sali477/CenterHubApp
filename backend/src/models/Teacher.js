import mongoose from 'mongoose';

const teacherSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    bio: {
      type: String,
      default: '',
    },
    photo: {
      type: String,
      default: '',
    },
    subjects: [String],
    experience: {
      years: { type: Number, default: 0 },
      description: String,
    },
    qualifications: [String],
    center: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Center',
    },
    independentAcademy: {
      name: String,
      description: String,
      logo: String,
      isActive: { type: Boolean, default: false },
    },
    courses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
      },
    ],
    students: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    numReviews: {
      type: Number,
      default: 0,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    invitationUsed: String,
  },
  { timestamps: true }
);

const Teacher = mongoose.model('Teacher', teacherSchema);
export default Teacher;
