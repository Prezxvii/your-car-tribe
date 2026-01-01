import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldAlert, MessageSquare, Search, Trash2, BarChart3,
  ShieldCheck, X, Edit3, LogOut, Package, HelpCircle,
  Check, Eye, EyeOff, Ban, UserX
} from 'lucide-react';
import axios from 'axios';
import '../../styles/Admin.css';
import { API_BASE_URL } from '../../config/api';

const ModerationDashboard = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [currentView, setCurrentView] = useState('overview');
  const [searchQuery, setSearchQuery] = useState("");

  // ✅ MOBILE MENU
  const [menuOpen, setMenuOpen] = useState(false);

  // Data states
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [replies, setReplies] = useState([]);
  const [listings, setListings] = useState([]);
  const [faqs, setFAQs] = useState([]);
  const [stats, setStats] = useState({});

  // Modal states
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedFAQ, setSelectedFAQ] = useState(null);

  const token = localStorage.getItem('token');

  const authHeaders = useMemo(() => ({
    headers: { Authorization: `Bearer ${token}` }
  }), [token]);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setMenuOpen(false);
  }, []);

  // ✅ Close drawer when view changes (nice on mobile)
  const safeSetView = useCallback((view) => {
    setCurrentView(view);
    setMenuOpen(false);
  }, []);

  // ✅ ESC closes drawer + modal
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        setMenuOpen(false);
        setSelectedUser(null);
        setSelectedFAQ(null);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  // ✅ Lock body scroll when drawer open
  useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [menuOpen]);

  // Fetch all data
  const fetchAllData = useCallback(async () => {
    try {
      const [usersRes, postsRes, repliesRes, listingsRes, faqsRes, statsRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/admin/users`, authHeaders),
        axios.get(`${API_BASE_URL}/api/admin/posts`, authHeaders),
        axios.get(`${API_BASE_URL}/api/admin/replies`, authHeaders),
        axios.get(`${API_BASE_URL}/api/admin/listings`, authHeaders),
        axios.get(`${API_BASE_URL}/api/admin/faqs`, authHeaders),
        axios.get(`${API_BASE_URL}/api/admin/stats`, authHeaders)
      ]);

      setUsers(usersRes.data);
      setPosts(postsRes.data);
      setReplies(repliesRes.data);
      setListings(listingsRes.data);
      setFAQs(faqsRes.data);
      setStats(statsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      if (error.response?.status === 401) {
        handleLogout();
      }
    }
  }, [authHeaders, handleLogout]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchAllData();
    }
  }, [isAuthenticated, currentView, fetchAllData]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await axios.post(`${API_BASE_URL}/api/auth/login`, loginData);

      if (data.role === 'admin') {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data));
        setIsAuthenticated(true);
      } else {
        alert("Access Denied: Admins Only");
      }
    } catch (err) {
      alert(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  // User actions
  const handleBanUser = async (userId, banned) => {
    try {
      const reason = banned ? prompt("Ban reason:") : null;
      await axios.put(
        `${API_BASE_URL}/api/admin/users/${userId}/ban`,
        { banned, banReason: reason },
        authHeaders
      );
      fetchAllData();
      setSelectedUser(null);
    } catch (error) {
      alert('Error updating ban status');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Delete this user and all their content?')) return;
    try {
      await axios.delete(`${API_BASE_URL}/api/admin/users/${userId}`, authHeaders);
      fetchAllData();
      setSelectedUser(null);
    } catch (error) {
      alert('Error deleting user');
    }
  };

  // Post actions
  const handleDeletePost = async (postId) => {
    if (!window.confirm('Delete this post?')) return;
    try {
      await axios.delete(`${API_BASE_URL}/api/admin/posts/${postId}`, authHeaders);
      fetchAllData();
    } catch (error) {
      alert('Error deleting post');
    }
  };

  // Reply actions
  const handleDeleteReply = async (replyId) => {
    if (!window.confirm('Delete this reply?')) return;
    try {
      await axios.delete(`${API_BASE_URL}/api/admin/replies/${replyId}`, authHeaders);
      fetchAllData();
    } catch (error) {
      alert('Error deleting reply');
    }
  };

  // Listing actions
  const handleDeleteListing = async (listingId) => {
    if (!window.confirm('Delete this listing?')) return;
    try {
      await axios.delete(`${API_BASE_URL}/api/admin/listings/${listingId}`, authHeaders);
      fetchAllData();
    } catch (error) {
      alert('Error deleting listing');
    }
  };

  const handleUpdateListingStatus = async (listingId, status) => {
    try {
      await axios.put(
        `${API_BASE_URL}/api/admin/listings/${listingId}/status`,
        { status },
        authHeaders
      );
      fetchAllData();
    } catch (error) {
      alert('Error updating listing');
    }
  };

  // FAQ actions
  const handleAnswerFAQ = async (faqId, answer, category) => {
    try {
      await axios.put(
        `${API_BASE_URL}/api/admin/faqs/${faqId}/answer`,
        { answer, category },
        authHeaders
      );
      fetchAllData();
      setSelectedFAQ(null);
    } catch (error) {
      alert('Error answering question');
    }
  };

  const handlePublishFAQ = async (faqId, published) => {
    try {
      await axios.put(
        `${API_BASE_URL}/api/admin/faqs/${faqId}/publish`,
        { published },
        authHeaders
      );
      fetchAllData();
    } catch (error) {
      alert('Error publishing FAQ');
    }
  };

  const handleDeleteFAQ = async (faqId) => {
    if (!window.confirm('Delete this FAQ?')) return;
    try {
      await axios.delete(`${API_BASE_URL}/api/admin/faqs/${faqId}`, authHeaders);
      fetchAllData();
    } catch (error) {
      alert('Error deleting FAQ');
    }
  };

  // Filtering
  const filteredData = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return {
      users: users.filter(u =>
        u.username?.toLowerCase().includes(query) ||
        u.email?.toLowerCase().includes(query)
      ),
      posts: posts.filter(p =>
        p.title?.toLowerCase().includes(query) ||
        p.description?.toLowerCase().includes(query)
      ),
      replies: replies.filter(r =>
        r.text?.toLowerCase().includes(query)
      ),
      listings: listings.filter(l =>
        l.make?.toLowerCase().includes(query) ||
        l.model?.toLowerCase().includes(query)
      ),
      faqs: faqs.filter(f =>
        f.question?.toLowerCase().includes(query) ||
        f.answer?.toLowerCase().includes(query)
      )
    };
  }, [searchQuery, users, posts, replies, listings, faqs]);

  if (!isAuthenticated) {
    return (
      <div className="admin-login-overlay">
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="admin-login-card"
          onSubmit={handleLogin}
        >
          <ShieldAlert size={40} className="text-red" />
          <h2>Tribe Admin Portal</h2>
          <p>Restricted Access. Please login.</p>
          <input
            type="email"
            placeholder="Admin Email"
            required
            value={loginData.email}
            onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
          />
          <input
            type="password"
            placeholder="Password"
            required
            value={loginData.password}
            onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
          />
          <button type="submit" disabled={loading}>
            {loading ? "Verifying..." : "Unlock Dashboard"}
          </button>
        </motion.form>
      </div>
    );
  }

  return (
    <div className="admin-container">
      {/* ✅ BACKDROP (mobile only via CSS) */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="admin-mobile-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      <aside className={`admin-sidebar ${menuOpen ? 'open' : ''}`}>
        <div className="admin-logo">
          <ShieldAlert className="text-red" />
          <span>TRIBE MOD</span>
        </div>

        <nav className="admin-nav">
          <p className="nav-label">Main</p>
          <button
            className={`nav-item ${currentView === 'overview' ? 'active' : ''}`}
            onClick={() => safeSetView('overview')}
          >
            <BarChart3 size={18} /> Overview
          </button>

          <p className="nav-label">Management</p>
          <button
            className={`nav-item ${currentView === 'users' ? 'active' : ''}`}
            onClick={() => safeSetView('users')}
          >
            <ShieldCheck size={18} /> Users ({users.length})
          </button>

          <button
            className={`nav-item ${currentView === 'posts' ? 'active' : ''}`}
            onClick={() => safeSetView('posts')}
          >
            <MessageSquare size={18} /> Forum Posts ({posts.length})
          </button>

          <button
            className={`nav-item ${currentView === 'replies' ? 'active' : ''}`}
            onClick={() => safeSetView('replies')}
          >
            <MessageSquare size={18} /> Replies ({replies.length})
          </button>

          <button
            className={`nav-item ${currentView === 'listings' ? 'active' : ''}`}
            onClick={() => safeSetView('listings')}
          >
            <Package size={18} /> Listings ({listings.length})
          </button>

          <button
            className={`nav-item ${currentView === 'faqs' ? 'active' : ''}`}
            onClick={() => safeSetView('faqs')}
          >
            <HelpCircle size={18} /> FAQs ({stats.unansweredQuestions || 0} new)
          </button>

          <button className="nav-item logout" onClick={handleLogout}>
            <LogOut size={18} /> Logout
          </button>
        </nav>
      </aside>

      <main className="admin-main">
        <header className="admin-header">
          {/* ✅ Mobile menu button (hidden on desktop by CSS) */}
          <button
            type="button"
            className="admin-mobile-menu-btn"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
          >
            <ShieldAlert size={18} />
            <span>Menu</span>
          </button>

          <h1>{currentView.toUpperCase()}</h1>

          <div className="admin-search">
            <Search size={18} />
            <input
              placeholder="Search records..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </header>

        <div className="view-container">
          {/* OVERVIEW */}
          {currentView === 'overview' && (
            <div className="overview-grid">
              <div className="stat-card-lg">
                <h4>Total Users</h4>
                <h2>{stats.totalUsers || 0}</h2>
              </div>
              <div className="stat-card-lg">
                <h4>Forum Posts</h4>
                <h2>{stats.totalPosts || 0}</h2>
              </div>
              <div className="stat-card-lg">
                <h4>Listings</h4>
                <h2>{stats.totalListings || 0}</h2>
              </div>
              <div className="stat-card-lg">
                <h4>Unanswered Questions</h4>
                <h2>{stats.unansweredQuestions || 0}</h2>
              </div>
              <div className="stat-card-lg status-live">
                <div className="pulse-icon" />
                <h4>Database Connected</h4>
              </div>
            </div>
          )}

          {/* USERS */}
          {currentView === 'users' && (
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.users.map(user => (
                    <tr key={user._id}>
                      <td>@{user.username}</td>
                      <td>{user.email}</td>
                      <td>
                        <span className={`role-badge ${user.role}`}>
                          {user.role}
                        </span>
                      </td>
                      <td>
                        {user.banned ? (
                          <span className="status-tag flagged">Banned</span>
                        ) : (
                          <span className="status-tag">Active</span>
                        )}
                      </td>
                      <td>
                        <button
                          className="btn-edit-sm"
                          onClick={() => setSelectedUser(user)}
                        >
                          <Edit3 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* POSTS */}
          {currentView === 'posts' && (
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Author</th>
                    <th>Tribe</th>
                    <th>Votes</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.posts.map(post => (
                    <tr key={post._id}>
                      <td>{post.title}</td>
                      <td>@{post.author?.username}</td>
                      <td><span className="type-tag">{post.tribe}</span></td>
                      <td>{post.voteCount}</td>
                      <td>{new Date(post.createdAt).toLocaleDateString()}</td>
                      <td>
                        <button
                          className="btn-delete-sm"
                          onClick={() => handleDeletePost(post._id)}
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* REPLIES */}
          {currentView === 'replies' && (
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Reply</th>
                    <th>Author</th>
                    <th>Post</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.replies.map(reply => (
                    <tr key={reply._id} className={reply.flagged ? 'row-selected' : ''}>
                      <td>{reply.text.substring(0, 50)}...</td>
                      <td>@{reply.author?.username}</td>
                      <td>{reply.post?.title?.substring(0, 30)}...</td>
                      <td>{new Date(reply.createdAt).toLocaleDateString()}</td>
                      <td>
                        <button
                          className="btn-delete-sm"
                          onClick={() => handleDeleteReply(reply._id)}
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* LISTINGS */}
          {currentView === 'listings' && (
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Vehicle</th>
                    <th>Seller</th>
                    <th>Price</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.listings.map(listing => (
                    <tr key={listing._id}>
                      <td>{listing.year} {listing.make} {listing.model}</td>
                      <td>@{listing.seller?.username || 'Unknown'}</td>
                      <td>${listing.price?.toLocaleString()}</td>
                      <td>
                        <select
                          value={listing.status}
                          onChange={(e) => handleUpdateListingStatus(listing._id, e.target.value)}
                          className="status-select"
                        >
                          <option value="pending">Pending</option>
                          <option value="active">Active</option>
                          <option value="sold">Sold</option>
                          <option value="rejected">Rejected</option>
                        </select>
                      </td>
                      <td>
                        <button
                          className="btn-delete-sm"
                          onClick={() => handleDeleteListing(listing._id)}
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* FAQs */}
          {currentView === 'faqs' && (
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Question</th>
                    <th>Asked By</th>
                    <th>Status</th>
                    <th>Published</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.faqs.map(faq => (
                    <tr key={faq._id}>
                      <td>{faq.question}</td>
                      <td>{faq.askedBy?.username || faq.email || 'Anonymous'}</td>
                      <td>
                        {faq.answered ? (
                          <span className="status-tag">Answered</span>
                        ) : (
                          <span className="status-tag pending">Pending</span>
                        )}
                      </td>
                      <td>
                        <button
                          className={`btn-${faq.published ? 'approve' : 'secondary'}-sm`}
                          onClick={() => handlePublishFAQ(faq._id, !faq.published)}
                        >
                          {faq.published ? <Eye size={14} /> : <EyeOff size={14} />}
                        </button>
                      </td>
                      <td>
                        <button className="btn-edit-sm" onClick={() => setSelectedFAQ(faq)}>
                          <Edit3 size={14} />
                        </button>
                        <button className="btn-delete-sm" onClick={() => handleDeleteFAQ(faq._id)}>
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* USER EDIT MODAL */}
      <AnimatePresence>
        {selectedUser && (
          <div className="admin-modal-overlay" onClick={() => setSelectedUser(null)}>
            <motion.div
              className="admin-edit-modal"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header-admin">
                <h3>Edit User: @{selectedUser.username}</h3>
                <button onClick={() => setSelectedUser(null)}>
                  <X size={20} />
                </button>
              </div>

              <div className="user-actions-panel">
                {selectedUser.banned ? (
                  <button className="btn-approve" onClick={() => handleBanUser(selectedUser._id, false)}>
                    <Check size={16} /> Unban User
                  </button>
                ) : (
                  <button className="btn-warning" onClick={() => handleBanUser(selectedUser._id, true)}>
                    <Ban size={16} /> Ban User
                  </button>
                )}

                <button className="btn-delete" onClick={() => handleDeleteUser(selectedUser._id)}>
                  <UserX size={16} /> Delete User
                </button>
              </div>

              <div className="user-info">
                <p><strong>Email:</strong> {selectedUser.email}</p>
                <p><strong>Role:</strong> {selectedUser.role}</p>
                <p><strong>Joined:</strong> {new Date(selectedUser.createdAt).toLocaleDateString()}</p>
                {selectedUser.banned && (
                  <p><strong>Ban Reason:</strong> {selectedUser.banReason}</p>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* FAQ ANSWER MODAL */}
      <AnimatePresence>
        {selectedFAQ && (
          <div className="admin-modal-overlay" onClick={() => setSelectedFAQ(null)}>
            <motion.div
              className="admin-edit-modal"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header-admin">
                <h3>Answer Question</h3>
                <button onClick={() => setSelectedFAQ(null)}>
                  <X size={20} />
                </button>
              </div>

              <div className="faq-form">
                <div className="form-group">
                  <label>Question</label>
                  <p className="question-text">{selectedFAQ.question}</p>
                </div>

                <div className="form-group">
                  <label>Category</label>
                  <select defaultValue={selectedFAQ.category} id="faq-category">
                    <option value="Account">Account</option>
                    <option value="Marketplace">Marketplace</option>
                    <option value="Forum">Forum</option>
                    <option value="Technical">Technical</option>
                    <option value="Safety">Safety</option>
                    <option value="General">General</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Answer</label>
                  <textarea
                    id="faq-answer"
                    defaultValue={selectedFAQ.answer}
                    rows="6"
                    placeholder="Provide a helpful answer..."
                  />
                </div>

                <button
                  className="btn-save-admin"
                  onClick={() => {
                    const answer = document.getElementById('faq-answer').value;
                    const category = document.getElementById('faq-category').value;
                    handleAnswerFAQ(selectedFAQ._id, answer, category);
                  }}
                >
                  <Check size={16} /> Save Answer
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ModerationDashboard;

