import { useEffect, useRef, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  FiMic, FiMicOff, FiVideo, FiVideoOff, FiPhoneOff,
  FiMonitor, FiMessageSquare, FiUsers,
} from 'react-icons/fi';
import { initSocket, getSocket } from '../utils/socket';
import { liveSessionAPI } from '../api/index';
import { getInitials } from '../utils/helpers';

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
};

const LiveSession = () => {
  const { roomId } = useParams();
  const { user, token } = useSelector((state) => state.auth);
  const localVideoRef = useRef(null);
  const localStreamRef = useRef(null);
  const screenStreamRef = useRef(null);
  const peersRef = useRef(new Map());
  const socketRef = useRef(null);

  const [session, setSession] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [remoteStreams, setRemoteStreams] = useState([]);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isSharingScreen, setIsSharingScreen] = useState(false);
  const [connected, setConnected] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');

  const myId = user?._id?.toString();

  const createPeerConnection = useCallback((peerId) => {
    const pc = new RTCPeerConnection(ICE_SERVERS);

    localStreamRef.current?.getTracks().forEach((track) => {
      pc.addTrack(track, localStreamRef.current);
    });

    pc.ontrack = (event) => {
      setRemoteStreams((prev) => {
        const exists = prev.find((s) => s.peerId === peerId);
        if (exists) {
          return prev.map((s) =>
            s.peerId === peerId ? { ...s, stream: event.streams[0] } : s
          );
        }
        return [...prev, { peerId, stream: event.streams[0], name: peerId }];
      });
    };

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socketRef.current?.emit('webrtc_ice_candidate', {
          candidate: event.candidate,
          targetUserId: peerId,
          roomId,
        });
      }
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'failed' || pc.connectionState === 'disconnected') {
        pc.close();
        peersRef.current.delete(peerId);
        setRemoteStreams((prev) => prev.filter((s) => s.peerId !== peerId));
      }
    };

    peersRef.current.set(peerId, pc);
    return pc;
  }, [roomId]);

  const initiateCall = useCallback(async (peerId) => {
    if (peersRef.current.has(peerId) || peerId === myId) return;

    const pc = createPeerConnection(peerId);
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    socketRef.current?.emit('webrtc_offer', {
      roomId,
      offer,
      targetUserId: peerId,
    });
  }, [createPeerConnection, myId, roomId]);

  useEffect(() => {
    const socket = initSocket(token);
    socketRef.current = socket;

    const setup = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        localStreamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        socket.emit('join_room', roomId);
        setConnected(true);
      } catch (err) {
        console.error('Media access failed:', err);
      }
    };

    setup();

    socket.on('room_peers', (peers) => {
      setParticipants(peers);
      peers.forEach((peer) => initiateCall(peer.userId));
    });

    socket.on('user_joined', (peer) => {
      setParticipants((prev) => {
        if (prev.find((p) => p.userId === peer.userId)) return prev;
        return [...prev, peer];
      });
      initiateCall(peer.userId);
    });

    socket.on('user_left', ({ userId }) => {
      setParticipants((prev) => prev.filter((p) => p.userId !== userId));
      peersRef.current.get(userId)?.close();
      peersRef.current.delete(userId);
      setRemoteStreams((prev) => prev.filter((s) => s.peerId !== userId));
    });

    socket.on('webrtc_offer', async ({ offer, from, name }) => {
      if (from === myId) return;

      let pc = peersRef.current.get(from);
      if (!pc) {
        pc = createPeerConnection(from);
        setRemoteStreams((prev) => {
          if (prev.find((s) => s.peerId === from)) return prev;
          return [...prev, { peerId: from, stream: null, name: name || from }];
        });
      }

      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      socket.emit('webrtc_answer', { roomId, answer, targetUserId: from });
    });

    socket.on('webrtc_answer', async ({ answer, from }) => {
      const pc = peersRef.current.get(from);
      if (pc) await pc.setRemoteDescription(new RTCSessionDescription(answer));
    });

    socket.on('webrtc_ice_candidate', async ({ candidate, from }) => {
      const pc = peersRef.current.get(from);
      if (pc && candidate) {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      }
    });

    socket.on('live_chat', (msg) => {
      setChatMessages((prev) => [...prev, msg]);
    });

    liveSessionAPI.getAll().then(({ data }) => {
      const found = data.data.find((s) => s.roomId === roomId);
      setSession(found);
    });

    return () => {
      localStreamRef.current?.getTracks().forEach((t) => t.stop());
      screenStreamRef.current?.getTracks().forEach((t) => t.stop());
      peersRef.current.forEach((pc) => pc.close());
      peersRef.current.clear();
      socket.emit('leave_room', roomId);
      socket.off('room_peers');
      socket.off('user_joined');
      socket.off('user_left');
      socket.off('webrtc_offer');
      socket.off('webrtc_answer');
      socket.off('webrtc_ice_candidate');
      socket.off('live_chat');
    };
  }, [roomId, token, myId, createPeerConnection, initiateCall]);

  const toggleMute = () => {
    localStreamRef.current?.getAudioTracks().forEach((t) => {
      t.enabled = isMuted;
    });
    setIsMuted(!isMuted);
  };

  const toggleVideo = () => {
    localStreamRef.current?.getVideoTracks().forEach((t) => {
      t.enabled = isVideoOff;
    });
    setIsVideoOff(!isVideoOff);
  };

  const toggleScreenShare = async () => {
    if (isSharingScreen) {
      screenStreamRef.current?.getTracks().forEach((t) => t.stop());
      screenStreamRef.current = null;

      const camTrack = localStreamRef.current?.getVideoTracks()[0];
      if (camTrack && localVideoRef.current) {
        localVideoRef.current.srcObject = localStreamRef.current;
      }

      peersRef.current.forEach((pc) => {
        const sender = pc.getSenders().find((s) => s.track?.kind === 'video');
        if (sender && camTrack) sender.replaceTrack(camTrack);
      });

      socketRef.current?.emit('screen_share_stopped', { roomId });
      setIsSharingScreen(false);
    } else {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        screenStreamRef.current = screenStream;
        const screenTrack = screenStream.getVideoTracks()[0];

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = screenStream;
        }

        peersRef.current.forEach((pc) => {
          const sender = pc.getSenders().find((s) => s.track?.kind === 'video');
          if (sender) sender.replaceTrack(screenTrack);
        });

        screenTrack.onended = () => toggleScreenShare();
        socketRef.current?.emit('screen_share_started', { roomId });
        setIsSharingScreen(true);
      } catch {
        /* user cancelled */
      }
    }
  };

  const sendChat = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    getSocket()?.emit('live_chat', { roomId, message: chatInput.trim() });
    setChatInput('');
  };

  const leaveSession = () => {
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    peersRef.current.forEach((pc) => pc.close());
    window.location.href = '/';
  };

  const totalParticipants = participants.length + 1;

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 bg-gray-800 border-b border-gray-700">
        <div>
          <h1 className="font-bold">{session?.title || 'Live Session'}</h1>
          <p className="text-gray-400 text-xs flex items-center gap-1">
            <FiUsers className="w-3 h-3" /> {totalParticipants} participant{totalParticipants !== 1 ? 's' : ''}
          </p>
        </div>
        <span className={`text-xs px-2 py-1 rounded-full ${connected ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
          {connected ? 'Live' : 'Connecting...'}
        </span>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 p-4 overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div className="relative aspect-video bg-gray-800 rounded-xl overflow-hidden ring-2 ring-primary-500">
              <video ref={localVideoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
              <span className="absolute bottom-2 left-2 text-xs bg-black/60 px-2 py-1 rounded">
                You {isSharingScreen && '(sharing)'}
              </span>
            </div>

            {remoteStreams.map(({ peerId, stream, name }) => (
              <div key={peerId} className="relative aspect-video bg-gray-800 rounded-xl overflow-hidden">
                {stream ? (
                  <video
                    autoPlay
                    playsInline
                    ref={(el) => { if (el && stream) el.srcObject = stream; }}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-primary-600 flex items-center justify-center text-xl font-bold">
                      {getInitials(name)}
                    </div>
                  </div>
                )}
                <span className="absolute bottom-2 left-2 text-xs bg-black/60 px-2 py-1 rounded">
                  {name || 'Participant'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {chatOpen && (
          <div className="w-72 bg-gray-800 border-l border-gray-700 flex flex-col">
            <div className="p-3 border-b border-gray-700 font-medium text-sm">Live Chat</div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {chatMessages.map((msg, i) => (
                <div key={i} className={`text-sm ${msg.userId === myId ? 'text-primary-300' : ''}`}>
                  <span className="font-medium text-xs text-gray-400">{msg.name}: </span>
                  {msg.message}
                </div>
              ))}
            </div>
            <form onSubmit={sendChat} className="p-2 border-t border-gray-700 flex gap-1">
              <input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                className="flex-1 bg-gray-700 rounded px-2 py-1.5 text-sm outline-none"
                placeholder="Message..."
              />
              <button type="submit" className="px-3 bg-primary-600 rounded text-sm">Send</button>
            </form>
          </div>
        )}
      </div>

      <div className="flex items-center justify-center gap-3 py-4 bg-gray-800 border-t border-gray-700">
        <button onClick={toggleMute} className={`p-3 rounded-full ${isMuted ? 'bg-red-600' : 'bg-gray-700 hover:bg-gray-600'}`}>
          {isMuted ? <FiMicOff /> : <FiMic />}
        </button>
        <button onClick={toggleVideo} className={`p-3 rounded-full ${isVideoOff ? 'bg-red-600' : 'bg-gray-700 hover:bg-gray-600'}`}>
          {isVideoOff ? <FiVideoOff /> : <FiVideo />}
        </button>
        <button
          onClick={toggleScreenShare}
          className={`p-3 rounded-full ${isSharingScreen ? 'bg-primary-600' : 'bg-gray-700 hover:bg-gray-600'}`}
          title="Share screen"
        >
          <FiMonitor />
        </button>
        <button onClick={() => setChatOpen(!chatOpen)} className={`p-3 rounded-full ${chatOpen ? 'bg-primary-600' : 'bg-gray-700 hover:bg-gray-600'}`}>
          <FiMessageSquare />
        </button>
        <button onClick={leaveSession} className="p-3 rounded-full bg-red-600 hover:bg-red-700">
          <FiPhoneOff />
        </button>
      </div>
    </div>
  );
};

export default LiveSession;
