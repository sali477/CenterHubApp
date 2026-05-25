import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchNotifications, markNotificationRead } from '../store/slices/notificationSlice';
import { formatDateTime } from '../utils/helpers';

const Notifications = () => {
  const dispatch = useDispatch();
  const { list: notifications } = useSelector((state) => state.notifications);

  useEffect(() => {
    dispatch(fetchNotifications());
  }, [dispatch]);

  const handleRead = (id) => {
    dispatch(markNotificationRead(id));
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="section-title mb-6">Notifications</h1>
      <div className="space-y-2">
        {notifications.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No notifications yet.</p>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif._id}
              onClick={() => !notif.isRead && handleRead(notif._id)}
              className={`card p-4 cursor-pointer transition-colors ${
                !notif.isRead ? 'border-l-4 border-l-primary-500 bg-primary-50/30' : ''
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium text-gray-900">{notif.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{notif.message}</p>
                  {notif.link && (
                    <Link to={notif.link} className="text-sm text-primary-600 hover:underline mt-1 inline-block">
                      View details
                    </Link>
                  )}
                </div>
                <span className="text-xs text-gray-400 whitespace-nowrap ml-4">
                  {formatDateTime(notif.createdAt)}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Notifications;
