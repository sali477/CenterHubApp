import { Outlet, NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  FiHome, FiBook, FiUsers, FiBarChart2, FiSettings,
  FiVideo, FiFileText, FiCalendar, FiDollarSign,
} from 'react-icons/fi';
const sidebarConfigs = {
  student: [
    { to: '/dashboard/student', label: 'Overview', icon: FiHome, end: true },
    { to: '/dashboard/student/courses', label: 'My Courses', icon: FiBook },
    { to: '/dashboard/student/progress', label: 'Progress', icon: FiBarChart2 },
  ],
  teacher: [
    { to: '/dashboard/teacher', label: 'Overview', icon: FiHome, end: true },
    { to: '/dashboard/teacher/courses', label: 'My Courses', icon: FiBook },
    { to: '/dashboard/teacher/students', label: 'Students', icon: FiUsers },
    { to: '/dashboard/teacher/live', label: 'Live Sessions', icon: FiVideo },
    { to: '/dashboard/teacher/content', label: 'Content', icon: FiFileText },
  ],
  center_owner: [
    { to: '/dashboard/center', label: 'Overview', icon: FiHome, end: true },
    { to: '/dashboard/center/profile', label: 'Center Profile', icon: FiSettings },
    { to: '/dashboard/center/teachers', label: 'Teachers', icon: FiUsers },
    { to: '/dashboard/center/courses', label: 'Courses', icon: FiBook },
    { to: '/dashboard/center/students', label: 'Students', icon: FiUsers },
    { to: '/dashboard/center/revenue', label: 'Revenue', icon: FiDollarSign },
    { to: '/dashboard/center/stats', label: 'Statistics', icon: FiBarChart2 },
  ],
  admin: [
    { to: '/dashboard/admin', label: 'Analytics', icon: FiBarChart2, end: true },
    { to: '/dashboard/admin/users', label: 'Users', icon: FiUsers },
    { to: '/dashboard/admin/centers', label: 'Verify Centers', icon: FiHome },
    { to: '/dashboard/admin/teachers', label: 'Verify Teachers', icon: FiUsers },
    { to: '/dashboard/admin/reports', label: 'Reports', icon: FiFileText },
  ],
};

const DashboardLayout = () => {
  const { user } = useSelector((state) => state.auth);
  const links = sidebarConfigs[user?.role] || sidebarConfigs.student;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="w-64 bg-white border-r border-gray-200 hidden lg:block">
        <div className="p-6 border-b border-gray-100">
          <h2 className="font-bold text-gray-900 capitalize">
            {user?.role?.replace('_', ' ')} Dashboard
          </h2>
          <p className="text-sm text-gray-500 mt-1">{user?.name}</p>
        </div>
        <nav className="p-4 space-y-1">
          {links.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              <Icon className="w-5 h-5" />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="flex-1 overflow-auto">
        <nav className="lg:hidden sticky top-0 z-10 bg-white border-b border-gray-200 overflow-x-auto">
          <div className="flex gap-1 p-2 min-w-max">
            {links.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                    isActive
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                {label}
              </NavLink>
            ))}
          </div>
        </nav>
        <div className="p-6 lg:p-8">
          <Outlet />
        </div>
      </div>    </div>
  );
};

export default DashboardLayout;
