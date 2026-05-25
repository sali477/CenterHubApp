import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCurrentUser } from './store/slices/authSlice';
import { fetchNotifications } from './store/slices/notificationSlice';
import { initSocket } from './utils/socket';

import MainLayout from './components/layout/MainLayout';
import DashboardLayout from './components/layout/DashboardLayout';
import ProtectedRoute from './routes/ProtectedRoute';

import Home from './pages/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import Centers from './pages/Centers';
import CenterProfile from './pages/CenterProfile';
import Courses from './pages/Courses';
import CoursePage from './pages/CoursePage';
import TeacherProfile from './pages/TeacherProfile';
import LiveSession from './pages/LiveSession';
import Notifications from './pages/Notifications';
import Messages from './pages/Messages';
import PaymentSuccess from './pages/PaymentSuccess';
import CMISimulate from './pages/CMISimulate';
import QuizTake from './pages/QuizTake';
import ExamTake from './pages/ExamTake';

import StudentDashboard from './pages/dashboard/StudentDashboard';
import TeacherDashboard from './pages/dashboard/TeacherDashboard';
import CenterOwnerDashboard from './pages/dashboard/CenterOwnerDashboard';
import CenterProfileEdit from './pages/dashboard/center/CenterProfileEdit';
import CenterTeachers from './pages/dashboard/center/CenterTeachers';
import CenterCourses from './pages/dashboard/center/CenterCourses';
import CenterStudents from './pages/dashboard/center/CenterStudents';
import CenterRevenue from './pages/dashboard/center/CenterRevenue';
import CenterStats from './pages/dashboard/center/CenterStats';
import AdminDashboard from './pages/dashboard/AdminDashboard';

const AppInitializer = ({ children }) => {
  const dispatch = useDispatch();
  const { token, isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    if (token) {
      dispatch(fetchCurrentUser());
      initSocket(token);
    }
  }, [dispatch, token]);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchNotifications());
    }
  }, [dispatch, isAuthenticated]);

  return children;
};

const App = () => {
  return (
    <BrowserRouter>
      <AppInitializer>
        <Routes>
          {/* Auth routes (no layout) */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/payment/success" element={<ProtectedRoute><PaymentSuccess /></ProtectedRoute>} />
          <Route path="/payment/cmi-simulate" element={<CMISimulate />} />

          {/* Quiz & Exam (protected, no main layout) */}
          <Route path="/courses/:courseId/quiz/:quizId" element={<ProtectedRoute><QuizTake /></ProtectedRoute>} />
          <Route path="/courses/:courseId/exam/:examId" element={<ProtectedRoute><ExamTake /></ProtectedRoute>} />

          {/* Live session (no main layout) */}
          <Route
            path="/live/:roomId"
            element={
              <ProtectedRoute>
                <LiveSession />
              </ProtectedRoute>
            }
          />

          {/* Main layout routes */}
          <Route element={<MainLayout />}>
            <Route index element={<Home />} />
            <Route path="centers" element={<Centers />} />
            <Route path="centers/:id" element={<CenterProfile />} />
            <Route path="courses" element={<Courses />} />
            <Route path="courses/:id" element={<CoursePage />} />
            <Route path="teachers/:id" element={<TeacherProfile />} />
            <Route
              path="notifications"
              element={
                <ProtectedRoute>
                  <Notifications />
                </ProtectedRoute>
              }
            />
            <Route
              path="messages"
              element={
                <ProtectedRoute>
                  <Messages />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* Dashboard routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route
              path="student"
              element={
                <ProtectedRoute roles={['student', 'teacher', 'center_owner', 'admin']}>
                  <StudentDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="teacher"
              element={
                <ProtectedRoute roles={['teacher', 'admin']}>
                  <TeacherDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="center"
              element={
                <ProtectedRoute roles={['center_owner', 'admin']}>
                  <CenterOwnerDashboard />
                </ProtectedRoute>
              }
            />
            <Route path="center/profile" element={
              <ProtectedRoute roles={['center_owner', 'admin']}><CenterProfileEdit /></ProtectedRoute>
            } />
            <Route path="center/teachers" element={
              <ProtectedRoute roles={['center_owner', 'admin']}><CenterTeachers /></ProtectedRoute>
            } />
            <Route path="center/courses" element={
              <ProtectedRoute roles={['center_owner', 'admin']}><CenterCourses /></ProtectedRoute>
            } />
            <Route path="center/students" element={
              <ProtectedRoute roles={['center_owner', 'admin']}><CenterStudents /></ProtectedRoute>
            } />
            <Route path="center/revenue" element={
              <ProtectedRoute roles={['center_owner', 'admin']}><CenterRevenue /></ProtectedRoute>
            } />
            <Route path="center/stats" element={
              <ProtectedRoute roles={['center_owner', 'admin']}><CenterStats /></ProtectedRoute>
            } />
            <Route
              path="admin"
              element={
                <ProtectedRoute roles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
          </Route>
        </Routes>
      </AppInitializer>
    </BrowserRouter>
  );
};

export default App;
