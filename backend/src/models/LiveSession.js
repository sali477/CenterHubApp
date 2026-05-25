import mongoose from 'mongoose';

const liveSessionSchema = new mongoose.Schema(
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
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Teacher',
      required: true,
    },
    scheduledAt: {
      type: Date,
      required: true,
    },
    duration: {
      type: Number,
      default: 60,
    },
    status: {
      type: String,
      enum: ['scheduled', 'live', 'ended', 'cancelled'],
      default: 'scheduled',
    },
    roomId: {
      type: String,
      unique: true,
    },
    participants: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        joinedAt: Date,
        leftAt: Date,
      },
    ],
    recordingUrl: String,
    maxParticipants: {
      type: Number,
      default: 100,
    },
  },
  { timestamps: true }
);

liveSessionSchema.pre('save', function (next) {
  if (!this.roomId) {
    this.roomId = `room_${this._id}_${Date.now()}`;
  }
  next();
});

const LiveSession = mongoose.model('LiveSession', liveSessionSchema);
export default LiveSession;
