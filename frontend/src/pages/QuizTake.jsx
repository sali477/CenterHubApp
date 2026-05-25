import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiClock, FiCheckCircle, FiXCircle, FiArrowLeft } from 'react-icons/fi';
import { quizAPI } from '../api/index';

const QuizTake = () => {
  const { courseId, quizId } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [timeLeft, setTimeLeft] = useState(null);
  const [phase, setPhase] = useState('loading');
  const [results, setResults] = useState(null);

  const handleSubmit = useCallback(async (finalAnswers) => {
    if (phase === 'results') return;
    setPhase('submitting');
    try {
      const { data } = await quizAPI.submit(quizId, finalAnswers ?? answers);
      setResults(data.data);
      setPhase('results');
    } catch {
      setPhase('taking');
      alert('Submission failed');
    }
  }, [quizId, answers, phase]);

  useEffect(() => {
    quizAPI.getOne(quizId).then(({ data }) => {
      setQuiz(data.data);
      setAnswers(new Array(data.data.questions.length).fill(null));
      setTimeLeft(data.data.timeLimit * 60);
      setPhase('taking');
    });
  }, [quizId]);

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

  if (!quiz || phase === 'loading') {
    return <div className="max-w-3xl mx-auto px-4 py-16 animate-pulse"><div className="h-64 bg-gray-200 rounded-xl" /></div>;
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
            {results.passed ? 'Quiz Passed!' : 'Quiz Not Passed'}
          </h1>
          <p className="text-4xl font-bold text-primary-600 my-4">{results.score}%</p>
          <p className="text-gray-500 mb-6">
            {results.correct}/{results.total} correct • Pass: {results.passingScore}%
          </p>

          <div className="text-left space-y-4 mb-6">
            {results.results?.map((r, i) => (
              <div key={i} className={`p-4 rounded-lg ${r.isCorrect ? 'bg-green-50' : 'bg-red-50'}`}>
                <p className="font-medium text-sm">{r.question}</p>
                <p className="text-sm mt-1">
                  Your answer: {r.options?.[r.yourAnswer] ?? r.yourAnswer}
                  {!r.isCorrect && (
                    <span className="text-green-700 ml-2">
                      Correct: {r.options?.[r.correctAnswer] ?? r.correctAnswer}
                    </span>
                  )}
                </p>
                {r.explanation && <p className="text-xs text-gray-500 mt-1">{r.explanation}</p>}
              </div>
            ))}
          </div>

          <button onClick={() => navigate(`/courses/${courseId}`)} className="btn-primary">
            Back to Course
          </button>
        </motion.div>
      </div>
    );
  }

  const question = quiz.questions[currentQ];

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => navigate(`/courses/${courseId}`)} className="flex items-center gap-2 text-gray-500 hover:text-gray-700">
          <FiArrowLeft /> Back
        </button>
        <div className={`flex items-center gap-2 font-mono font-bold ${timeLeft < 60 ? 'text-red-600' : 'text-gray-700'}`}>
          <FiClock />
          {formatTime(timeLeft)}
        </div>
      </div>

      <div className="card p-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-bold">{quiz.title}</h1>
          <span className="text-sm text-gray-500">
            Question {currentQ + 1}/{quiz.questions.length}
          </span>
        </div>

        <div className="h-1.5 bg-gray-200 rounded-full mb-6">
          <div
            className="h-full bg-primary-600 rounded-full transition-all"
            style={{ width: `${((currentQ + 1) / quiz.questions.length) * 100}%` }}
          />
        </div>

        <motion.div key={currentQ} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
          <h2 className="text-lg font-medium mb-4">{question.question}</h2>
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
                <span className="font-medium mr-2">{String.fromCharCode(65 + i)}.</span>
                {option}
              </button>
            ))}
          </div>
        </motion.div>

        <div className="flex justify-between mt-8">
          <button
            onClick={() => setCurrentQ((q) => Math.max(0, q - 1))}
            disabled={currentQ === 0}
            className="btn-secondary disabled:opacity-50"
          >
            Previous
          </button>

          {currentQ < quiz.questions.length - 1 ? (
            <button
              onClick={() => setCurrentQ((q) => q + 1)}
              disabled={answers[currentQ] === null}
              className="btn-primary disabled:opacity-50"
            >
              Next
            </button>
          ) : (
            <button
              onClick={() => handleSubmit()}
              disabled={answers.some((a) => a === null) || phase === 'submitting'}
              className="btn-primary disabled:opacity-50"
            >
              {phase === 'submitting' ? 'Submitting...' : 'Submit Quiz'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizTake;
