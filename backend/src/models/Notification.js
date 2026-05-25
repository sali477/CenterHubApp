import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: [
        'enrollment',
        'message',
        'live_session',
        'review',
        'verification',
        'system',
        'course_update',
        'payment',
      ],
      default: 'system',
    },
    link: String,
    isRead: {
      type: Boolean,
      default: false,
    },
    metadata: mongoose.Schema.Types.Mixed,
  },
  { timestamps: true }
);

notificationSchema.index({ user: 1, createdAt: -1 });

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;
