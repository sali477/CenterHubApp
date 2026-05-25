import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiCopy, FiRefreshCw, FiTrash2, FiMail } from 'react-icons/fi';
import { centerAPI } from '../../../api/index';
import useMyCenter from '../../../hooks/useMyCenter';
import CreateCenterForm from './CreateCenterForm';
import { getInitials } from '../../../utils/helpers';

const CenterTeachers = () => {
  const { center, loading, refresh } = useMyCenter();
  const [codeMsg, setCodeMsg] = useState('');

  const copyCode = () => {
    navigator.clipboard.writeText(center.invitationCode);
    setCodeMsg('Code copied!');
    setTimeout(() => setCodeMsg(''), 2000);
  };

  const regenerateCode = async () => {
    await centerAPI.regenerateCode(center._id);
    refresh();
    setCodeMsg('New code generated');
    setTimeout(() => setCodeMsg(''), 2000);
  };

  const removeTeacher = async (teacherId, name) => {
    if (!confirm(`Remove ${name} from your center?`)) return;
    await centerAPI.removeTeacher(center._id, teacherId);
    refresh();
  };

  if (loading) return <div className="animate-pulse h-64 bg-gray-200 rounded-xl" />;
  if (!center) return <CreateCenterForm onCreated={refresh} />;

  const teachers = center.teachers || [];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Teachers</h1>
      <p className="text-gray-500 mb-6">Manage teachers at {center.name}</p>

      <div className="card p-5 mb-6 bg-primary-50">
        <h2 className="font-semibold mb-2">Invite Teachers</h2>
        <p className="text-sm text-gray-600 mb-3">
          Share this code with teachers so they can join your center from their dashboard.
        </p>
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <p className="font-mono text-xl font-bold bg-white px-4 py-2 rounded-lg border">
            {center.invitationCode}
          </p>
          <div className="flex gap-2">
            <button onClick={copyCode} className="btn-secondary flex items-center gap-2 text-sm">
              <FiCopy /> Copy
            </button>
            <button onClick={regenerateCode} className="btn-secondary flex items-center gap-2 text-sm">
              <FiRefreshCw /> New Code
            </button>
          </div>
        </div>
        {codeMsg && <p className="text-sm text-green-600 mt-2">{codeMsg}</p>}
      </div>

      {teachers.length === 0 ? (
        <div className="card p-8 text-center text-gray-500">
          <p>No teachers yet. Share your invitation code to add teachers.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {teachers.map((teacher) => (
            <div key={teacher._id} className="card p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                {teacher.photo || teacher.user?.avatar ? (
                  <img src={teacher.photo || teacher.user.avatar} alt=""
                    className="w-12 h-12 rounded-full object-cover" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center font-medium text-primary-600">
                    {getInitials(teacher.user?.name)}
                  </div>
                )}
                <div>
                  <Link to={`/teachers/${teacher._id}`} className="font-medium hover:text-primary-600">
                    {teacher.user?.name}
                  </Link>
                  <p className="text-sm text-gray-500 flex items-center gap-1">
                    <FiMail className="w-3 h-3" /> {teacher.user?.email}
                  </p>
                  {teacher.subjects?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {teacher.subjects.slice(0, 3).map((s) => (
                        <span key={s} className="badge bg-gray-100 text-gray-600 text-xs">{s}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-500">{teacher.courses?.length || 0} courses</span>
                <button onClick={() => removeTeacher(teacher._id, teacher.user?.name)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg" title="Remove">
                  <FiTrash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CenterTeachers;
