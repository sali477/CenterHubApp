import asyncHandler from 'express-async-handler';
import Course from '../models/Course.js';
import Teacher from '../models/Teacher.js';
import Center from '../models/Center.js';
import APIFeatures from '../utils/apiFeatures.js';

// @desc    Get all courses
// @route   GET /api/courses
export const getCourses = asyncHandler(async (req, res) => {
  let query = Course.find({ isPublished: true });

  const features = new APIFeatures(query, req.query)
    .search(['title', 'description', 'subject', 'tags'])
    .filter()
    .sort()
    .limitFields()
    .paginate();

  if (req.query.subject) {
    query = query.find({ subject: req.query.subject });
  }

  if (req.query.center) {
    query = query.find({ center: req.query.center });
  }

  if (req.query.teacher) {
    query = query.find({ teacher: req.query.teacher });
  }

  const courses = await features.query
    .populate({
      path: 'teacher',
      populate: { path: 'user', select: 'name avatar' },
    })
    .populate('center', 'name logo');

  const total = await Course.countDocuments({ isPublished: true });

  res.json({
    success: true,
    count: courses.length,
    total,
    data: courses,
  });
});

// @desc    Get single course with content
// @route   GET /api/courses/:id
export const getCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id)
    .populate({
      path: 'teacher',
      populate: { path: 'user', select: 'name avatar email' },
    })
    .populate('center', 'name logo address')
    .populate('videos')
    .populate('pdfs')
    .populate('quizzes', '-attempts')
    .populate('exams', '-attempts')
    .populate('liveSessions');

  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }

  res.json({ success: true, data: course });
});

// @desc    Create course
// @route   POST /api/courses
export const createCourse = asyncHandler(async (req, res) => {
  let teacher;
  let centerId = req.body.center;

  if (req.user.role === 'center_owner') {
    const center = await Center.findOne({ owner: req.user._id, isActive: true });
    if (!center) {
      res.status(403);
      throw new Error('You must have a center to create courses');
    }
    if (!req.body.teacher) {
      res.status(400);
      throw new Error('Teacher ID is required');
    }
    teacher = await Teacher.findById(req.body.teacher);
    if (!teacher || teacher.center?.toString() !== center._id.toString()) {
      res.status(403);
      throw new Error('Teacher does not belong to your center');
    }
    centerId = center._id;
  } else {
    teacher = await Teacher.findOne({ user: req.user._id });
    if (!teacher) {
      res.status(403);
      throw new Error('Teacher profile required to create courses');
    }
    centerId = teacher.center || req.body.center;
  }

  const course = await Course.create({
    ...req.body,
    teacher: teacher._id,
    center: centerId,
  });

  teacher.courses.push(course._id);
  await teacher.save();

  if (centerId) {
    await Center.findByIdAndUpdate(centerId, {
      $push: { courses: course._id },
    });
  }

  res.status(201).json({ success: true, data: course });
});

// @desc    Update course
// @route   PUT /api/courses/:id
export const updateCourse = asyncHandler(async (req, res) => {
  let course = await Course.findById(req.params.id).populate('teacher');

  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }

  const teacher = await Teacher.findOne({ user: req.user._id });
  const isOwner = teacher && course.teacher._id.toString() === teacher._id.toString();
  const isAdmin = req.user.role === 'admin';

  if (!isOwner && !isAdmin) {
    res.status(403);
    throw new Error('Not authorized');
  }

  course = await Course.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.json({ success: true, data: course });
});

// @desc    Delete course
// @route   DELETE /api/courses/:id
export const deleteCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id).populate('teacher');

  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }

  const teacher = await Teacher.findOne({ user: req.user._id });
  const isOwner = teacher && course.teacher._id.toString() === teacher._id.toString();

  if (!isOwner && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized');
  }

  course.isPublished = false;
  await course.save();

  res.json({ success: true, message: 'Course unpublished' });
});

// @desc    Add comment to course (stored as review with comment only)
// @route   POST /api/courses/:id/comments
export const addCourseComment = asyncHandler(async (req, res) => {
  const Review = (await import('../models/Review.js')).default;

  const review = await Review.create({
    user: req.user._id,
    course: req.params.id,
    rating: req.body.rating || 5,
    comment: req.body.comment,
  });

  const populated = await review.populate('user', 'name avatar');

  res.status(201).json({ success: true, data: populated });
});
