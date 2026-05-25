import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FiMapPin, FiBook, FiUsers, FiAward } from 'react-icons/fi';
import SearchBar from '../components/common/SearchBar';
import CenterCard from '../components/centers/CenterCard';
import CourseCard from '../components/courses/CourseCard';
import { fetchCenters } from '../store/slices/centerSlice';
import { fetchCourses } from '../store/slices/courseSlice';
import { aiAPI } from '../api/index';

const Home = () => {
  const dispatch = useDispatch();
  const { list: centers, interpretation } = useSelector((state) => state.centers);
  const { list: courses } = useSelector((state) => state.courses);

  useEffect(() => {
    dispatch(fetchCenters({ limit: 6, sort: '-rating' }));
    dispatch(fetchCourses({ limit: 4, sort: '-rating' }));
  }, [dispatch]);

  const stats = [
    { icon: FiMapPin, label: 'Centers', value: '500+' },
    { icon: FiBook, label: 'Courses', value: '2000+' },
    { icon: FiUsers, label: 'Students', value: '50K+' },
    { icon: FiAward, label: 'Teachers', value: '1000+' },
  ];

  return (
    <div>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-morocco-green rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Find Your Perfect
              <span className="block text-primary-200">Educational Center</span>
            </h1>
            <p className="text-lg md:text-xl text-primary-100 mb-8">
              Discover top-rated centers, courses, and teachers across Morocco.
              Powered by AI to match your learning goals.
            </p>
            <SearchBar />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 max-w-3xl mx-auto"
          >
            {stats.map(({ icon: Icon, label, value }) => (
              <div key={label} className="text-center bg-white/10 backdrop-blur rounded-xl p-4">
                <Icon className="w-6 h-6 mx-auto mb-2 text-primary-200" />
                <div className="text-2xl font-bold">{value}</div>
                <div className="text-sm text-primary-200">{label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* AI interpretation */}
      {interpretation && (
        <section className="max-w-7xl mx-auto px-4 py-4">
          <div className="bg-primary-50 border border-primary-100 rounded-lg p-4 text-sm text-primary-800">
            AI understood: {interpretation.subject && `Subject: ${interpretation.subject}`}
            {interpretation.preferences?.length > 0 && ` • Preferences: ${interpretation.preferences.join(', ')}`}
          </div>
        </section>
      )}

      {/* Featured Centers */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="section-title">Top Rated Centers</h2>
          <Link to="/centers" className="text-primary-600 hover:text-primary-700 font-medium text-sm">
            View all →
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {centers.map((center, i) => (
            <CenterCard key={center._id} center={center} index={i} />
          ))}
        </div>
      </section>

      {/* Popular Courses */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="section-title">Popular Courses</h2>
            <Link to="/courses" className="text-primary-600 hover:text-primary-700 font-medium text-sm">
              View all →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {courses.map((course, i) => (
              <CourseCard key={course._id} course={course} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-gradient-to-r from-morocco-red to-primary-600 rounded-2xl p-8 md:p-12 text-white text-center">
          <h2 className="text-3xl font-bold mb-4">Are you an educator?</h2>
          <p className="text-lg text-white/90 mb-6 max-w-2xl mx-auto">
            Register your center or create your independent academy on CentreHub Morocco.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="bg-white text-primary-700 font-semibold py-3 px-8 rounded-lg hover:bg-gray-100 transition-colors">
              Register as Center Owner
            </Link>
            <Link to="/register" className="border-2 border-white text-white font-semibold py-3 px-8 rounded-lg hover:bg-white/10 transition-colors">
              Become a Teacher
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
