import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiBook, FiUsers, FiDollarSign, FiStar, FiCopy, FiRefreshCw,
  FiSettings, FiBarChart2, FiCheckCircle,
} from 'react-icons/fi';
import { centerAPI } from '../../api/index';
import useMyCenter from '../../hooks/useMyCenter';
import CreateCenterForm from './center/CreateCenterForm';

const CenterOwnerDashboard = () => {
  const { center, stats, loading, refresh, setCenter } = useMyCenter();
  const [codeMsg, setCodeMsg] = useState('');

  const copyInvitationCode = () => {
    navigator.clipboard.writeText(center.invitationCode);
    setCodeMsg('Copied!');
    setTimeout(() => setCodeMsg(''), 2000);
  };

  const regenerateCode = async () => {
    const { data } = await centerAPI.regenerateCode(center._id);
    setCenter({ ...center, invitationCode: data.invitationCode });
    setCodeMsg('New code generated');
    setTimeout(() => setCodeMsg(''), 2000);
  };

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3" />
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-gray-200 rounded-xl" />)}
        </div>
      </div>
    );
  }

  if (!center) {
    return <CreateCenterForm onCreated={() => refresh()} />;
  }

  const quickLinks = [
    { to: '/dashboard/center/profile', label: 'Edit Profile', icon: FiSettings, desc: 'Logo, cover, info' },
    { to: '/dashboard/center/teachers', label: 'Teachers', icon: FiUsers, desc: `${stats?.totalTeachers || 0} teachers` },
    { to: '/dashboard/center/courses', label: 'Courses', icon: FiBook, desc: `${stats?.totalCourses || 0} courses` },
    { to: '/dashboard/center/students', label: 'Students', icon: FiUsers, desc: `${stats?.totalStudents || 0} enrolled` },
    { to: '/dashboard/center/revenue', label: 'Revenue', icon: FiDollarSign, desc: `${stats?.revenue || 0} MAD` },
    { to: '/dashboard/center/stats', label: 'Statistics', icon: FiBarChart2, desc: 'Analytics & growth' },
  ];

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">{center.name}</h1>
            {center.isVerified && (
              <span className="badge-verified flex items-center gap-1">
                <FiCheckCircle className="w-3 h-3" /> Verified
              </span>
            )}
          </div>
          <p className="text-gray-500">Center Owner Dashboard</p>
        </div>
        <Link to={`/centers/${center._id}`} className="btn-secondary text-sm">
          View Public Profile
        </Link>
      </div>

      {center.invitationCode && (
        <div className="card p-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-primary-50">
          <div>
            <p className="text-sm text-gray-600">Teacher Invitation Code</p>
            <p className="font-mono font-bold text-lg">{center.invitationCode}</p>
            {codeMsg && <p className="text-xs text-green-600 mt-1">{codeMsg}</p>}
          </div>
          <div className="flex gap-2">
            <button onClick={copyInvitationCode} className="btn-secondary flex items-center gap-2 text-sm">
              <FiCopy /> Copy
            </button>
            <button onClick={regenerateCode} className="btn-secondary flex items-center gap-2 text-sm">
              <FiRefreshCw /> Regenerate
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { icon: FiBook, label: 'Courses', value: stats?.totalCourses || 0, color: 'text-primary-600', bg: 'bg-primary-50' },
          { icon: FiUsers, label: 'Teachers', value: stats?.totalTeachers || 0, color: 'text-green-600', bg: 'bg-green-50' },
          { icon: FiUsers, label: 'Students', value: stats?.totalStudents || 0, color: 'text-purple-600', bg: 'bg-purple-50' },
          { icon: FiDollarSign, label: 'Revenue', value: `${stats?.revenue || 0} MAD`, color: 'text-yellow-600', bg: 'bg-yellow-50' },
        ].map(({ icon: Icon, label, value, color, bg }, i) => (
          <motion.div key={label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }} className="card p-5">
            <div className={`w-10 h-10 ${bg} rounded-lg flex items-center justify-center mb-3`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-sm text-gray-500">{label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {quickLinks.map(({ to, label, icon: Icon, desc }) => (
          <Link key={to} to={to}
            className="card p-5 hover:shadow-md transition-shadow group">
            <Icon className="w-6 h-6 text-primary-600 mb-2 group-hover:scale-110 transition-transform" />
            <h3 className="font-semibold">{label}</h3>
            <p className="text-sm text-gray-500">{desc}</p>
          </Link>
        ))}
      </div>

      <div className="card p-6">
        <h2 className="font-semibold mb-4 flex items-center gap-2">
          <FiStar className="text-yellow-400" /> Performance
        </h2>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-primary-600">{stats?.rating?.toFixed(1) || '0.0'}</p>
            <p className="text-sm text-gray-500">Rating</p>
          </div>
          <div>
            <p className="text-2xl font-bold">{stats?.numReviews || 0}</p>
            <p className="text-sm text-gray-500">Reviews</p>
          </div>
          <div>
            <p className="text-2xl font-bold">{stats?.popularity || 0}</p>
            <p className="text-sm text-gray-500">Popularity</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CenterOwnerDashboard;
