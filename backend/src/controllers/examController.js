import asyncHandler from 'express-async-handler';
import Exam from '../models/Exam.js';
import Enrollment from '../models/Enrollment.js';

const verifyEnrollment = async (userId, courseId) => {
  return Enrollment.findOne({
    student: userId,
    course: courseId,
    status: { $in: ['active', 'completed'] },
  });
};

// @desc    Get exam for taking (answers hidden)
// @route   GET /api/exams/:id
export const getExam = asyncHandler(async (req, res) => {
  const exam = await Exam.findById(req.params.id);

  if (!exam) {
    res.status(404);
    throw new Error('Exam not found');
  }

  const enrollment = await verifyEnrollment(req.user._id, exam.course);
  if (!enrollment) {
    res.status(403);
    throw new Error('You must be enrolled to take this exam');
  }

  const safeExam = {
    _id: exam._id,
    title: exam.title,
    description: exam.description,
    course: exam.course,
    duration: exam.duration,
    passingScore: exam.passingScore,
    totalPoints: exam.totalPoints,
    questions: exam.questions.map((q, i) => ({
      _id: i,
      question: q.question,
      type: q.type,
      options: q.type === 'multiple_choice' || q.type === 'true_false' ? q.options : undefined,
      points: q.points,
    })),
    previousAttempts: exam.attempts
      .filter((a) => a.student.toString() === req.user._id.toString())
      .map((a) => ({
        score: a.score,
        completedAt: a.completedAt,
      })),
  };

  res.json({ success: true, data: safeExam });
});

// @desc    Start exam (records start time)
// @route   POST /api/exams/:id/start
export const startExam = asyncHandler(async (req, res) => {
  const exam = await Exam.findById(req.params.id);

  if (!exam) {
    res.status(404);
    throw new Error('Exam not found');
  }

  const enrollment = await verifyEnrollment(req.user._id, exam.course);
  if (!enrollment) {
    res.status(403);
    throw new Error('You must be enrolled');
  }

  const startedAt = new Date();
  const expiresAt = new Date(startedAt.getTime() + exam.duration * 60 * 1000);

  res.json({
    success: true,
    data: { startedAt, expiresAt, duration: exam.duration },
  });
});

// @desc    Submit exam answers
// @route   POST /api/exams/:id/submit
export const submitExam = asyncHandler(async (req, res) => {
  const exam = await Exam.findById(req.params.id);

  if (!exam) {
    res.status(404);
    throw new Error('Exam not found');
  }

  const enrollment = await verifyEnrollment(req.user._id, exam.course);
  if (!enrollment) {
    res.status(403);
    throw new Error('You must be enrolled');
  }

  const { answers, startedAt } = req.body;

  if (startedAt) {
    const elapsed = (Date.now() - new Date(startedAt).getTime()) / 1000 / 60;
    if (elapsed > exam.duration + 1) {
      res.status(400);
      throw new Error('Time limit exceeded');
    }
  }

  let earnedPoints = 0;
  let totalPoints = 0;

  const results = exam.questions.map((q, i) => {
    totalPoints += q.points || 1;
    let isCorrect = false;

    if (q.type === 'multiple_choice' || q.type === 'true_false') {
      isCorrect = answers[i] === q.correctAnswer;
    } else if (q.type === 'short_answer') {
      isCorrect =
        String(answers[i]).trim().toLowerCase() ===
        String(q.correctAnswer).trim().toLowerCase();
    }

    if (isCorrect) earnedPoints += q.points || 1;

    return {
      question: q.question,
      type: q.type,
      yourAnswer: answers[i],
      correctAnswer: q.correctAnswer,
      isCorrect,
    };
  });

  const score = Math.round((earnedPoints / totalPoints) * 100);
  const passed = score >= exam.passingScore;

  exam.attempts.push({
    student: req.user._id,
    score,
    answers,
    startedAt: startedAt ? new Date(startedAt) : new Date(),
    completedAt: new Date(),
  });
  await exam.save();

  if (passed && !enrollment.progress.completedExams.includes(exam._id)) {
    enrollment.progress.completedExams.push(exam._id);
    await enrollment.save();
  }

  res.json({
    success: true,
    data: {
      score,
      passed,
      earnedPoints,
      totalPoints,
      passingScore: exam.passingScore,
      results,
    },
  });
});
