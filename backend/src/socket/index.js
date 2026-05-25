import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Message from '../models/Message.js';

const getConversationId = (userId1, userId2) => {
  const ids = [userId1.toString(), userId2.toString()].sort();
  return `${ids[0]}_${ids[1]}`;
};

const roomParticipants = new Map();

export const initializeSocket = (io) => {
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) return next(new Error('Authentication required'));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      if (!user) return next(new Error('User not found'));

      socket.user = user;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.user.name} (${socket.user._id})`);

    socket.join(`user:${socket.user._id}`);

    const getRoomPeers = (roomId) => {
      if (!roomParticipants.has(roomId)) {
        roomParticipants.set(roomId, new Map());
      }
      return roomParticipants.get(roomId);
    };

    socket.on('join_room', (roomId) => {
      socket.join(roomId);
      socket.currentRoom = roomId;

      const peers = getRoomPeers(roomId);
      const existingPeers = [...peers.values()].filter(
        (p) => p.userId !== socket.user._id.toString()
      );

      peers.set(socket.user._id.toString(), {
        userId: socket.user._id.toString(),
        name: socket.user.name,
        avatar: socket.user.avatar,
        socketId: socket.id,
      });

      socket.to(roomId).emit('user_joined', {
        userId: socket.user._id,
        name: socket.user.name,
        avatar: socket.user.avatar,
      });

      socket.emit('room_peers', existingPeers);
    });

    socket.on('leave_room', (roomId) => {
      socket.leave(roomId);
      const peers = roomParticipants.get(roomId);
      if (peers) {
        peers.delete(socket.user._id.toString());
        if (peers.size === 0) roomParticipants.delete(roomId);
      }
      socket.to(roomId).emit('user_left', {
        userId: socket.user._id,
        name: socket.user.name,
      });
    });

    // WebRTC mesh signaling — relay to specific peer
    socket.on('webrtc_offer', ({ roomId, offer, targetUserId }) => {
      io.to(`user:${targetUserId}`).emit('webrtc_offer', {
        offer,
        from: socket.user._id.toString(),
        name: socket.user.name,
        avatar: socket.user.avatar,
        roomId,
      });
    });

    socket.on('webrtc_answer', ({ roomId, answer, targetUserId }) => {
      io.to(`user:${targetUserId}`).emit('webrtc_answer', {
        answer,
        from: socket.user._id.toString(),
        roomId,
      });
    });

    socket.on('webrtc_ice_candidate', ({ candidate, targetUserId, roomId }) => {
      io.to(`user:${targetUserId}`).emit('webrtc_ice_candidate', {
        candidate,
        from: socket.user._id.toString(),
        roomId,
      });
    });

    socket.on('screen_share_started', ({ roomId }) => {
      socket.to(roomId).emit('screen_share_started', {
        userId: socket.user._id.toString(),
        name: socket.user.name,
      });
    });

    socket.on('screen_share_stopped', ({ roomId }) => {
      socket.to(roomId).emit('screen_share_stopped', {
        userId: socket.user._id.toString(),
      });
    });

    socket.on('live_chat', ({ roomId, message }) => {
      io.to(roomId).emit('live_chat', {
        userId: socket.user._id.toString(),
        name: socket.user.name,
        avatar: socket.user.avatar,
        message,
        timestamp: Date.now(),
      });
    });

    // Real-time messaging
    socket.on('send_message', async ({ receiverId, content, attachments }) => {
      const msg = await Message.create({
        sender: socket.user._id,
        receiver: receiverId,
        content,
        attachments,
        conversationId: getConversationId(socket.user._id, receiverId),
      });

      const populated = await msg.populate([
        { path: 'sender', select: 'name avatar' },
        { path: 'receiver', select: 'name avatar' },
      ]);

      io.to(`user:${receiverId}`).emit('new_message', populated);
      socket.emit('message_sent', populated);
    });

    socket.on('typing', ({ receiverId, isTyping }) => {
      io.to(`user:${receiverId}`).emit('user_typing', {
        userId: socket.user._id,
        isTyping,
      });
    });

    socket.on('disconnect', () => {
      if (socket.currentRoom) {
        const peers = roomParticipants.get(socket.currentRoom);
        if (peers) {
          peers.delete(socket.user._id.toString());
          if (peers.size === 0) roomParticipants.delete(socket.currentRoom);
        }
        socket.to(socket.currentRoom).emit('user_left', {
          userId: socket.user._id,
          name: socket.user.name,
        });
      }
      console.log(`User disconnected: ${socket.user.name}`);
    });
  });
};
