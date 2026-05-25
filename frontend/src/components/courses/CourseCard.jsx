import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiStar, FiClock, FiUsers } from 'react-icons/fi';
import { formatPrice } from '../../utils/helpers';

const CourseCard = ({ course, index = 0 }) => {
  const teacherName = course.teacher?.user?.name || 'Instructor';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Link to={`/courses/${course._id}`} className="card block hover:shadow-md transition-shadow group">
        <div className="relative h-36 bg-gray-200">
          {course.thumbnail ? (
            <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
              <span className="text-white text-2xl font-bold">{course.subject?.charAt(0)}</span>
            </div>
          )}
          <span className="absolute top-2 left-2 badge bg-white/90 text-gray-700">
            {course.subject}
          </span>
        </div>

        <div className="p-4">
          <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-primary-600 transition-colors">
            {course.title}
          </h3>
          <p className="text-sm text-gray-500 mt-1">{teacherName}</p>

          <div className="flex items-center gap-3 mt-2 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <FiStar className="text-yellow-400" />
              {course.rating?.toFixed(1) || '0.0'}
            </span>
            <span className="flex items-center gap-1">
              <FiUsers />
              {course.enrolledStudents?.length || 0}
            </span>
            {course.duration > 0 && (
              <span className="flex items-center gap-1">
                <FiClock />
                {course.duration}h
              </span>
            )}
          </div>

          <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
            <span className="font-bold text-primary-600">
              {course.isFree ? 'Free' : formatPrice(course.price)}
            </span>
            <span className="text-xs text-gray-400 capitalize">{course.level}</span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default CourseCard;
