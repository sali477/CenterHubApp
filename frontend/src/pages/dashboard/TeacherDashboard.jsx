import { useState } from 'react';
import { useSelector } from 'react-redux';
import { FiPlus, FiUsers, FiBook } from 'react-icons/fi';
import { courseAPI, teacherAPI, liveSessionAPI } from '../../api/index';

const TeacherDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [invitationCode, setInvitationCode] = useState('');
  const [message, setMessage] = useState('');

  const handleJoinCenter = async (e) => {
    e.preventDefault();
    try {
      await teacherAPI.joinCenter(invitationCode);
      setMessage('Successfully joined center!');
      setShowJoinForm(false);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to join center');
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Teacher Dashboard</h1>
      <p className="text-gray-500 mb-8">Manage your courses and students</p>

      {message && (
        <div className="bg-green-50 text-green-700 p-3 rounded-lg mb-4 text-sm">{message}</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="card p-5 hover:shadow-md transition-shadow cursor-pointer">
          <FiBook className="w-8 h-8 text-primary-600 mb-2" />
          <p className="font-semibold">My Courses</p>
          <p className="text-sm text-gray-500">Create and manage courses</p>
        </div>
        <div className="card p-5 hover:shadow-md transition-shadow cursor-pointer">
          <FiUsers className="w-8 h-8 text-green-600 mb-2" />
          <p className="font-semibold">Students</p>
          <p className="text-sm text-gray-500">View enrolled students</p>
        </div>
        <button
          onClick={() => setShowJoinForm(true)}
          className="card p-5 hover:shadow-md transition-shadow text-left"
        >
          <FiPlus className="w-8 h-8 text-purple-600 mb-2" />
          <p className="font-semibold">Join a Center</p>
          <p className="text-sm text-gray-500">Use invitation code</p>
        </button>
      </div>

      {showJoinForm && (
        <form onSubmit={handleJoinCenter} className="card p-6 mb-8 max-w-md">
          <h3 className="font-semibold mb-4">Join Center with Invitation Code</h3>
          <input
            type="text"
            value={invitationCode}
            onChange={(e) => setInvitationCode(e.target.value.toUpperCase())}
            className="input-field mb-4"
            placeholder="Enter invitation code"
            required
          />
          <div className="flex gap-2">
            <button type="submit" className="btn-primary">Join Center</button>
            <button type="button" onClick={() => setShowJoinForm(false)} className="btn-secondary">Cancel</button>
          </div>
        </form>
      )}

      <div className="card p-6">
        <h2 className="font-semibold mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <button className="btn-primary flex items-center gap-2">
            <FiPlus /> Create Course
          </button>
          <button className="btn-secondary">Schedule Live Session</button>
          <button className="btn-secondary">Upload Content</button>
          <button className="btn-secondary">Create Independent Academy</button>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
