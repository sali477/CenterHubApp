import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiMenu, FiX, FiBell, FiMessageSquare, FiUser, FiLogOut,
  FiHome, FiBook, FiGrid,
} from 'react-icons/fi';
import { logoutUser } from '../../store/slices/authSlice';
import { toggleSidebar } from '../../store/slices/uiSlice';
import { disconnectSocket } from '../../utils/socket';

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { unreadCount } = useSelector((state) => state.notifications);
  const { sidebarOpen } = useSelector((state) => state.ui);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    disconnectSocket();
    navigate('/');
  };

  const dashboardLinks = {
    student: '/dashboard/student',
    teacher: '/dashboard/teacher',
    center_owner: '/dashboard/center',
    admin: '/dashboard/admin',
  };

  const navLinks = [
    { to: '/', label: 'Home', icon: FiHome },
    { to: '/centers', label: 'Centers', icon: FiGrid },
    { to: '/courses', label: 'Courses', icon: FiBook },
  ];

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <button
              onClick={() => dispatch(toggleSidebar())}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              {sidebarOpen ? <FiX /> : <FiMenu />}
            </button>

            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-morocco-red to-morocco-green rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">CH</span>
              </div>
              <span className="font-bold text-lg hidden sm:block">
                Centre<span className="text-primary-600">Hub</span>
                <span className="text-xs text-gray-400 ml-1">Morocco</span>
              </span>
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </div>

          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <>
                <Link to="/notifications" className="relative p-2 rounded-lg hover:bg-gray-100">
                  <FiBell className="w-5 h-5 text-gray-600" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Link>
                <Link to="/messages" className="p-2 rounded-lg hover:bg-gray-100">
                  <FiMessageSquare className="w-5 h-5 text-gray-600" />
                </Link>

                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-100"
                  >
                    {user?.avatar ? (
                      <img src={user.avatar} alt="" className="w-8 h-8 rounded-full object-cover" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-medium text-sm">
                        {user?.name?.charAt(0)}
                      </div>
                    )}
                  </button>

                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50"
                      >
                        <div className="px-4 py-2 border-b border-gray-100">
                          <p className="font-medium text-sm truncate">{user?.name}</p>
                          <p className="text-xs text-gray-500 capitalize">{user?.role?.replace('_', ' ')}</p>
                        </div>
                        <Link
                          to={dashboardLinks[user?.role] || '/dashboard/student'}
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <FiUser /> Dashboard
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full"
                        >
                          <FiLogOut /> Logout
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="btn-secondary text-sm py-2 px-4">Login</Link>
                <Link to="/register" className="btn-primary text-sm py-2 px-4">Sign Up</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
