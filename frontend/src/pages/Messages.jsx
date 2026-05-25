import { useEffect, useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import { FiSend } from 'react-icons/fi';
import { messageAPI } from '../api/index';
import { initSocket, getSocket } from '../utils/socket';
import { getInitials } from '../utils/helpers';

const Messages = () => {
  const { user, token } = useSelector((state) => state.auth);
  const [conversations, setConversations] = useState([]);
  const [activeUser, setActiveUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messageAPI.getConversations().then(({ data }) => setConversations(data.data));

    const socket = initSocket(token);
    socket.on('new_message', (msg) => {
      if (
        activeUser &&
        (msg.sender._id === activeUser || msg.receiver._id === activeUser)
      ) {
        setMessages((prev) => [...prev, msg]);
      }
    });

    return () => socket.off('new_message');
  }, [token, activeUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const openConversation = async (userId) => {
    setActiveUser(userId);
    const { data } = await messageAPI.getMessages(userId);
    setMessages(data.data);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeUser) return;

    const socket = getSocket();
    if (socket) {
      socket.emit('send_message', {
        receiverId: activeUser,
        content: newMessage.trim(),
      });
    } else {
      await messageAPI.send({ receiverId: activeUser, content: newMessage.trim() });
      const { data } = await messageAPI.getMessages(activeUser);
      setMessages(data.data);
    }

    setNewMessage('');
  };

  const getOtherUser = (conv) => {
    const msg = conv.lastMessage;
    return msg.sender._id === user._id ? msg.receiver : msg.sender;
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="section-title mb-6">Messages</h1>
      <div className="card flex h-[600px] overflow-hidden">
        {/* Conversations list */}
        <div className="w-1/3 border-r border-gray-200 overflow-y-auto">
          {conversations.length === 0 ? (
            <p className="p-4 text-gray-500 text-sm">No conversations yet.</p>
          ) : (
            conversations.map((conv) => {
              const other = getOtherUser(conv);
              return (
                <button
                  key={conv._id}
                  onClick={() => openConversation(other._id)}
                  className={`w-full p-4 text-left hover:bg-gray-50 border-b border-gray-100 ${
                    activeUser === other._id ? 'bg-primary-50' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-medium text-sm">
                      {getInitials(other.name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{other.name}</p>
                      <p className="text-xs text-gray-500 truncate">
                        {conv.lastMessage.content}
                      </p>
                    </div>
                    {conv.unreadCount > 0 && (
                      <span className="w-5 h-5 bg-primary-600 text-white text-xs rounded-full flex items-center justify-center">
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Chat area */}
        <div className="flex-1 flex flex-col">
          {activeUser ? (
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((msg) => (
                  <div
                    key={msg._id}
                    className={`flex ${msg.sender._id === user._id ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] px-3 py-2 rounded-xl text-sm ${
                        msg.sender._id === user._id
                          ? 'bg-primary-600 text-white rounded-br-sm'
                          : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
              <form onSubmit={handleSend} className="p-3 border-t border-gray-200 flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="input-field flex-1 py-2"
                  placeholder="Type a message..."
                />
                <button type="submit" className="btn-primary px-4">
                  <FiSend />
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              Select a conversation to start messaging
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages;
