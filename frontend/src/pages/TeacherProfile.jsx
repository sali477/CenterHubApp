import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiStar, FiCheckCircle } from 'react-icons/fi';
import { teacherAPI } from '../api/index';
import CourseCard from '../components/courses/CourseCard';
import { StarRating } from '../components/common/ReviewCard';

const TeacherProfile = () => {
  const { id } = useParams();
  const [teacher, setTeacher] = useState(null);

  useEffect(() => {
    teacherAPI.getOne(id).then(({ data }) => setTeacher(data.data));
  }, [id]);

  if (!teacher) {
    return <div className="max-w-4xl mx-auto px-4 py-16 animate-pulse"><div className="h-48 bg-gray-200 rounded-xl" /></div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="card p-6 md:p-8">
        <div className="flex flex-col md:flex-row gap-6">
          {teacher.photo || teacher.user?.avatar ? (
            <img
              src={teacher.photo || teacher.user.avatar}
              alt=""
              className="w-32 h-32 rounded-xl object-cover"
            />
          ) : (
            <div className="w-32 h-32 rounded-xl bg-primary-100 flex items-center justify-center text-4xl font-bold text-primary-600">
              {teacher.user?.name?.charAt(0)}
            </div>
          )}

          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{teacher.user?.name}</h1>
              {teacher.isVerified && (
                <span className="badge-verified flex items-center gap-1">
                  <FiCheckCircle /> Verified
                </span>
              )}
            </div>
            <StarRating rating={Math.round(teacher.rating)} />
            <p className="text-gray-600 mt-3">{teacher.bio}</p>

            {teacher.subjects?.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {teacher.subjects.map((s) => (
                  <span key={s} className="badge bg-gray-100 text-gray-700">{s}</span>
                ))}
              </div>
            )}

            {teacher.experience?.years > 0 && (
              <p className="text-sm text-gray-500 mt-3">
                {teacher.experience.years} years of experience
              </p>
            )}

            {teacher.center && (
              <Link
                to={`/centers/${teacher.center._id}`}
                className="inline-block mt-3 text-primary-600 hover:underline text-sm"
              >
                Works at {teacher.center.name}
              </Link>
            )}
          </div>
        </div>
      </div>

      {teacher.courses?.length > 0 && (
        <section className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Courses</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {teacher.courses.map((course, i) => (
              <CourseCard key={course._id} course={course} index={i} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default TeacherProfile;
