import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PlusCircle, X, ThumbsUp, MessageSquare, Send, Loader2, Flame, Clock, CheckCircle 
} from 'lucide-react';
import axios from 'axios';
import './Forum.css';

// --- DYNAMIC API URL ---
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const ForumPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState('All');
  const [sortBy, setSortBy] = useState('newest');
  const [activeCommentBox, setActiveCommentBox] = useState(null);
  const [commentText, setCommentText] = useState("");
  const [adminAnswerText, setAdminAnswerText] = useState({});
  const [forumData, setForumData] = useState([]);
  const [replies, setReplies] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [user, setUser] = useState(null);
  
  const [newQuestion, setNewQuestion] = useState({
    title: '', description: '', tribe: 'All', category: 'Discussion'
  });

  // Load user on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { headers: { 'Authorization': `Bearer ${token}` } } : null;
  };

  const fetchReplies = async (postId) => {
    try {
      // UPDATED: Now uses API_BASE_URL
      const { data } = await axios.get(`${API_BASE_URL}/api/forum/posts/${postId}/replies`);
      setReplies(prev => ({ ...prev, [postId]: data }));
    } catch (error) {
      console.error('Error fetching replies:', error);
    }
  };

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      // UPDATED: Now uses API_BASE_URL
      const { data } = await axios.get(`${API_BASE_URL}/api/forum/posts`, {
        params: { 
          category: activeFilter !== 'All' ? activeFilter : undefined,
          sort: sortBy 
        }
      });
      setForumData(data);
      // Fetch replies for each post
      data.forEach(post => fetchReplies(post._id));
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  }, [activeFilter, sortBy]); 

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]); 

  const handlePost = async (e) => {
    e.preventDefault();
    const config = getAuthHeaders();
    if (!config) return alert('Please log in.');

    try {
      setSubmitting(true);
      // UPDATED: Now uses API_BASE_URL
      const { data } = await axios.post(`${API_BASE_URL}/api/forum/posts`, newQuestion, config);
      setForumData(prev => [data, ...prev]);
      setIsModalOpen(false);
      setNewQuestion({ title: '', description: '', tribe: 'All', category: 'Discussion' });
    } catch (error) {
      alert('Error creating post');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAdminAnswer = async (postId) => {
    const config = getAuthHeaders();
    const answer = adminAnswerText[postId];
    if (!answer?.trim()) return;

    try {
      // UPDATED: Now uses API_BASE_URL
      const { data } = await axios.patch(`${API_BASE_URL}/api/forum/posts/${postId}/answer`, { answer }, config);
      setForumData(prev => prev.map(p => p._id === postId ? data : p));
      setAdminAnswerText(prev => ({ ...prev, [postId]: "" }));
    } catch (error) {
      alert('Only admins can answer FAQs');
    }
  };

  const handleVote = async (postId) => {
    const config = getAuthHeaders();
    if (!config) return alert('Log in to vote.');
    try {
      // UPDATED: Now uses API_BASE_URL
      const { data } = await axios.post(`${API_BASE_URL}/api/forum/posts/${postId}/vote`, {}, config);
      setForumData(prev => prev.map(p => p._id === postId ? { ...p, voteCount: data.voteCount, hasVoted: data.hasVoted } : p));
    } catch (error) {}
  };

  const handleAddComment = async (postId) => {
    const config = getAuthHeaders();
    if (!config || !commentText.trim()) return;
    try {
      // UPDATED: Now uses API_BASE_URL
      const { data } = await axios.post(`${API_BASE_URL}/api/forum/posts/${postId}/replies`, { text: commentText }, config);
      setReplies(prev => ({ ...prev, [postId]: [...(prev[postId] || []), data] }));
      setForumData(prev => prev.map(p => p._id === postId ? { ...p, replyCount: p.replyCount + 1 } : p));
      setCommentText("");
      setActiveCommentBox(null);
    } catch (error) {}
  };

  const getTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return "just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <div className="forum-container">
      <AnimatePresence>
        {isModalOpen && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="modal-card" initial={{ y: 50 }} animate={{ y: 0 }}>
              <div className="modal-header">
                <h3>New Community Topic</h3>
                <button onClick={() => setIsModalOpen(false)}><X /></button>
              </div>
              <form onSubmit={handlePost}>
                <div className="form-row">
                  <select value={newQuestion.tribe} onChange={e => setNewQuestion({...newQuestion, tribe: e.target.value})}>
                    {['All', 'Euro', 'JDM', 'Muscle', 'Classic'].map(t => <option key={t} value={t}>{t} Tribe</option>)}
                  </select>
                  <select value={newQuestion.category} onChange={e => setNewQuestion({...newQuestion, category: e.target.value})}>
                    {['Discussion', 'Post Question', 'Build Log', 'Tech Help', 'FAQ'].map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <input required placeholder="Subject..." value={newQuestion.title} onChange={e => setNewQuestion({...newQuestion, title: e.target.value})} />
                <textarea required placeholder="Your message..." value={newQuestion.description} onChange={e => setNewQuestion({...newQuestion, description: e.target.value})} />
                <button type="submit" className="btn-add-question" disabled={submitting}>
                  {submitting ? <Loader2 className="spinner" size={20} /> : 'Post to Community'}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <aside className="forum-sidebar">
        <button className="btn-add-question" onClick={() => user ? setIsModalOpen(true) : alert('Log in to post')}>
          <PlusCircle size={18} /> <span>New Topic</span>
        </button>

        <div className="sidebar-section">
          <p className="sidebar-label">SORT FEED</p>
          <div className="sort-toggle-group">
            <button className={`sort-tab ${sortBy === 'newest' ? 'active' : ''}`} onClick={() => setSortBy('newest')}><Clock size={14} /> Newest</button>
            <button className={`sort-tab ${sortBy === 'trending' ? 'active' : ''}`} onClick={() => setSortBy('trending')}><Flame size={14} /> Trending</button>
          </div>
        </div>

        <p className="sidebar-label">CATEGORIES</p>
        <ul className="sidebar-menu">
          {['All', 'Discussion', 'Post Question', 'Build Log', 'Tech Help', 'FAQ'].map(filter => (
            <li key={filter} className={activeFilter === filter ? 'active' : ''} onClick={() => setActiveFilter(filter)}>{filter}</li>
          ))}
        </ul>
      </aside>

      <main className="forum-main">
        {loading ? (
          <div className="forum-loading"><Loader2 className="spinner" size={40} /></div>
        ) : (
          <AnimatePresence>
            {forumData.length > 0 ? (
              forumData.map(post => (
                <motion.section key={post._id} className="question-view" layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  {/* ... (Post rendering logic remains exactly as you wrote it) */}
                  <div className="question-header">
                    <span className="question-tag">{post.tribe}</span>
                    {post.category === 'FAQ' && <span className="faq-tag">FAQ</span>}
                    {post.voteCount >= 5 && <span className="hot-tag"><Flame size={12} /> HOT</span>}
                    <span className="post-time">{getTimeAgo(post.createdAt)}</span>
                  </div>
                  <h2>{post.title}</h2>
                  <p>{post.description}</p>

                  {post.answer && (
                    <div className="admin-answer-box">
                      <div className="admin-badge"><CheckCircle size={12} /> TRIBE ADMIN ANSWER</div>
                      <p>{post.answer}</p>
                    </div>
                  )}

                  {user?.role === 'admin' && !post.answer && (
                    <div className="admin-input-section">
                      <textarea 
                        placeholder="Admin: Provide an official answer..." 
                        value={adminAnswerText[post._id] || ""}
                        onChange={(e) => setAdminAnswerText({...adminAnswerText, [post._id]: e.target.value})}
                      />
                      <button onClick={() => handleAdminAnswer(post._id)}>Submit Official Answer</button>
                    </div>
                  )}

                  <div className="post-footer">
                    <div className="post-author">
                      <div className="avatar-placeholder" />
                      <span>{post.author?.username || 'Member'}</span>
                    </div>
                    <div className="post-stats">
                      <button onClick={() => handleVote(post._id)} className={post.hasVoted ? 'voted' : ''}>
                        <ThumbsUp size={18} /> {post.voteCount || 0}
                      </button>
                      <button onClick={() => setActiveCommentBox(activeCommentBox === post._id ? null : post._id)}>
                        <MessageSquare size={18} /> {post.replyCount || 0}
                      </button>
                    </div>
                  </div>

                  <div className="comment-section">
                    {activeCommentBox === post._id && (
                      <div className="comment-input-area">
                        <input 
                          autoFocus 
                          placeholder="Write a reply..." 
                          value={commentText} 
                          onChange={e => setCommentText(e.target.value)} 
                          onKeyDown={e => e.key === 'Enter' && handleAddComment(post._id)} 
                        />
                        <button onClick={() => handleAddComment(post._id)}><Send size={16} /></button>
                      </div>
                    )}
                    {replies[post._id]?.map(reply => (
                      <div key={reply._id} className="reply-item">
                        <div className="reply-meta"><b>{reply.author?.username}</b> • {getTimeAgo(reply.createdAt)}</div>
                        <p>{reply.text}</p>
                      </div>
                    ))}
                  </div>
                </motion.section>
              ))
            ) : (
              <div className="no-posts-placeholder">
                <MessageSquare size={48} strokeWidth={1} />
                <p>No topics found in this category. Start the conversation!</p>
              </div>
            )}
          </AnimatePresence>
        )}
      </main>
    </div>
  );
};

export default ForumPage;