import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCourses } from '../store/slices/courseSlice';
import CourseCard from '../components/courses/CourseCard';
import SearchBar from '../components/common/SearchBar';

const Courses = () => {
  const dispatch = useDispatch();
  const { list: courses, loading } = useSelector((state) => state.courses);

  useEffect(() => {
    dispatch(fetchCourses({ limit: 20 }));
  }, [dispatch]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="section-title mb-6">All Courses</h1>
      <div className="mb-8">
        <SearchBar placeholder="Search courses..." onSearch={(q) => dispatch(fetchCourses({ search: q }))} />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="card h-64 animate-pulse bg-gray-100" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {courses.map((course, i) => (
            <CourseCard key={course._id} course={course} index={i} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Courses;
