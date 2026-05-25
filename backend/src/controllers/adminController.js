import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import Center from '../models/Center.js';
import Teacher from '../models/Teacher.js';
import Course from '../models/Course.js';
import Report from '../models/Report.js';
import Enrollment from '../models/Enrollment.js';

// @desc    Get platform analytics
// @route   GET /api/admin/analytics
export const getAnalytics = asyncHandler(async (req, res) => {
  const [
    totalUsers,
    totalCenters,
    totalTeachers,
    totalCourses,
    totalEnrollments,
    pendingReports,
    verifiedCenters,
    verifiedTeachers,
  ] = await Promise.all([
    User.countDocuments({ isActive: true }),
    Center.countDocuments({ isActive: true }),
    Teacher.countDocuments({ isActive: true }),
    Course.countDocuments({ isPublished: true }),
    Enrollment.countDocuments({ status: 'active' }),
    Report.countDocuments({ status: 'pending' }),
    Center.countDocuments({ isVerified: true }),
    Teacher.countDocuments({ isVerified: true }),
  ]);

  const usersByRole = await User.aggregate([
    { $match: { isActive: true } },
    { $group: { _id: '$role', count: { $sum: 1 } } },
  ]);

  const recentEnrollments = await Enrollment.find()
    .populate('student', 'name email')
    .populate('course', 'title')
    .sort('-createdAt')
    .limit(10);

  res.json({
    success: true,
    analytics: {
      totalUsers,
      totalCenters,
      totalTeachers,
      totalCourses,
      totalEnrollments,
      pendingReports,
      verifiedCenters,
      verifiedTeachers,
      usersByRole,
      recentEnrollments,
    },
  });
});

// @desc    Verify center
// @route   PUT /api/admin/centers/:id/verify
export const verifyCenter = asyncHandler(async (req, res) => {
  const center = await Center.findByIdAndUpdate(
    req.params.id,
    { isVerified: true },
    { new: true }
  );

  if (!center) {
    res.status(404);
    throw new Error('Center not found');
  }

  res.json({ success: true, data: center });
});

// @desc    Verify teacher
// @route   PUT /api/admin/teachers/:id/verify
export const verifyTeacher = asyncHandler(async (req, res) => {
  const teacher = await Teacher.findByIdAndUpdate(
    req.params.id,
    { isVerified: true },
    { new: true }
  ).populate('user', 'name email');

  if (!teacher) {
    res.status(404);
    throw new Error('Teacher not found');
  }

  await User.findByIdAndUpdate(teacher.user._id, { isVerified: true });

  res.json({ success: true, data: teacher });
});

// @desc    Deactivate user account
// @route   PUT /api/admin/users/:id/deactivate
export const deactivateUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { isActive: false },
    { new: true }
  );

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  res.json({ success: true, message: 'User deactivated', data: user });
});

// @desc    Get all reports
// @route   GET /api/admin/reports
export const getReports = asyncHandler(async (req, res) => {
  const filter = req.query.status ? { status: req.query.status } : {};

  const reports = await Report.find(filter)
    .populate('reporter', 'name email')
    .populate('reportedUser', 'name email role')
    .populate('reportedCenter', 'name')
    .sort('-createdAt');

  res.json({ success: true, data: reports });
});

// @desc    Resolve report
// @route   PUT /api/admin/reports/:id
export const resolveReport = asyncHandler(async (req, res) => {
  const report = await Report.findByIdAndUpdate(
    req.params.id,
    {
      status: req.body.status || 'resolved',
      resolution: req.body.resolution,
      resolvedBy: req.user._id,
    },
    { new: true }
  );

  if (!report) {
    res.status(404);
    throw new Error('Report not found');
  }

  res.json({ success: true, data: report });
});

// @desc    Get all users
// @route   GET /api/admin/users
export const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find()
    .select('-password')
    .sort('-createdAt');

  res.json({ success: true, count: users.length, data: users });
});

// @desc    Create report
// @route   POST /api/admin/reports
export const createReport = asyncHandler(async (req, res) => {
  const report = await Report.create({
    reporter: req.user._id,
    ...req.body,
  });

  res.status(201).json({ success: true, data: report });
});
