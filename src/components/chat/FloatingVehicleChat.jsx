import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, CheckCircle, ShieldAlert } from 'lucide-react';
import io from 'socket.io-client';
import axios from 'axios';
import './FloatingVehicleChat.css';
import { API_BASE_URL } from '../../config/api';

// Persistent socket — created once, outside the component so it survives re-renders
const socket = io(API_BASE_URL.replace('/api', ''), {
  autoConnect: false,
  transports: ['websocket'],
  upgrade: false
});

const FloatingVehicleChat = ({
  listing,
  currentUser,
  forcedOpen,
  setForcedOpen,
  injectedMessage,
  clearInjectedMessage
}) => {
  const isComponentControlled =
    typeof forcedOpen !== 'undefined' && typeof setForcedOpen !== 'undefined';
  const [localOpen, setLocalOpen] = useState(false);

  const isOpen = isComponentControlled ? forcedOpen : localOpen;
  const setIsOpen = isComponentControlled ? setForcedOpen : setLocalOpen;

  const [sessionId, setSessionId] = useState(null);
  const [messageText, setMessageText] = useState('');
  const [messages, setMessages] = useState([]);
  const [isTransactionComplete, setIsTransactionComplete] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Stable refs so socket handlers always read current values without re-registering
  const sessionIdRef = useRef(null);
  const isOpenRef = useRef(isOpen);
  const messagesEndRef = useRef(null);

  useEffect(() => { isOpenRef.current = isOpen; }, [isOpen]);
  useEffect(() => { sessionIdRef.current = sessionId; }, [sessionId]);

  // Clear badge when drawer opens
  useEffect(() => {
    if (isOpen) setUnreadCount(0);
  }, [isOpen]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // 🚀 FIXED DEDUPLICATOR: Tracks explicit database IDs, falls back safely to content signature matching
  const addMessage = useCallback((incoming) => {
    setMessages((prev) => {
      const isDuplicate = prev.some((m) => {
        if (incoming._id && m._id === incoming._id) return true;
        return m.sender === incoming.sender && 
               m.text === incoming.text && 
               Math.abs(new Date(m.timestamp) - new Date(incoming.timestamp)) < 1000;
      });

      if (isDuplicate) return prev;
      return [...prev, incoming];
    });
  }, []);

  // ─── Core initialisation: runs once when listing/user are ready ───────────
  useEffect(() => {
    if (!listing?._id && !listing?.id) return;
    if (!currentUser?.username) return;

    const currentListingId = listing._id || listing.id;
    const isSeller =
      currentUser.username === (listing.seller?.username || listing.dealer_name);

    if (!socket.connected) socket.connect();

    // Every user — buyer AND seller — must identify so they receive notifications
    socket.emit('identify_user', currentUser.username);

    const initBuyerSession = async () => {
      const sellerUser = listing.seller?.username || listing.dealer_name || 'Seller';
      try {
        const { data } = await axios.post(`${API_BASE_URL}/api/chat/session`, {
          listingId: currentListingId,
          buyerUsername: currentUser.username,
          sellerUsername: sellerUser
        });

        if (!data?._id) return;

        setSessionId(data._id);
        setIsTransactionComplete(data.isTransactionComplete || false);

        if (data.messages?.length > 0) {
          setMessages(data.messages);
        } else {
          setMessages([{
            _id: 'sys-1',
            sender: 'system',
            text: `Inquiry initiated for the ${listing.year || ''} ${listing.make || ''} ${listing.model || ''}. Safe trading!`,
            timestamp: new Date()
          }]);
        }

        // Buyer joins the room immediately
        socket.emit('join_chat', data._id);
      } catch (err) {
        console.error('Buyer session init failed:', err.response?.data || err.message);
      }
    };

    const initSellerSessions = async () => {
      try {
        const { data: sessions } = await axios.get(
          `${API_BASE_URL}/api/chat/session/seller/${currentUser.username}/listing/${currentListingId}`
        );

        if (sessions?.length > 0) {
          const latest = sessions[sessions.length - 1];
          setSessionId(latest._id);
          setIsTransactionComplete(latest.isTransactionComplete || false);
          setMessages(latest.messages?.length > 0 ? latest.messages : [{
            _id: 'sys-1',
            sender: 'system',
            text: `Chat thread for your ${listing.year || ''} ${listing.make || ''} ${listing.model || ''} listing.`,
            timestamp: new Date()
          }]);

          sessions.forEach((s) => socket.emit('join_chat', s._id));
        }
      } catch (err) {
        console.error('Seller session init failed:', err.response?.data || err.message);
      }
    };

    if (isSeller) {
      initSellerSessions();
    } else {
      initBuyerSession();
    }

    // ── Socket event handlers ──────────────────────────────────────────────
    const onReceiveMessage = (incomingMessage) => {
      addMessage(incomingMessage);
    };

    const onNewChatNotification = async (notification) => {
      const targetListingId = String(currentListingId);
      const notifListingId = String(notification.listingId);

      if (notifListingId !== targetListingId) return;

      const notifSessionId = String(notification.sessionId);
      if (notifSessionId !== String(sessionIdRef.current)) {
        socket.emit('join_chat', notifSessionId);

        try {
          const { data } = await axios.get(`${API_BASE_URL}/api/chat/session/${notifSessionId}`);
          if (data?._id) {
            setSessionId(data._id);
            setIsTransactionComplete(data.isTransactionComplete || false);
            setMessages(data.messages || []);
          }
        } catch (err) {
          if (notification.message) addMessage(notification.message);
        }
      } else if (notification.message) {
        addMessage(notification.message);
      }

      if (!isOpenRef.current) {
        setUnreadCount((prev) => prev + 1);
      }
    };

    socket.on('receive_message', onReceiveMessage);
    socket.on('new_chat_notification', onNewChatNotification);

    return () => {
      socket.off('receive_message', onReceiveMessage);
      socket.off('new_chat_notification', onNewChatNotification);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listing, currentUser, addMessage]);

  // ─── Injected messages from parent ───────────────────────────────────────
  useEffect(() => {
    if (!injectedMessage || !sessionId) return;

    socket.emit('send_message', {
      sessionId,
      sender: currentUser?.username || 'Buyer',
      text: injectedMessage.text
    });

    if (clearInjectedMessage) clearInjectedMessage();
  }, [injectedMessage, sessionId, currentUser, clearInjectedMessage]);

  // ─── Send handler ─────────────────────────────────────────────────────────
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!messageText.trim() || !sessionId || isTransactionComplete) return;

    socket.emit('send_message', {
      sessionId,
      sender: currentUser?.username || 'Buyer',
      text: messageText.trim()
    });

    setMessageText('');
  };

  const handleCompleteTransaction = async () => {
    if (!sessionId) return;
    if (!window.confirm('Mark transaction as fully complete? This will alert admin.')) return;

    try {
      await axios.post(`${API_BASE_URL}/api/chat/session/${sessionId}/complete`);
      setIsTransactionComplete(true);
      addMessage({ _id: `sys-complete-${Date.now()}`, sender: 'system', text: 'Transaction marked as COMPLETE by buyer.', timestamp: new Date() });
      addMessage({ _id: `sys-admin-${Date.now()}`, sender: 'admin-alert', text: 'Admin notification dispatched.', timestamp: new Date() });
    } catch (err) {
      console.error('Complete transaction error:', err);
      alert('Could not update transaction status.');
    }
  };

  const formatTimeLabel = (timestamp) => {
    if (!timestamp) return '';
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="floating-chat-container">
      <motion.button
        className="chat-trigger-bubble"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        style={{ position: 'relative' }}
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}

        {!isOpen && unreadCount > 0 && (
          <span style={{
            position: 'absolute', top: '-5px', right: '-5px',
            background: '#ff4d4f', color: 'white', borderRadius: '50%',
            padding: '2px 6px', fontSize: '11px', fontWeight: 'bold',
            border: '2px solid #ffffff'
          }}>
            {unreadCount}
          </span>
        )}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="chat-drawer-window"
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
          >
            <div className="chat-drawer-header">
  <div className="header-info">
    <h4>{listing?.make} {listing?.model}</h4>
    
    {/* 🚀 Dynamic header tracking: detects if current session belongs to seller or buyer */}
    <p>
      {currentUser?.username === (listing?.seller?.username || listing?.dealer_name)
        ? `Chat with ${messages.find(m => m.sender !== currentUser?.username && m.sender !== 'system' && m.sender !== 'admin-alert')?.sender || 'Buyer'}`
        : `Chat with ${listing?.seller?.username || listing?.dealer_name || 'Seller'}`
      }
    </p>
  </div>
  {!isTransactionComplete && (
    <button className="btn-complete-deal" onClick={handleCompleteTransaction} title="Mark Deal Complete">
      <CheckCircle size={16} />
      <span>Complete</span>
    </button>
  )}
</div>

            <div className="chat-drawer-body">
              {messages.map((msg, idx) => {
                const isSystem = msg.sender === 'system';
                const isAdmin = msg.sender === 'admin-alert';
                const isMe = msg.sender === (currentUser?.username || 'Buyer');

                if (isSystem || isAdmin) {
                  return (
                    <div key={msg._id || idx} className={`chat-msg-system ${isAdmin ? 'admin-notice' : ''}`}>
                      <div className="system-bubble">
                        {isAdmin && <ShieldAlert size={14} style={{ marginRight: '4px' }} />}
                        <span>{msg.text}</span>
                      </div>
                      <span className="msg-time">{formatTimeLabel(msg.timestamp)}</span>
                    </div>
                  );
                }

                return (
                  <div key={msg._id || idx} className={`chat-msg-row ${isMe ? 'outgoing' : 'incoming'}`}>
                    <div className="msg-bubble">
                      <span className="msg-sender-label">{msg.sender}</span>
                      <p>{msg.text}</p>
                    </div>
                    <span className="msg-time">{formatTimeLabel(msg.timestamp)}</span>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            <form className="chat-drawer-footer" onSubmit={handleSendMessage}>
              <input
                type="text"
                placeholder={isTransactionComplete ? 'Chat closed...' : 'Type a message...'}
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                disabled={isTransactionComplete}
              />
              <button type="submit" disabled={isTransactionComplete || !messageText.trim()}>
                <Send size={16} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FloatingVehicleChat;