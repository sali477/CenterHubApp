import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import {
  FiMapPin, FiPhone, FiMail, FiStar, FiCheckCircle, FiGlobe,
} from 'react-icons/fi';
import { fetchCenter, clearCurrentCenter } from '../store/slices/centerSlice';
import { enrollInCourse } from '../store/slices/courseSlice';
import CourseCard from '../components/courses/CourseCard';
import ReviewCard from '../components/common/ReviewCard';
import { StarRating } from '../components/common/ReviewCard';
import GoogleMapView from '../components/maps/GoogleMapView';
import { reviewAPI } from '../api/index';

const CenterProfile = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { current: center, reviews } = useSelector((state) => state.centers);
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });

  useEffect(() => {
    dispatch(fetchCenter(id));
    return () => dispatch(clearCurrentCenter());
  }, [dispatch, id]);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    await reviewAPI.create({ ...reviewForm, center: id });
    setShowReviewForm(false);
    dispatch(fetchCenter(id));
  };

  if (!center) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="animate-pulse space-y-4">
          <div className="h-48 bg-gray-200 rounded-xl" />
          <div className="h-8 bg-gray-200 rounded w-1/3" />
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Cover */}
      <div className="relative h-48 md:h-64 bg-gradient-to-r from-primary-600 to-primary-800">
        {center.coverImage && (
          <img src={center.coverImage} alt="" className="w-full h-full object-cover" />
        )}
        <div className="absolute inset-0 bg-black/30" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative -mt-16 mb-8">
          <div className="flex flex-col md:flex-row md:items-end gap-4">
            {center.logo ? (
              <img src={center.logo} alt="" className="w-24 h-24 rounded-xl border-4 border-white shadow-lg object-cover" />
            ) : (
              <div className="w-24 h-24 rounded-xl border-4 border-white shadow-lg bg-primary-100 flex items-center justify-center text-3xl font-bold text-primary-600">
                {center.name?.charAt(0)}
              </div>
            )}
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{center.name}</h1>
                {center.isVerified && (
                  <span className="badge-verified flex items-center gap-1">
                    <FiCheckCircle /> Verified
                  </span>
                )}
              </div>
              <div className="flex items-center gap-4 mt-2 text-gray-500">
                <StarRating rating={Math.round(center.rating)} />
                <span>{center.rating?.toFixed(1)} ({center.numReviews} reviews)</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-16">
          <div className="lg:col-span-2 space-y-8">
            <section className="card p-6">
              <h2 className="text-xl font-semibold mb-4">About</h2>
              <p className="text-gray-600 leading-relaxed">{center.description}</p>
              {center.subjects?.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {center.subjects.map((s) => (
                    <span key={s} className="badge bg-primary-50 text-primary-700">{s}</span>
                  ))}
                </div>
              )}
            </section>

            <section className="card p-6">
              <h2 className="text-xl font-semibold mb-4">Location</h2>
              <GoogleMapView center={center} height="320px" zoom={15} />
              {center.address && (
                <p className="text-sm text-gray-500 mt-3">
                  {center.address.street}, {center.address.city}, {center.address.country}
                </p>
              )}
            </section>

            {/* Courses */}
            <section>
              <h2 className="text-xl font-semibold mb-4">Available Courses</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {center.courses?.map((course, i) => (
                  <CourseCard key={course._id} course={course} index={i} />
                ))}
              </div>
            </section>

            {/* Teachers */}
            <section>
              <h2 className="text-xl font-semibold mb-4">Teachers</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {center.teachers?.map((teacher) => (
                  <Link
                    key={teacher._id}
                    to={`/teachers/${teacher._id}`}
                    className="card p-4 flex items-center gap-3 hover:shadow-md transition-shadow"
                  >
                    {teacher.photo || teacher.user?.avatar ? (
                      <img src={teacher.photo || teacher.user.avatar} alt="" className="w-12 h-12 rounded-full object-cover" />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-medium">
                        {teacher.user?.name?.charAt(0)}
                      </div>
                    )}
                    <div>
                      <h3 className="font-medium">{teacher.user?.name}</h3>
                      <p className="text-sm text-gray-500">{teacher.subjects?.slice(0, 2).join(', ')}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>

            {/* Reviews */}
            <section className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Reviews</h2>
                {isAuthenticated && (
                  <button onClick={() => setShowReviewForm(!showReviewForm)} className="btn-primary text-sm py-2">
                    Write Review
                  </button>
                )}
              </div>

              {showReviewForm && (
                <form onSubmit={handleSubmitReview} className="mb-6 p-4 bg-gray-50 rounded-lg space-y-3">
                  <StarRating
                    rating={reviewForm.rating}
                    interactive
                    onChange={(r) => setReviewForm({ ...reviewForm, rating: r })}
                  />
                  <textarea
                    required
                    value={reviewForm.comment}
                    onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                    className="input-field"
                    rows={3}
                    placeholder="Share your experience..."
                  />
                  <button type="submit" className="btn-primary text-sm">Submit Review</button>
                </form>
              )}

              {reviews?.length > 0 ? (
                reviews.map((review) => <ReviewCard key={review._id} review={review} />)
              ) : (
                <p className="text-gray-500 text-sm">No reviews yet.</p>
              )}
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="card p-6 sticky top-24">
              <h3 className="font-semibold mb-4">Contact Information</h3>
              <div className="space-y-3 text-sm">
                {center.address && (
                  <div className="flex items-start gap-2 text-gray-600">
                    <FiMapPin className="mt-0.5 flex-shrink-0" />
                    <span>
                      {center.address.street}, {center.address.city}, {center.address.country}
                    </span>
                  </div>
                )}
                {center.phone && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <FiPhone /><span>{center.phone}</span>
                  </div>
                )}
                {center.email && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <FiMail /><span>{center.email}</span>
                  </div>
                )}
                {center.website && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <FiGlobe />
                    <a href={center.website} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">
                      Website
                    </a>
                  </div>
                )}
              </div>

              {center.priceRange && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-sm text-gray-500">Price Range</p>
                  <p className="font-semibold text-primary-600">
                    {center.priceRange.min} - {center.priceRange.max} MAD
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CenterProfile;
