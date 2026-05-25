import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiSend, FiMessageCircle } from 'react-icons/fi';
import { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toggleChatbot } from '../../store/slices/uiSlice';
import { aiAPI } from '../../api/index';

const Chatbot = () => {
  const dispatch = useDispatch();
  const { chatbotOpen } = useSelector((state) => state.ui);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hello! I\'m CentreHub AI assistant. How can I help you find educational centers or courses in Morocco?',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const history = messages.slice(-10).map((m) => ({
        role: m.role === 'user' ? 'user' : 'assistant',
        content: m.content,
      }));

      const { data } = await aiAPI.chatbot({ message: userMessage, history });
      setMessages((prev) => [...prev, { role: 'assistant', content: data.reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {!chatbotOpen && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          onClick={() => dispatch(toggleChatbot())}
          className="fixed bottom-6 right-6 w-14 h-14 bg-primary-600 hover:bg-primary-700 text-white rounded-full shadow-lg flex items-center justify-center z-50 transition-colors"
        >
          <FiMessageCircle className="w-6 h-6" />
        </motion.button>
      )}

      <AnimatePresence>
        {chatbotOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 w-96 max-w-[calc(100vw-3rem)] h-[500px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col z-50 overflow-hidden"
          >
            <div className="bg-primary-600 text-white px-4 py-3 flex items-center justify-between">
              <div>
                <h3 className="font-semibold">CentreHub AI</h3>
                <p className="text-xs text-primary-100">Your education assistant</p>
              </div>
              <button onClick={() => dispatch(toggleChatbot())} className="p-1 hover:bg-primary-700 rounded">
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] px-3 py-2 rounded-xl text-sm ${
                      msg.role === 'user'
                        ? 'bg-primary-600 text-white rounded-br-sm'
                        : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 px-3 py-2 rounded-xl text-sm text-gray-500">
                    Thinking...
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSend} className="p-3 border-t border-gray-100 flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask anything..."
                className="flex-1 input-field py-2 text-sm"
              />
              <button type="submit" disabled={loading} className="btn-primary px-3 py-2">
                <FiSend className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Chatbot;
