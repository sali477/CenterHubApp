import asyncHandler from 'express-async-handler';
import Review from '../models/Review.js';
import Center from '../models/Center.js';
import Teacher from '../models/Teacher.js';
import Course from '../models/Course.js';

const updateEntityRating = async (Model, entityId) => {
  const stats = await Review.aggregate([
    { $match: { [Model.modelName.toLowerCase()]: entityId } },
    {
      $group: {
        _id: null,
        avgRating: { $avg: '$rating' },
        numReviews: { $sum: 1 },
      },
    },
  ]);

  if (stats.length > 0) {
    await Model.findByIdAndUpdate(entityId, {
      rating: Math.round(stats[0].avgRating * 10) / 10,
      numReviews: stats[0].numReviews,
    });
  }
};

// @desc    Create review
// @route   POST /api/reviews
export const createReview = asyncHandler(async (req, res) => {
  const { rating, comment, center, teacher, course } = req.body;

  const review = await Review.create({
    user: req.user._id,
    rating,
    comment,
    center,
    teacher,
    course,
  });

  if (center) await updateEntityRating(Center, center);
  if (teacher) await updateEntityRating(Teacher, teacher);
  if (course) await updateEntityRating(Course, course);

  const populated = await review.populate('user', 'name avatar');

  res.status(201).json({ success: true, data: populated });
});

// @desc    Get reviews for entity
// @route   GET /api/reviews
export const getReviews = asyncHandler(async (req, res) => {
  const filter = {};

  if (req.query.center) filter.center = req.query.center;
  if (req.query.teacher) filter.teacher = req.query.teacher;
  if (req.query.course) filter.course = req.query.course;

  const reviews = await Review.find(filter)
    .populate('user', 'name avatar')
    .sort('-createdAt');

  res.json({ success: true, count: reviews.length, data: reviews });
});

// @desc    Delete review
// @route   DELETE /api/reviews/:id
export const deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    res.status(404);
    throw new Error('Review not found');
  }

  if (
    review.user.toString() !== req.user._id.toString() &&
    req.user.role !== 'admin'
  ) {
    res.status(403);
    throw new Error('Not authorized');
  }

  await review.deleteOne();

  if (review.center) await updateEntityRating(Center, review.center);
  if (review.teacher) await updateEntityRating(Teacher, review.teacher);
  if (review.course) await updateEntityRating(Course, review.course);

  res.json({ success: true, message: 'Review deleted' });
});
