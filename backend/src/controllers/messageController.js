import asyncHandler from 'express-async-handler';
import Message from '../models/Message.js';
import User from '../models/User.js';

const getConversationId = (userId1, userId2) => {
  const ids = [userId1.toString(), userId2.toString()].sort();
  return `${ids[0]}_${ids[1]}`;
};

// @desc    Send message
// @route   POST /api/messages
export const sendMessage = asyncHandler(async (req, res) => {
  const { receiverId, content, attachments } = req.body;

  const receiver = await User.findById(receiverId);
  if (!receiver) {
    res.status(404);
    throw new Error('Receiver not found');
  }

  const message = await Message.create({
    sender: req.user._id,
    receiver: receiverId,
    content,
    attachments,
    conversationId: getConversationId(req.user._id, receiverId),
  });

  const populated = await message.populate([
    { path: 'sender', select: 'name avatar' },
    { path: 'receiver', select: 'name avatar' },
  ]);

  res.status(201).json({ success: true, data: populated });
});

// @desc    Get conversations list
// @route   GET /api/messages/conversations
export const getConversations = asyncHandler(async (req, res) => {
  const messages = await Message.aggregate([
    {
      $match: {
        $or: [
          { sender: req.user._id },
          { receiver: req.user._id },
        ],
      },
    },
    { $sort: { createdAt: -1 } },
    {
      $group: {
        _id: '$conversationId',
        lastMessage: { $first: '$$ROOT' },
        unreadCount: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $eq: ['$receiver', req.user._id] },
                  { $eq: ['$isRead', false] },
                ],
              },
              1,
              0,
            ],
          },
        },
      },
    },
    { $sort: { 'lastMessage.createdAt': -1 } },
  ]);

  const populated = await Message.populate(messages, [
    { path: 'lastMessage.sender', select: 'name avatar' },
    { path: 'lastMessage.receiver', select: 'name avatar' },
  ]);

  res.json({ success: true, data: populated });
});

// @desc    Get messages in conversation
// @route   GET /api/messages/:userId
export const getMessages = asyncHandler(async (req, res) => {
  const conversationId = getConversationId(req.user._id, req.params.userId);

  const messages = await Message.find({ conversationId })
    .populate('sender', 'name avatar')
    .populate('receiver', 'name avatar')
    .sort('createdAt');

  await Message.updateMany(
    { conversationId, receiver: req.user._id, isRead: false },
    { isRead: true }
  );

  res.json({ success: true, data: messages });
});
