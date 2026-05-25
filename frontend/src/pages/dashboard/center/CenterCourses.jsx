import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiPlus, FiEdit, FiEye } from 'react-icons/fi';
import { courseAPI } from '../../../api/index';
import useMyCenter from '../../../hooks/useMyCenter';
import CreateCenterForm from './CreateCenterForm';
import { SUBJECTS, formatPrice } from '../../../utils/helpers';

const CenterCourses = () => {
  const { center, loading, refresh } = useMyCenter();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: '', description: '', subject: 'Programming', price: 0,
    isFree: false, level: 'all', teacherId: '',
  });
  const [creating, setCreating] = useState(false);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.teacherId) {
      alert('Please select a teacher for this course');
      return;
    }
    setCreating(true);
    try {
      await courseAPI.create({
        title: form.title,
        description: form.description,
        subject: form.subject,
        price: form.isFree ? 0 : form.price,
        isFree: form.isFree,
        level: form.level,
        center: center._id,
        teacher: form.teacherId,
        isPublished: true,
      });
      setShowForm(false);
      setForm({ title: '', description: '', subject: 'Programming', price: 0, isFree: false, level: 'all', teacherId: '' });
      refresh();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create course');
    } finally {
      setCreating(false);
    }
  };

  if (loading) return <div className="animate-pulse h-64 bg-gray-200 rounded-xl" />;
  if (!center) return <CreateCenterForm onCreated={refresh} />;

  const courses = center.courses || [];
  const teachers = center.teachers || [];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Courses</h1>
          <p className="text-gray-500">{courses.length} course{courses.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2"
          disabled={teachers.length === 0}>
          <FiPlus /> Add Course
        </button>
      </div>

      {teachers.length === 0 && (
        <div className="bg-yellow-50 text-yellow-800 p-4 rounded-lg mb-4 text-sm">
          Add teachers first before creating courses. Go to Teachers and share your invitation code.
        </div>
      )}

      {showForm && (
        <form onSubmit={handleCreate} className="card p-6 mb-6 space-y-4">
          <h2 className="font-semibold">Create New Course</h2>
          <input required className="input-field" placeholder="Course Title" value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <textarea required className="input-field" rows={3} placeholder="Description" value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <select className="input-field" value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}>
              {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <select required className="input-field" value={form.teacherId}
              onChange={(e) => setForm({ ...form, teacherId: e.target.value })}>
              <option value="">Select Teacher</option>
              {teachers.map((t) => (
                <option key={t._id} value={t._id}>{t.user?.name}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <select className="input-field" value={form.level}
              onChange={(e) => setForm({ ...form, level: e.target.value })}>
              <option value="all">All Levels</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
            <label className="flex items-center gap-2 px-4 py-2.5 border rounded-lg cursor-pointer">
              <input type="checkbox" checked={form.isFree}
                onChange={(e) => setForm({ ...form, isFree: e.target.checked })} />
              Free course
            </label>
            {!form.isFree && (
              <input type="number" min="0" className="input-field" placeholder="Price (MAD)" value={form.price}
                onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} />
            )}
          </div>
          <div className="flex gap-2">
            <button type="submit" disabled={creating} className="btn-primary">
              {creating ? 'Creating...' : 'Create Course'}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
          </div>
        </form>
      )}

      {courses.length === 0 ? (
        <div className="card p-8 text-center text-gray-500">No courses yet. Create your first course.</div>
      ) : (
        <div className="space-y-3">
          {courses.map((course) => (
            <div key={course._id} className="card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                {course.thumbnail ? (
                  <img src={course.thumbnail} alt="" className="w-14 h-14 rounded-lg object-cover" />
                ) : (
                  <div className="w-14 h-14 rounded-lg bg-primary-100 flex items-center justify-center text-primary-600 font-bold">
                    {course.subject?.charAt(0)}
                  </div>
                )}
                <div>
                  <h3 className="font-medium">{course.title}</h3>
                  <p className="text-sm text-gray-500">
                    {course.subject} • {course.teacher?.user?.name || 'Teacher'} • {formatPrice(course.price)}
                  </p>
                  <p className="text-xs text-gray-400">
                    {course.enrolledStudents?.length || 0} students • {course.isPublished ? 'Published' : 'Draft'}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Link to={`/courses/${course._id}`} className="btn-secondary text-sm flex items-center gap-1 py-2">
                  <FiEye /> View
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CenterCourses;
