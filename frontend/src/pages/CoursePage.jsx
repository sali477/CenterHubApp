import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import {
  FiPlay, FiFileText, FiHelpCircle, FiClipboard, FiVideo,
  FiMessageSquare, FiCheck,
} from 'react-icons/fi';
import { fetchCourse, clearCurrentCourse, enrollInCourse } from '../store/slices/courseSlice';
import { enrollmentAPI, aiAPI } from '../api/index';
import { formatPrice } from '../utils/helpers';
import PaymentCheckout from '../components/payment/PaymentCheckout';
import { Link } from 'react-router-dom';

const tabs = [
  { id: 'videos', label: 'Videos', icon: FiPlay },
  { id: 'pdfs', label: 'Lessons', icon: FiFileText },
  { id: 'quizzes', label: 'Quizzes', icon: FiHelpCircle },
  { id: 'exams', label: 'Exams', icon: FiClipboard },
  { id: 'live', label: 'Live Sessions', icon: FiVideo },
  { id: 'comments', label: 'Comments', icon: FiMessageSquare },
  { id: 'assistant', label: 'AI Assistant', icon: FiHelpCircle },
];

const CoursePage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { current: course } = useSelector((state) => state.courses);
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState('videos');
  const [enrollment, setEnrollment] = useState(null);
  const [enrolling, setEnrolling] = useState(false);
  const [aiMessage, setAiMessage] = useState('');
  const [aiReply, setAiReply] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [showPayment, setShowPayment] = useState(false);

  useEffect(() => {
    dispatch(fetchCourse(id));
    if (isAuthenticated) {
      enrollmentAPI.getByCourse(id).then(({ data }) => setEnrollment(data.data));
    }
    return () => dispatch(clearCurrentCourse());
  }, [dispatch, id, isAuthenticated]);

  const handleEnroll = async () => {
    if (!course.isFree && course.price > 0) {
      setShowPayment(true);
      return;
    }

    setEnrolling(true);
    try {
      await dispatch(enrollInCourse(id)).unwrap();
      const { data } = await enrollmentAPI.getByCourse(id);
      setEnrollment(data.data);
    } catch (err) {
      alert(err || 'Enrollment failed');
    } finally {
      setEnrolling(false);
    }
  };

  const handleProgress = async (type, itemId) => {
    if (!enrollment) return;
    const { data } = await enrollmentAPI.updateProgress(enrollment._id, { type, itemId });
    setEnrollment(data.data);
  };

  const handleAIAsk = async (e) => {
    e.preventDefault();
    if (!aiMessage.trim()) return;
    setAiLoading(true);
    try {
      const { data } = await aiAPI.assistant({
        message: aiMessage,
        courseId: id,
      });
      setAiReply(data.reply);
    } catch {
      setAiReply('Unable to get AI response. Please try again.');
    } finally {
      setAiLoading(false);
    }
  };

  if (!course) {
    return <div className="max-w-7xl mx-auto px-4 py-16 animate-pulse"><div className="h-64 bg-gray-200 rounded-xl" /></div>;
  }

  const isEnrolled = enrollment?.status === 'active' || enrollment?.status === 'completed';
  const progress = enrollment?.progress?.percentage || 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="card overflow-hidden mb-6">
            <div className="h-48 bg-gradient-to-r from-primary-500 to-primary-700 relative">
              {course.thumbnail && (
                <img src={course.thumbnail} alt="" className="w-full h-full object-cover" />
              )}
            </div>
            <div className="p-6">
              <span className="badge bg-primary-50 text-primary-700">{course.subject}</span>
              <h1 className="text-2xl font-bold mt-2">{course.title}</h1>
              <p className="text-gray-600 mt-2">{course.description}</p>
              <p className="text-sm text-gray-500 mt-2">
                By {course.teacher?.user?.name} • {course.level}
              </p>
            </div>
          </div>

          {/* Progress bar */}
          {isEnrolled && (
            <div className="card p-4 mb-6">
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium">Your Progress</span>
                <span>{progress}%</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  className="h-full bg-primary-600 rounded-full"
                />
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="flex overflow-x-auto gap-1 mb-6 border-b border-gray-200">
            {tabs.map(({ id: tabId, label, icon: Icon }) => (
              <button
                key={tabId}
                onClick={() => setActiveTab(tabId)}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === tabId
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon className="w-4 h-4" /> {label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="card p-6">
            {activeTab === 'videos' && (
              <div className="space-y-3">
                {course.videos?.map((video, i) => (
                  <div key={video._id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50">
                    <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center text-primary-600">
                      {enrollment?.progress?.completedVideos?.includes(video._id) ? (
                        <FiCheck className="text-green-600" />
                      ) : (
                        <FiPlay />
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{i + 1}. {video.title}</h4>
                      {video.duration > 0 && <p className="text-xs text-gray-500">{Math.round(video.duration / 60)} min</p>}
                    </div>
                    {isEnrolled && (
                      <button
                        onClick={() => handleProgress('video', video._id)}
                        className="text-sm text-primary-600 hover:underline"
                      >
                        Mark complete
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'pdfs' && (
              <div className="space-y-3">
                {course.pdfs?.map((pdf, i) => (
                  <a
                    key={pdf._id}
                    href={pdf.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50"
                  >
                    <FiFileText className="text-red-500 w-5 h-5" />
                    <span className="font-medium">{i + 1}. {pdf.title}</span>
                  </a>
                ))}
              </div>
            )}

            {activeTab === 'quizzes' && (
              <div className="space-y-3">
                {course.quizzes?.map((quiz) => (
                  <div key={quiz._id} className="p-4 border border-gray-200 rounded-lg flex justify-between items-center">
                    <div>
                      <h4 className="font-medium">{quiz.title}</h4>
                      <p className="text-sm text-gray-500">{quiz.questions?.length || 0} questions • {quiz.timeLimit} min</p>
                    </div>
                    {isEnrolled ? (
                      <Link to={`/courses/${id}/quiz/${quiz._id}`} className="btn-primary text-sm py-2">
                        Take Quiz
                      </Link>
                    ) : (
                      <span className="text-sm text-gray-400">Enroll to access</span>
                    )}
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'exams' && (
              <div className="space-y-3">
                {course.exams?.map((exam) => (
                  <div key={exam._id} className="p-4 border border-gray-200 rounded-lg flex justify-between items-center">
                    <div>
                      <h4 className="font-medium">{exam.title}</h4>
                      <p className="text-sm text-gray-500">{exam.duration} min • Pass: {exam.passingScore}%</p>
                    </div>
                    {isEnrolled ? (
                      <Link to={`/courses/${id}/exam/${exam._id}`} className="btn-primary text-sm py-2">
                        Take Exam
                      </Link>
                    ) : (
                      <span className="text-sm text-gray-400">Enroll to access</span>
                    )}
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'live' && (
              <div className="space-y-3">
                {course.liveSessions?.map((session) => (
                  <div key={session._id} className="p-4 border border-gray-200 rounded-lg flex justify-between items-center">
                    <div>
                      <h4 className="font-medium">{session.title}</h4>
                      <p className="text-sm text-gray-500">
                        {new Date(session.scheduledAt).toLocaleString()} • {session.status}
                      </p>
                    </div>
                    {session.status === 'live' && (
                      <a href={`/live/${session.roomId}`} className="btn-primary text-sm py-2">Join Live</a>
                    )}
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'assistant' && isEnrolled && (
              <div>
                <form onSubmit={handleAIAsk} className="space-y-3">
                  <textarea
                    value={aiMessage}
                    onChange={(e) => setAiMessage(e.target.value)}
                    className="input-field"
                    rows={3}
                    placeholder="Ask about this course content..."
                  />
                  <button type="submit" disabled={aiLoading} className="btn-primary">
                    {aiLoading ? 'Thinking...' : 'Ask AI Assistant'}
                  </button>
                </form>
                {aiReply && (
                  <div className="mt-4 p-4 bg-primary-50 rounded-lg text-sm text-gray-800 whitespace-pre-wrap">
                    {aiReply}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div>
          <div className="card p-6 sticky top-24">
            <div className="text-3xl font-bold text-primary-600 mb-4">
              {course.isFree ? 'Free' : formatPrice(course.price)}
            </div>

            {isEnrolled ? (
              <div className="bg-green-50 text-green-700 p-3 rounded-lg text-center font-medium">
                ✓ Enrolled
              </div>
            ) : isAuthenticated ? (
              <button
                onClick={handleEnroll}
                disabled={enrolling}
                className="btn-primary w-full"
              >
                {enrolling ? 'Enrolling...' : course.isFree ? 'Enroll Free' : `Enroll — ${formatPrice(course.price)}`}
              </button>
            ) : (
              <a href="/login" className="btn-primary w-full block text-center">Login to Enroll</a>
            )}

            <div className="mt-6 space-y-2 text-sm text-gray-600">
              <div className="flex justify-between"><span>Videos</span><span>{course.videos?.length || 0}</span></div>
              <div className="flex justify-between"><span>PDF Lessons</span><span>{course.pdfs?.length || 0}</span></div>
              <div className="flex justify-between"><span>Quizzes</span><span>{course.quizzes?.length || 0}</span></div>
              <div className="flex justify-between"><span>Rating</span><span>{course.rating?.toFixed(1) || 'N/A'} ★</span></div>
            </div>
          </div>
        </div>
      </div>

      {showPayment && (
        <PaymentCheckout
          course={course}
          onClose={() => setShowPayment(false)}
        />
      )}
    </div>
  );
};

export default CoursePage;
