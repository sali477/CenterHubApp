import asyncHandler from 'express-async-handler';
import LiveSession from '../models/LiveSession.js';
import Teacher from '../models/Teacher.js';
import Course from '../models/Course.js';
import Notification from '../models/Notification.js';

// @desc    Schedule live session
// @route   POST /api/live-sessions
export const createLiveSession = asyncHandler(async (req, res) => {
  const teacher = await Teacher.findOne({ user: req.user._id });

  if (!teacher) {
    res.status(403);
    throw new Error('Teacher profile required');
  }

  const session = await LiveSession.create({
    ...req.body,
    teacher: teacher._id,
  });

  await Course.findByIdAndUpdate(req.body.course, {
    $push: { liveSessions: session._id },
  });

  const course = await Course.findById(req.body.course);
  if (course?.enrolledStudents?.length) {
    const notifications = course.enrolledStudents.map((studentId) => ({
      user: studentId,
      title: 'New Live Session Scheduled',
      message: `${session.title} on ${new Date(session.scheduledAt).toLocaleString()}`,
      type: 'live_session',
      link: `/live/${session.roomId}`,
    }));
    await Notification.insertMany(notifications);
  }

  res.status(201).json({ success: true, data: session });
});

// @desc    Get live sessions
// @route   GET /api/live-sessions
export const getLiveSessions = asyncHandler(async (req, res) => {
  const filter = {};

  if (req.query.course) filter.course = req.query.course;
  if (req.query.status) filter.status = req.query.status;

  const sessions = await LiveSession.find(filter)
    .populate({
      path: 'teacher',
      populate: { path: 'user', select: 'name avatar' },
    })
    .populate('course', 'title thumbnail')
    .sort('scheduledAt');

  res.json({ success: true, data: sessions });
});

// @desc    Get single live session
// @route   GET /api/live-sessions/:id
export const getLiveSession = asyncHandler(async (req, res) => {
  const session = await LiveSession.findById(req.params.id)
    .populate({
      path: 'teacher',
      populate: { path: 'user', select: 'name avatar' },
    })
    .populate('course', 'title');

  if (!session) {
    res.status(404);
    throw new Error('Live session not found');
  }

  res.json({ success: true, data: session });
});

// @desc    Update session status
// @route   PUT /api/live-sessions/:id/status
export const updateSessionStatus = asyncHandler(async (req, res) => {
  const session = await LiveSession.findById(req.params.id).populate('teacher');

  if (!session) {
    res.status(404);
    throw new Error('Live session not found');
  }

  const teacher = await Teacher.findOne({ user: req.user._id });
  const isTeacher =
    teacher && session.teacher._id.toString() === teacher._id.toString();

  if (!isTeacher && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized');
  }

  session.status = req.body.status;
  await session.save();

  res.json({ success: true, data: session });
});

// @desc    Join live session
// @route   POST /api/live-sessions/:id/join
export const joinLiveSession = asyncHandler(async (req, res) => {
  const session = await LiveSession.findById(req.params.id);

  if (!session) {
    res.status(404);
    throw new Error('Live session not found');
  }

  const alreadyJoined = session.participants.some(
    (p) => p.user.toString() === req.user._id.toString()
  );

  if (!alreadyJoined) {
    session.participants.push({
      user: req.user._id,
      joinedAt: new Date(),
    });
    await session.save();
  }

  res.json({
    success: true,
    roomId: session.roomId,
    data: session,
  });
});
