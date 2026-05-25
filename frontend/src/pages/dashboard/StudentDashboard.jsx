import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FiBook, FiTrendingUp } from 'react-icons/fi';
import { enrollmentAPI, aiAPI } from '../../api/index';
import CourseCard from '../../components/courses/CourseCard';
import CenterCard from '../../components/centers/CenterCard';

const StudentDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const [enrollments, setEnrollments] = useState([]);
  const [recommendations, setRecommendations] = useState({ courses: [], centers: [] });

  useEffect(() => {
    enrollmentAPI.getMy().then(({ data }) => setEnrollments(data.data));
    aiAPI.recommendations().then(({ data }) => setRecommendations(data.data)).catch(() => {});
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Welcome, {user?.name}</h1>
      <p className="text-gray-500 mb-8">Track your learning progress</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="card p-5">
          <FiBook className="w-8 h-8 text-primary-600 mb-2" />
          <p className="text-2xl font-bold">{enrollments.length}</p>
          <p className="text-sm text-gray-500">Enrolled Courses</p>
        </div>
        <div className="card p-5">
          <FiTrendingUp className="w-8 h-8 text-green-600 mb-2" />
          <p className="text-2xl font-bold">
            {enrollments.filter((e) => e.status === 'completed').length}
          </p>
          <p className="text-sm text-gray-500">Completed</p>
        </div>
        <div className="card p-5">
          <FiTrendingUp className="w-8 h-8 text-yellow-600 mb-2" />
          <p className="text-2xl font-bold">
            {Math.round(
              enrollments.reduce((acc, e) => acc + (e.progress?.percentage || 0), 0) /
                (enrollments.length || 1)
            )}%
          </p>
          <p className="text-sm text-gray-500">Avg Progress</p>
        </div>
      </div>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">My Courses</h2>
        {enrollments.length === 0 ? (
          <div className="card p-8 text-center text-gray-500">
            No courses yet. <Link to="/courses" className="text-primary-600">Browse courses</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {enrollments.map((enrollment) => (
              <Link
                key={enrollment._id}
                to={`/courses/${enrollment.course?._id}`}
                className="card p-4 flex items-center justify-between hover:shadow-md transition-shadow"
              >
                <div>
                  <h3 className="font-medium">{enrollment.course?.title}</h3>
                  <p className="text-sm text-gray-500 capitalize">{enrollment.status}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-primary-600">{enrollment.progress?.percentage || 0}%</p>
                  <div className="w-24 h-1.5 bg-gray-200 rounded-full mt-1">
                    <div
                      className="h-full bg-primary-600 rounded-full"
                      style={{ width: `${enrollment.progress?.percentage || 0}%` }}
                    />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {recommendations.courses?.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold mb-4">Recommended for You</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recommendations.courses.map((course, i) => (
              <CourseCard key={course._id} course={course} index={i} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default StudentDashboard;
