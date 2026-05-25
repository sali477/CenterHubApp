import { useEffect, useState } from 'react';
import { FiDollarSign, FiTrendingUp } from 'react-icons/fi';
import { centerAPI } from '../../../api/index';
import useMyCenter from '../../../hooks/useMyCenter';
import CreateCenterForm from './CreateCenterForm';
import { formatPrice, formatDateTime } from '../../../utils/helpers';

const CenterRevenue = () => {
  const { center, loading, refresh } = useMyCenter();
  const [revenue, setRevenue] = useState(null);
  const [loadingRevenue, setLoadingRevenue] = useState(true);

  useEffect(() => {
    if (center?._id) {
      centerAPI.getRevenue(center._id).then(({ data }) => {
        setRevenue(data.data);
        setLoadingRevenue(false);
      }).catch(() => setLoadingRevenue(false));
    }
  }, [center]);

  if (loading) return <div className="animate-pulse h-64 bg-gray-200 rounded-xl" />;
  if (!center) return <CreateCenterForm onCreated={refresh} />;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Revenue</h1>
      <p className="text-gray-500 mb-6">Financial overview for {center.name}</p>

      {loadingRevenue ? (
        <div className="animate-pulse h-32 bg-gray-200 rounded-xl" />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            <div className="card p-6 bg-gradient-to-br from-green-50 to-white">
              <FiDollarSign className="w-8 h-8 text-green-600 mb-2" />
              <p className="text-3xl font-bold text-green-700">
                {formatPrice(revenue?.totalRevenue || 0)}
              </p>
              <p className="text-sm text-gray-500">Total Revenue</p>
            </div>
            <div className="card p-6">
              <FiTrendingUp className="w-8 h-8 text-primary-600 mb-2" />
              <p className="text-3xl font-bold">{revenue?.transactions?.length || 0}</p>
              <p className="text-sm text-gray-500">Paid Enrollments</p>
            </div>
          </div>

          {/* Monthly breakdown */}
          {revenue?.byMonth?.length > 0 && (
            <div className="card p-6 mb-6">
              <h2 className="font-semibold mb-4">Monthly Revenue</h2>
              <div className="space-y-3">
                {revenue.byMonth.map((m) => (
                  <div key={m.label} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{m.label}</span>
                    <div className="flex items-center gap-4">
                      <span className="text-xs text-gray-400">{m.count} enrollments</span>
                      <span className="font-medium">{formatPrice(m.revenue)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* By course */}
          {revenue?.byCourse?.length > 0 && (
            <div className="card p-6 mb-6">
              <h2 className="font-semibold mb-4">Revenue by Course</h2>
              <div className="space-y-3">
                {revenue.byCourse.map((c, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                    <div>
                      <p className="font-medium text-sm">{c.course?.title || 'Unknown course'}</p>
                      <p className="text-xs text-gray-400">{c.enrollments} enrollments</p>
                    </div>
                    <span className="font-medium text-green-600">{formatPrice(c.revenue)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent transactions */}
          <div className="card p-6">
            <h2 className="font-semibold mb-4">Recent Transactions</h2>
            {revenue?.transactions?.length === 0 ? (
              <p className="text-gray-500 text-sm">No paid enrollments yet.</p>
            ) : (
              <div className="space-y-3">
                {revenue?.transactions?.slice(0, 20).map((tx) => (
                  <div key={tx._id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                    <div>
                      <p className="font-medium text-sm">{tx.student?.name}</p>
                      <p className="text-xs text-gray-400">{tx.course?.title}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-green-600">{formatPrice(tx.payment?.amount || 0)}</p>
                      <p className="text-xs text-gray-400">
                        {tx.payment?.paidAt ? formatDateTime(tx.payment.paidAt) : '—'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default CenterRevenue;
