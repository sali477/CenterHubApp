import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: true,
      maxlength: 5000,
    },
    attachments: [
      {
        url: String,
        type: { type: String, enum: ['image', 'file', 'video'] },
      },
    ],
    isRead: {
      type: Boolean,
      default: false,
    },
    conversationId: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

messageSchema.index({ conversationId: 1, createdAt: -1 });
messageSchema.index({ sender: 1, receiver: 1 });

const Message = mongoose.model('Message', messageSchema);
export default Message;
