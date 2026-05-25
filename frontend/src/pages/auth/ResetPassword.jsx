import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { authAPI } from '../../api/index';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await authAPI.resetPassword(token, password);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md card p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Reset Password</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm">{error}</div>}
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-field"
            placeholder="New password"
          />
          <input
            type="password"
            required
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="input-field"
            placeholder="Confirm password"
          />
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
        <Link to="/login" className="block text-center text-sm text-primary-600 mt-4">Back to login</Link>
      </motion.div>
    </div>
  );
};

export default ResetPassword;
