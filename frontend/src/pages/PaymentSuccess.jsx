import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiCheckCircle, FiLoader } from 'react-icons/fi';
import { paymentAPI } from '../api/index';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('verifying');
  const [enrollment, setEnrollment] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const verify = async () => {
      try {
        const sessionId = searchParams.get('session_id');
        const orderId = searchParams.get('order_id');
        const provider = searchParams.get('provider');

        const params = {};
        if (sessionId) params.session_id = sessionId;
        if (orderId) {
          params.order_id = orderId;
          params.provider = provider || 'cmi';
        }

        const { data } = await paymentAPI.verify(params);
        if (data.success) {
          setStatus('success');
          setEnrollment(data.enrollment);
        } else {
          setStatus('pending');
        }
      } catch (err) {
        setStatus('error');
        setError(err.response?.data?.message || 'Verification failed');
      }
    };

    verify();
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-8 max-w-md w-full text-center"
      >
        {status === 'verifying' && (
          <>
            <FiLoader className="w-12 h-12 text-primary-600 animate-spin mx-auto mb-4" />
            <h1 className="text-xl font-bold">Verifying Payment...</h1>
          </>
        )}

        {status === 'success' && (
          <>
            <FiCheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
            <p className="text-gray-600 mb-6">
              You are now enrolled in{' '}
              <strong>{enrollment?.course?.title || 'your course'}</strong>
            </p>
            <Link
              to={`/courses/${enrollment?.course?._id || ''}`}
              className="btn-primary inline-block"
            >
              Start Learning
            </Link>
          </>
        )}

        {status === 'pending' && (
          <>
            <h1 className="text-xl font-bold text-yellow-600 mb-2">Payment Pending</h1>
            <p className="text-gray-600 mb-4">Your payment is being processed.</p>
            <Link to="/dashboard/student" className="btn-secondary inline-block">Go to Dashboard</Link>
          </>
        )}

        {status === 'error' && (
          <>
            <h1 className="text-xl font-bold text-red-600 mb-2">Verification Failed</h1>
            <p className="text-gray-600 mb-4">{error}</p>
            <Link to="/courses" className="btn-primary inline-block">Browse Courses</Link>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default PaymentSuccess;
