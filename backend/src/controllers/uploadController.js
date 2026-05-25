import asyncHandler from 'express-async-handler';
import { uploadToCloudinary, deleteFromCloudinary } from '../middleware/upload.js';
import Video from '../models/Video.js';
import PDF from '../models/PDF.js';
import Quiz from '../models/Quiz.js';
import Exam from '../models/Exam.js';
import Course from '../models/Course.js';

// @desc    Upload image
// @route   POST /api/upload/image
export const uploadImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error('No file uploaded');
  }

  const result = await uploadToCloudinary(req.file.buffer, {
    folder: 'centrehub/images',
    resource_type: 'image',
  });

  res.json({
    success: true,
    url: result.secure_url,
    publicId: result.public_id,
  });
});

// @desc    Upload video
// @route   POST /api/upload/video
export const uploadVideo = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error('No file uploaded');
  }

  const result = await uploadToCloudinary(req.file.buffer, {
    folder: 'centrehub/videos',
    resource_type: 'video',
  });

  if (req.body.courseId && req.body.title) {
    const video = await Video.create({
      title: req.body.title,
      description: req.body.description,
      url: result.secure_url,
      cloudinaryId: result.public_id,
      duration: result.duration || 0,
      course: req.body.courseId,
      order: req.body.order || 0,
      uploadedBy: req.user._id,
    });

    await Course.findByIdAndUpdate(req.body.courseId, {
      $push: { videos: video._id },
    });

    res.status(201).json({ success: true, data: video });
  } else {
    res.json({
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
      duration: result.duration,
    });
  }
});

// @desc    Upload PDF
// @route   POST /api/upload/pdf
export const uploadPDF = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error('No file uploaded');
  }

  const result = await uploadToCloudinary(req.file.buffer, {
    folder: 'centrehub/pdfs',
    resource_type: 'raw',
  });

  if (req.body.courseId && req.body.title) {
    const pdf = await PDF.create({
      title: req.body.title,
      description: req.body.description,
      url: result.secure_url,
      cloudinaryId: result.public_id,
      course: req.body.courseId,
      order: req.body.order || 0,
      uploadedBy: req.user._id,
    });

    await Course.findByIdAndUpdate(req.body.courseId, {
      $push: { pdfs: pdf._id },
    });

    res.status(201).json({ success: true, data: pdf });
  } else {
    res.json({
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
    });
  }
});

// @desc    Create quiz manually
// @route   POST /api/upload/quiz
export const createQuiz = asyncHandler(async (req, res) => {
  const quiz = await Quiz.create({
    ...req.body,
    createdBy: req.user._id,
  });

  await Course.findByIdAndUpdate(req.body.course, {
    $push: { quizzes: quiz._id },
  });

  res.status(201).json({ success: true, data: quiz });
});

// @desc    Create exam manually
// @route   POST /api/upload/exam
export const createExam = asyncHandler(async (req, res) => {
  const exam = await Exam.create({
    ...req.body,
    createdBy: req.user._id,
  });

  await Course.findByIdAndUpdate(req.body.course, {
    $push: { exams: exam._id },
  });

  res.status(201).json({ success: true, data: exam });
});

// @desc    Delete uploaded file
// @route   DELETE /api/upload/:publicId
export const deleteUpload = asyncHandler(async (req, res) => {
  const resourceType = req.query.type || 'image';
  await deleteFromCloudinary(req.params.publicId, resourceType);

  res.json({ success: true, message: 'File deleted' });
});
