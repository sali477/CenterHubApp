import { FiStar, FiTrendingUp, FiUsers, FiBook } from 'react-icons/fi';
import useMyCenter from '../../../hooks/useMyCenter';
import CreateCenterForm from './CreateCenterForm';

const CenterStats = () => {
  const { center, stats, loading, refresh } = useMyCenter();

  if (loading) return <div className="animate-pulse h-64 bg-gray-200 rounded-xl" />;
  if (!center) return <CreateCenterForm onCreated={refresh} />;

  const courses = center.courses || [];
  const teachers = center.teachers || [];
  const students = center.students || [];

  const avgStudentsPerCourse = courses.length
    ? (students.length / courses.length).toFixed(1)
    : 0;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Statistics</h1>
      <p className="text-gray-500 mb-8">Analytics and performance for {center.name}</p>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { icon: FiBook, label: 'Total Courses', value: stats?.totalCourses || 0, color: 'text-primary-600' },
          { icon: FiUsers, label: 'Teachers', value: stats?.totalTeachers || 0, color: 'text-green-600' },
          { icon: FiUsers, label: 'Students', value: stats?.totalStudents || 0, color: 'text-purple-600' },
          { icon: FiTrendingUp, label: 'Popularity', value: stats?.popularity || 0, color: 'text-orange-600' },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="card p-5 text-center">
            <Icon className={`w-6 h-6 ${color} mx-auto mb-2`} />
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-sm text-gray-500">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="card p-6">
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <FiStar className="text-yellow-400" /> Ratings
          </h2>
          <div className="text-center py-4">
            <p className="text-5xl font-bold text-primary-600">{stats?.rating?.toFixed(1) || '0.0'}</p>
            <p className="text-gray-500 mt-1">{stats?.numReviews || 0} reviews</p>
          </div>
        </div>

        <div className="card p-6">
          <h2 className="font-semibold mb-4">Engagement Metrics</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Avg students per course</span>
              <span className="font-bold">{avgStudentsPerCourse}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Revenue (MAD)</span>
              <span className="font-bold text-green-600">{stats?.revenue || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Verified status</span>
              <span className={`badge ${center.isVerified ? 'badge-verified' : 'bg-gray-100 text-gray-600'}`}>
                {center.isVerified ? 'Verified' : 'Pending'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Top courses by enrollment */}
      <div className="card p-6 mb-6">
        <h2 className="font-semibold mb-4">Courses Overview</h2>
        {courses.length === 0 ? (
          <p className="text-gray-500 text-sm">No courses yet.</p>
        ) : (
          <div className="space-y-3">
            {courses.map((course) => {
              const enrolled = course.enrolledStudents?.length || 0;
              const maxEnrolled = Math.max(...courses.map((c) => c.enrolledStudents?.length || 0), 1);
              const pct = Math.round((enrolled / maxEnrolled) * 100);
              return (
                <div key={course._id}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium truncate">{course.title}</span>
                    <span className="text-gray-500 ml-2">{enrolled} students</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-primary-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Teachers performance */}
      <div className="card p-6">
        <h2 className="font-semibold mb-4">Teachers Overview</h2>
        {teachers.length === 0 ? (
          <p className="text-gray-500 text-sm">No teachers yet.</p>
        ) : (
          <div className="space-y-3">
            {teachers.map((teacher) => (
              <div key={teacher._id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div>
                  <p className="font-medium text-sm">{teacher.user?.name}</p>
                  <p className="text-xs text-gray-400">{teacher.subjects?.join(', ') || 'No subjects'}</p>
                </div>
                <div className="text-right text-sm">
                  <p className="font-medium">{teacher.courses?.length || 0} courses</p>
                  <p className="text-yellow-500">★ {teacher.rating?.toFixed(1) || '0.0'}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CenterStats;
