import asyncHandler from 'express-async-handler';
import Teacher from '../models/Teacher.js';
import Center from '../models/Center.js';
import Course from '../models/Course.js';
import User from '../models/User.js';

// @desc    Get all teachers
// @route   GET /api/teachers
export const getTeachers = asyncHandler(async (req, res) => {
  const query = { isActive: true };

  if (req.query.subject) {
    query.subjects = { $in: [req.query.subject] };
  }

  if (req.query.center) {
    query.center = req.query.center;
  }

  const teachers = await Teacher.find(query)
    .populate('user', 'name email avatar')
    .populate('center', 'name logo')
    .populate('courses', 'title subject thumbnail rating')
    .sort(req.query.sort || '-rating');

  res.json({ success: true, count: teachers.length, data: teachers });
});

// @desc    Get single teacher
// @route   GET /api/teachers/:id
export const getTeacher = asyncHandler(async (req, res) => {
  const teacher = await Teacher.findById(req.params.id)
    .populate('user', 'name email avatar phone')
    .populate('center', 'name logo address')
    .populate({
      path: 'courses',
      match: { isPublished: true },
    });

  if (!teacher || !teacher.isActive) {
    res.status(404);
    throw new Error('Teacher not found');
  }

  res.json({ success: true, data: teacher });
});

// @desc    Create teacher profile
// @route   POST /api/teachers
export const createTeacherProfile = asyncHandler(async (req, res) => {
  const existing = await Teacher.findOne({ user: req.user._id });
  if (existing) {
    res.status(400);
    throw new Error('Teacher profile already exists');
  }

  const teacher = await Teacher.create({
    user: req.user._id,
    ...req.body,
  });

  if (req.user.role === 'student') {
    await User.findByIdAndUpdate(req.user._id, { role: 'teacher' });
  }

  const populated = await Teacher.findById(teacher._id).populate('user', 'name email avatar');

  res.status(201).json({ success: true, data: populated });
});

// @desc    Join center via invitation code
// @route   POST /api/teachers/join-center
export const joinCenter = asyncHandler(async (req, res) => {
  const { invitationCode } = req.body;

  const center = await Center.findOne({ invitationCode, isActive: true });
  if (!center) {
    res.status(404);
    throw new Error('Invalid invitation code');
  }

  let teacher = await Teacher.findOne({ user: req.user._id });

  if (!teacher) {
    teacher = await Teacher.create({
      user: req.user._id,
      center: center._id,
      invitationUsed: invitationCode,
    });
  } else {
    teacher.center = center._id;
    teacher.invitationUsed = invitationCode;
    await teacher.save();
  }

  center.teachers.push(teacher._id);
  await center.save();

  const populated = await Teacher.findById(teacher._id)
    .populate('user', 'name email avatar')
    .populate('center', 'name logo');

  res.json({ success: true, data: populated });
});

// @desc    Create independent academy
// @route   POST /api/teachers/independent-academy
export const createIndependentAcademy = asyncHandler(async (req, res) => {
  const teacher = await Teacher.findOne({ user: req.user._id });

  if (!teacher) {
    res.status(404);
    throw new Error('Teacher profile not found');
  }

  teacher.independentAcademy = {
    ...req.body,
    isActive: true,
  };

  await teacher.save();

  res.json({ success: true, data: teacher });
});

// @desc    Update teacher profile
// @route   PUT /api/teachers/:id
export const updateTeacher = asyncHandler(async (req, res) => {
  let teacher = await Teacher.findById(req.params.id);

  if (!teacher) {
    res.status(404);
    throw new Error('Teacher not found');
  }

  if (teacher.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized');
  }

  teacher = await Teacher.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  }).populate('user', 'name email avatar');

  res.json({ success: true, data: teacher });
});

// @desc    Get teacher's students
// @route   GET /api/teachers/:id/students
export const getTeacherStudents = asyncHandler(async (req, res) => {
  const teacher = await Teacher.findById(req.params.id).populate(
    'students',
    'name email avatar'
  );

  if (!teacher) {
    res.status(404);
    throw new Error('Teacher not found');
  }

  res.json({ success: true, data: teacher.students });
});
