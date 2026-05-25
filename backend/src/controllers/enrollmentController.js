import asyncHandler from 'express-async-handler';
import Enrollment from '../models/Enrollment.js';
import Course from '../models/Course.js';
import Center from '../models/Center.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';

// @desc    Enroll in course
// @route   POST /api/enrollments
export const enrollInCourse = asyncHandler(async (req, res) => {
  const { courseId } = req.body;

  const course = await Course.findById(courseId);
  if (!course || !course.isPublished) {
    res.status(404);
    throw new Error('Course not found');
  }

  const existing = await Enrollment.findOne({
    student: req.user._id,
    course: courseId,
  });

  if (existing) {
    res.status(400);
    throw new Error('Already enrolled in this course');
  }

  if (!course.isFree && course.price > 0) {
    res.status(402);
    throw new Error('Payment required. Use /api/payments/create-checkout');
  }

  const enrollment = await Enrollment.create({
    student: req.user._id,
    course: courseId,
    center: course.center,
    payment: {
      amount: 0,
      status: 'paid',
      provider: 'free',
    },
    status: 'active',
  });

  course.enrolledStudents.push(req.user._id);
  course.popularity += 1;
  await course.save();

  await User.findByIdAndUpdate(req.user._id, {
    $push: { enrolledCourses: courseId },
  });

  if (course.center) {
    await Center.findByIdAndUpdate(course.center, {
      $addToSet: { students: req.user._id },
      $inc: { popularity: 1, revenue: course.price || 0 },
    });
  }

  await Notification.create({
    user: req.user._id,
    title: 'Enrollment Successful',
    message: `You have enrolled in ${course.title}`,
    type: 'enrollment',
    link: `/courses/${course._id}`,
  });

  res.status(201).json({ success: true, data: enrollment });
});

// @desc    Get user enrollments
// @route   GET /api/enrollments/my
export const getMyEnrollments = asyncHandler(async (req, res) => {
  const enrollments = await Enrollment.find({ student: req.user._id })
    .populate({
      path: 'course',
      populate: [
        { path: 'teacher', populate: { path: 'user', select: 'name avatar' } },
        { path: 'center', select: 'name logo' },
      ],
    })
    .sort('-enrolledAt');

  res.json({ success: true, data: enrollments });
});

// @desc    Update progress
// @route   PUT /api/enrollments/:id/progress
export const updateProgress = asyncHandler(async (req, res) => {
  const enrollment = await Enrollment.findById(req.params.id);

  if (!enrollment) {
    res.status(404);
    throw new Error('Enrollment not found');
  }

  if (enrollment.student.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized');
  }

  const { type, itemId } = req.body;
  const progressField = {
    video: 'completedVideos',
    pdf: 'completedPdfs',
    quiz: 'completedQuizzes',
    exam: 'completedExams',
  }[type];

  if (progressField && itemId) {
    if (!enrollment.progress[progressField].includes(itemId)) {
      enrollment.progress[progressField].push(itemId);
    }
  }

  const course = await Course.findById(enrollment.course);
  const totalItems =
    (course?.videos?.length || 0) +
    (course?.pdfs?.length || 0) +
    (course?.quizzes?.length || 0) +
    (course?.exams?.length || 0);

  const completedItems =
    enrollment.progress.completedVideos.length +
    enrollment.progress.completedPdfs.length +
    enrollment.progress.completedQuizzes.length +
    enrollment.progress.completedExams.length;

  enrollment.progress.percentage =
    totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
  enrollment.progress.lastAccessedAt = new Date();

  if (enrollment.progress.percentage >= 100) {
    enrollment.status = 'completed';
    enrollment.completedAt = new Date();
  }

  await enrollment.save();

  res.json({ success: true, data: enrollment });
});

// @desc    Get enrollment by course
// @route   GET /api/enrollments/course/:courseId
export const getEnrollmentByCourse = asyncHandler(async (req, res) => {
  const enrollment = await Enrollment.findOne({
    student: req.user._id,
    course: req.params.courseId,
  });

  res.json({ success: true, data: enrollment });
});
