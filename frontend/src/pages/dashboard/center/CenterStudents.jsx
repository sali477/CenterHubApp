import { FiMail, FiBook } from 'react-icons/fi';
import useMyCenter from '../../../hooks/useMyCenter';
import CreateCenterForm from './CreateCenterForm';
import { getInitials, formatDate } from '../../../utils/helpers';

const CenterStudents = () => {
  const { center, loading, refresh } = useMyCenter();

  if (loading) return <div className="animate-pulse h-64 bg-gray-200 rounded-xl" />;
  if (!center) return <CreateCenterForm onCreated={refresh} />;

  const students = center.students || [];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Students</h1>
      <p className="text-gray-500 mb-6">{students.length} enrolled student{students.length !== 1 ? 's' : ''}</p>

      {students.length === 0 ? (
        <div className="card p-8 text-center text-gray-500">
          <FiBook className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>No students enrolled yet.</p>
          <p className="text-sm mt-1">Students appear here when they enroll in your center's courses.</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Student</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Email</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600 hidden sm:table-cell">Joined</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student._id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {student.avatar ? (
                          <img src={student.avatar} alt="" className="w-9 h-9 rounded-full object-cover" />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-medium text-sm">
                            {getInitials(student.name)}
                          </div>
                        )}
                        <span className="font-medium">{student.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      <span className="flex items-center gap-1"><FiMail className="w-3 h-3" />{student.email}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-400 hidden sm:table-cell">
                      {student.createdAt ? formatDate(student.createdAt) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default CenterStudents;
