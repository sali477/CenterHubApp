import asyncHandler from 'express-async-handler';
import Notification from '../models/Notification.js';

// @desc    Get user notifications
// @route   GET /api/notifications
export const getNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ user: req.user._id })
    .sort('-createdAt')
    .limit(50);

  const unreadCount = await Notification.countDocuments({
    user: req.user._id,
    isRead: false,
  });

  res.json({ success: true, unreadCount, data: notifications });
});

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
export const markAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    { isRead: true },
    { new: true }
  );

  if (!notification) {
    res.status(404);
    throw new Error('Notification not found');
  }

  res.json({ success: true, data: notification });
});

// @desc    Mark all as read
// @route   PUT /api/notifications/read-all
export const markAllAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany(
    { user: req.user._id, isRead: false },
    { isRead: true }
  );

  res.json({ success: true, message: 'All notifications marked as read' });
});

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
export const deleteNotification = asyncHandler(async (req, res) => {
  await Notification.findOneAndDelete({
    _id: req.params.id,
    user: req.user._id,
  });

  res.json({ success: true, message: 'Notification deleted' });
});
