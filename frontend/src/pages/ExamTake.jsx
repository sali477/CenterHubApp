import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiClock, FiCheckCircle, FiXCircle, FiArrowLeft, FiAlertTriangle } from 'react-icons/fi';
import { examAPI } from '../api/index';

const ExamTake = () => {
  const { courseId, examId } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [timeLeft, setTimeLeft] = useState(null);
  const [phase, setPhase] = useState('intro');
  const [results, setResults] = useState(null);
  const startedAtRef = useRef(null);

  const handleSubmit = useCallback(async (finalAnswers) => {
    if (phase === 'results') return;
    setPhase('submitting');
    try {
      const { data } = await examAPI.submit(examId, {
        answers: finalAnswers ?? answers,
        startedAt: startedAtRef.current,
      });
      setResults(data.data);
      setPhase('results');
    } catch (err) {
      setPhase('taking');
      alert(err.response?.data?.message || 'Submission failed');
    }
  }, [examId, answers, phase]);

  const startExam = async () => {
    const { data } = await examAPI.start(examId);
    startedAtRef.current = data.data.startedAt;
    setTimeLeft(data.data.duration * 60);
    setPhase('taking');
  };

  useEffect(() => {
    examAPI.getOne(examId).then(({ data }) => {
      setExam(data.data);
      setAnswers(new Array(data.data.questions.length).fill(''));
    });
  }, [examId]);

  useEffect(() => {
    if (phase !== 'taking' || timeLeft === null) return;

    if (timeLeft <= 0) {
      handleSubmit(answers);
      return;
    }

    const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(timer);
  }, [phase, timeLeft, handleSubmit, answers]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (!exam) {
    return <div className="max-w-3xl mx-auto px-4 py-16 animate-pulse"><div className="h-64 bg-gray-200 rounded-xl" /></div>;
  }

  if (phase === 'intro') {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="card p-8 text-center">
          <h1 className="text-2xl font-bold mb-2">{exam.title}</h1>
          <p className="text-gray-600 mb-6">{exam.description}</p>
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-2xl font-bold">{exam.questions.length}</p>
              <p className="text-sm text-gray-500">Questions</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-2xl font-bold">{exam.duration}</p>
              <p className="text-sm text-gray-500">Minutes</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-2xl font-bold">{exam.passingScore}%</p>
              <p className="text-sm text-gray-500">To Pass</p>
            </div>
          </div>
          <div className="bg-yellow-50 text-yellow-800 p-4 rounded-lg text-sm mb-6 flex items-start gap-2">
            <FiAlertTriangle className="flex-shrink-0 mt-0.5" />
            Timer starts immediately. Do not refresh or leave the page.
          </div>
          <button onClick={startExam} className="btn-primary px-8">Start Exam</button>
        </div>
      </div>
    );
  }

  if (phase === 'results' && results) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card p-8 text-center">
          {results.passed ? (
            <FiCheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          ) : (
            <FiXCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          )}
          <h1 className="text-2xl font-bold mb-2">
            {results.passed ? 'Exam Passed!' : 'Exam Not Passed'}
          </h1>
          <p className="text-4xl font-bold text-primary-600 my-4">{results.score}%</p>
          <p className="text-gray-500 mb-6">
            {results.earnedPoints}/{results.totalPoints} points • Pass: {results.passingScore}%
          </p>
          <button onClick={() => navigate(`/courses/${courseId}`)} className="btn-primary">
            Back to Course
          </button>
        </motion.div>
      </div>
    );
  }

  const question = exam.questions[currentQ];

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="sticky top-0 bg-gray-50/95 backdrop-blur py-3 mb-4 flex items-center justify-between z-10">
        <span className="font-medium">{exam.title}</span>
        <div className={`flex items-center gap-2 font-mono font-bold text-lg ${timeLeft < 120 ? 'text-red-600 animate-pulse' : ''}`}>
          <FiClock />
          {formatTime(timeLeft)}
        </div>
      </div>

      <div className="card p-6">
        <div className="flex justify-between mb-4">
          <span className="text-sm text-gray-500">Question {currentQ + 1}/{exam.questions.length}</span>
          <span className="badge bg-gray-100 capitalize">{question.type?.replace('_', ' ')}</span>
        </div>

        <motion.div key={currentQ} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
          <h2 className="text-lg font-medium mb-4">{question.question}</h2>

          {(question.type === 'multiple_choice' || question.type === 'true_false') && (
            <div className="space-y-2">
              {question.options.map((option, i) => (
                <button
                  key={i}
                  onClick={() => {
                    const next = [...answers];
                    next[currentQ] = i;
                    setAnswers(next);
                  }}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-colors ${
                    answers[currentQ] === i
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          )}

          {question.type === 'short_answer' && (
            <input
              type="text"
              value={answers[currentQ] || ''}
              onChange={(e) => {
                const next = [...answers];
                next[currentQ] = e.target.value;
                setAnswers(next);
              }}
              className="input-field"
              placeholder="Type your answer..."
            />
          )}
        </motion.div>

        <div className="flex justify-between mt-8">
          <button
            onClick={() => setCurrentQ((q) => Math.max(0, q - 1))}
            disabled={currentQ === 0}
            className="btn-secondary disabled:opacity-50"
          >
            Previous
          </button>

          {currentQ < exam.questions.length - 1 ? (
            <button onClick={() => setCurrentQ((q) => q + 1)} className="btn-primary">Next</button>
          ) : (
            <button
              onClick={() => {
                if (confirm('Submit exam? This cannot be undone.')) handleSubmit();
              }}
              disabled={phase === 'submitting'}
              className="btn-primary"
            >
              {phase === 'submitting' ? 'Submitting...' : 'Submit Exam'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExamTake;
