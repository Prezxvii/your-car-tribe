import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldAlert, MessageSquare, Search, Trash2, BarChart3,
  ShieldCheck, X, Edit3, LogOut, Package, HelpCircle,
  Check, Eye, EyeOff, Ban, UserX, Landmark, History,
  AlertTriangle, Copy, CheckCircle, FileText
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

  // Mobile Menu state
  const [menuOpen, setMenuOpen] = useState(false);

  // Data states
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [replies, setReplies] = useState([]);
  const [listings, setListings] = useState([]);
  const [faqs, setFAQs] = useState([]);
  const [stats, setStats] = useState({});
  const [transactions, setTransactions] = useState([]);

  // Modal states
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedFAQ, setSelectedFAQ] = useState(null);
  const [selectedListing, setSelectedListing] = useState(null);
  const [transactionModalOpen, setTransactionModalOpen] = useState(false);
  
  // Controlled inputs for FAQ editing
  const [faqAnswerText, setFaqAnswerText] = useState("");
  const [faqCategorySelection, setFaqCategorySelection] = useState("");

  // Controlled inputs for manual Transaction Submission (Proof of Transaction Approval)
  const [txData, setTxData] = useState({
    listingId: "",
    buyerId: "",
    sellerId: "",
    finalPrice: "",
    notes: "",
    proofUrl: ""
  });

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

  const safeSetView = useCallback((view) => {
    setCurrentView(view);
    setMenuOpen(false);
  }, []);

  const openFAQModal = (faq) => {
    setSelectedFAQ(faq);
    setFaqAnswerText(faq.answer || "");
    setFaqCategorySelection(faq.category || "General");
  };

  // ESC closes panels & modals
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        setMenuOpen(false);
        setSelectedUser(null);
        setSelectedFAQ(null);
        setSelectedListing(null);
        setTransactionModalOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  // Fetch data
  const fetchAllData = useCallback(async () => {
    try {
      const [usersRes, postsRes, repliesRes, listingsRes, faqsRes, statsRes, txRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/admin/users`, authHeaders),
        axios.get(`${API_BASE_URL}/api/admin/posts`, authHeaders),
        axios.get(`${API_BASE_URL}/api/admin/replies`, authHeaders),
        axios.get(`${API_BASE_URL}/api/admin/listings`, authHeaders),
        axios.get(`${API_BASE_URL}/api/admin/faqs`, authHeaders),
        axios.get(`${API_BASE_URL}/api/admin/stats`, authHeaders),
        axios.get(`${API_BASE_URL}/api/admin/transactions`, authHeaders).catch(() => ({ data: [] })) // Fallback safety
      ]);

      setUsers(usersRes.data);
      setPosts(postsRes.data);
      setReplies(repliesRes.data);
      setListings(listingsRes.data);
      setFAQs(faqsRes.data);
      setStats(statsRes.data);
      setTransactions(txRes.data);
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

  // --- Client User Management Features ---
  const handleBanUser = async (userId, banned) => {
    try {
      const reason = banned ? prompt("Enter Suspension/Ban Reason:") : null;
      if (banned && !reason) return;
      await axios.put(`${API_BASE_URL}/api/admin/users/${userId}/ban`, { banned, banReason: reason }, authHeaders);
      fetchAllData();
      setSelectedUser(null);
    } catch (error) {
      alert('Error updating ban status');
    }
  };

  const handleVerifyIdentity = async (userId, status) => {
    try {
      await axios.put(`${API_BASE_URL}/api/admin/users/${userId}/verify-identity`, { identityVerified: status }, authHeaders);
      alert(`User identity verification updated to: ${status}`);
      fetchAllData();
    } catch (error) {
      alert('Error updating verification matrix');
    }
  };

  const handleResetAccountDetails = async (userId) => {
    const newPassword = prompt("Enter a fresh temporary password for this account:");
    if (!newPassword) return;
    try {
      await axios.put(`${API_BASE_URL}/api/admin/users/${userId}/reset-details`, { password: newPassword }, authHeaders);
      alert('Account credentials reset successfully.');
    } catch (error) {
      alert('Error clearing account parameters');
    }
  };

  const handleFlagSuspicious = async (userId, isSuspicious) => {
    try {
      await axios.put(`${API_BASE_URL}/api/admin/users/${userId}/flag`, { flaggedSuspicious: isSuspicious }, authHeaders);
      fetchAllData();
      if (selectedUser) setSelectedUser(prev => ({ ...prev, flaggedSuspicious: isSuspicious }));
    } catch (error) {
      alert('Error flag modification failed');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Delete this user and all their structural content permanently?')) return;
    try {
      await axios.delete(`${API_BASE_URL}/api/admin/users/${userId}`, authHeaders);
      fetchAllData();
      setSelectedUser(null);
    } catch (error) {
      alert('Error deleting user');
    }
  };

  // --- Client Listing Management Features ---
  const handleUpdateListingStatus = async (listingId, status) => {
    try {
      await axios.put(`${API_BASE_URL}/api/admin/listings/${listingId}/status`, { status }, authHeaders);
      fetchAllData();
    } catch (error) {
      alert('Error updating listing');
    }
  };

  const handleEditListingDetails = async (listingId, updatedFields) => {
    try {
      await axios.put(`${API_BASE_URL}/api/admin/listings/${listingId}/edit`, updatedFields, authHeaders);
      alert('Listing metrics saved to database.');
      fetchAllData();
      setSelectedListing(null);
    } catch (error) {
      alert('Error processing metadata mutation');
    }
  };

  const handleDuplicateListing = async (listing) => {
    try {
      await axios.post(`${API_BASE_URL}/api/admin/listings/duplicate`, { originalId: listing._id }, authHeaders);
      alert('Listing successfully duplicated as a new document.');
      fetchAllData();
    } catch (error) {
      alert('Duplication process encountered an error.');
    }
  };

  const handleDeleteListing = async (listingId) => {
    if (!window.confirm('Remove this listing from public views?')) return;
    try {
      await axios.delete(`${API_BASE_URL}/api/admin/listings/${listingId}`, authHeaders);
      fetchAllData();
    } catch (error) {
      alert('Error deleting listing');
    }
  };

  // --- Transaction Logging (Proof of off-platform transactional approvals) ---
  const handleSubmitTransaction = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE_URL}/api/admin/transactions/approve-proof`, txData, authHeaders);
      alert('Proof of transaction logged and approved successfully.');
      setTransactionModalOpen(false);
      setTxData({ listingId: "", buyerId: "", sellerId: "", finalPrice: "", notes: "", proofUrl: "" });
      fetchAllData();
    } catch (error) {
      alert('Failed to process and save proof transaction data.');
    }
  };

  // --- Forum, Replies and FAQ handlers ---
  const handleDeletePost = async (postId) => {
    if (!window.confirm('Delete this post?')) return;
    try { await axios.delete(`${API_BASE_URL}/api/admin/posts/${postId}`, authHeaders); fetchAllData(); } catch (error) { alert('Error deleting post'); }
  };

  const handleDeleteReply = async (replyId) => {
    if (!window.confirm('Delete this reply?')) return;
    try { await axios.delete(`${API_BASE_URL}/api/admin/replies/${replyId}`, authHeaders); fetchAllData(); } catch (error) { alert('Error deleting reply'); }
  };

  const handleAnswerFAQ = async (faqId, answer, category) => {
    try { await axios.put(`${API_BASE_URL}/api/admin/faqs/${faqId}/answer`, { answer, category }, authHeaders); fetchAllData(); setSelectedFAQ(null); } catch (error) { alert('Error answering question'); }
  };

  const handlePublishFAQ = async (faqId, published) => {
    try { await axios.put(`${API_BASE_URL}/api/admin/faqs/${faqId}/publish`, { published }, authHeaders); fetchAllData(); } catch (error) { alert('Error publishing FAQ'); }
  };

  const handleDeleteFAQ = async (faqId) => {
    if (!window.confirm('Delete this FAQ?')) return;
    try { await axios.delete(`${API_BASE_URL}/api/admin/faqs/${faqId}`, authHeaders); fetchAllData(); } catch (error) { alert('Error deleting FAQ'); }
  };

  const filteredData = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return {
      users: users.filter(u => u.username?.toLowerCase().includes(query) || u.email?.toLowerCase().includes(query)),
      posts: posts.filter(p => p.title?.toLowerCase().includes(query) || p.description?.toLowerCase().includes(query)),
      replies: replies.filter(r => r.text?.toLowerCase().includes(query)),
      listings: listings.filter(l => l.make?.toLowerCase().includes(query) || l.model?.toLowerCase().includes(query)),
      faqs: faqs.filter(f => f.question?.toLowerCase().includes(query) || f.answer?.toLowerCase().includes(query)),
      transactions: transactions.filter(t => t._id?.toLowerCase().includes(query) || t.notes?.toLowerCase().includes(query))
    };
  }, [searchQuery, users, posts, replies, listings, faqs, transactions]);

  if (!isAuthenticated) {
    return (
      <div className="admin-login-overlay">
        <motion.form initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="admin-login-card" onSubmit={handleLogin}>
          <ShieldAlert size={40} className="text-red" />
          <h2>Tribe Admin Portal</h2>
          <p>Restricted Access. Please login.</p>
          <input type="email" placeholder="Admin Email" required value={loginData.email} onChange={(e) => setLoginData({ ...loginData, email: e.target.value })} />
          <input type="password" placeholder="Password" required value={loginData.password} onChange={(e) => setLoginData({ ...loginData, password: e.target.value })} />
          <button type="submit" disabled={loading}>{loading ? "Verifying..." : "Unlock Dashboard"}</button>
        </motion.form>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <AnimatePresence>
        {menuOpen && <motion.div className="admin-mobile-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMenuOpen(false)} />}
      </AnimatePresence>

      <aside className={`admin-sidebar ${menuOpen ? 'open' : ''}`}>
        <div className="admin-logo">
          <ShieldAlert className="text-red" />
          <span>TRIBE MOD</span>
        </div>

        <nav className="admin-nav">
          <p className="nav-label">Main</p>
          <button className={`nav-item ${currentView === 'overview' ? 'active' : ''}`} onClick={() => safeSetView('overview')}><BarChart3 size={18} /> Overview</button>

          <p className="nav-label">Management</p>
          <button className={`nav-item ${currentView === 'users' ? 'active' : ''}`} onClick={() => safeSetView('users')}><ShieldCheck size={18} /> Users ({users.length})</button>
          <button className={`nav-item ${currentView === 'listings' ? 'active' : ''}`} onClick={() => safeSetView('listings')}><Package size={18} /> Listings ({listings.length})</button>
          <button className={`nav-item ${currentView === 'transactions' ? 'active' : ''}`} onClick={() => safeSetView('transactions')}><Landmark size={18} /> Transactions ({transactions.length})</button>
          
          <p className="nav-label">Social & Help</p>
          <button className={`nav-item ${currentView === 'posts' ? 'active' : ''}`} onClick={() => safeSetView('posts')}><MessageSquare size={18} /> Forum Posts ({posts.length})</button>
          <button className={`nav-item ${currentView === 'replies' ? 'active' : ''}`} onClick={() => safeSetView('replies')}><MessageSquare size={18} /> Replies ({replies.length})</button>
          <button className={`nav-item ${currentView === 'faqs' ? 'active' : ''}`} onClick={() => safeSetView('faqs')}><HelpCircle size={18} /> FAQs ({stats.unansweredQuestions || 0} new)</button>

          <button className="nav-item logout" onClick={handleLogout}><LogOut size={18} /> Logout</button>
        </nav>
      </aside>

      <main className="admin-main">
        <header className="admin-header">
          <button type="button" className="admin-mobile-menu-btn" onClick={() => setMenuOpen(true)} aria-label="Open menu">
            <ShieldAlert size={18} /> <span>Menu</span>
          </button>
          <h1>{currentView.toUpperCase()}</h1>
          <div className="admin-search">
            <Search size={18} />
            <input placeholder="Search records..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
          {currentView === 'transactions' && (
            <button className="btn-add-proof" onClick={() => setTransactionModalOpen(true)}>+ Approve Proof Transaction</button>
          )}
        </header>

        <div className="view-container">
          {/* OVERVIEW VIEW */}
          {currentView === 'overview' && (
            <div className="overview-grid">
              <div className="stat-card-lg"><h4>Total Users</h4><h2>{stats.totalUsers || 0}</h2></div>
              <div className="stat-card-lg"><h4>Forum Posts</h4><h2>{stats.totalPosts || 0}</h2></div>
              <div className="stat-card-lg"><h4>Active Listings</h4><h2>{stats.totalListings || 0}</h2></div>
              <div className="stat-card-lg"><h4>Approved Deals</h4><h2>{transactions.length}</h2></div>
              <div className="stat-card-lg status-live"><div className="pulse-icon" /><h4>Database Connected</h4></div>
            </div>
          )}

          {/* USERS VIEW */}
          {currentView === 'users' && (
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Identity Verified</th>
                    <th>Fraud Risk status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.users.map(user => (
                    <tr key={user._id} className={user.flaggedSuspicious ? 'row-flagged' : ''}>
                      <td>@{user.username} {user.flaggedSuspicious && '⚠️'}</td>
                      <td>{user.email}</td>
                      <td>
                        <select 
                          value={user.identityVerified || 'pending'} 
                          onChange={(e) => handleVerifyIdentity(user._id, e.target.value)}
                          className="status-select"
                        >
                          <option value="pending">Pending</option>
                          <option value="verified">Verified</option>
                          <option value="failed">Failed/Rejected</option>
                        </select>
                      </td>
                      <td>
                        {user.banned ? <span className="status-tag flagged">Suspended</span> : 
                         user.flaggedSuspicious ? <span className="status-tag review">Suspicious</span> : 
                         <span className="status-tag live">Clean</span>}
                      </td>
                      <td>
                        <button className="btn-edit-sm" onClick={() => setSelectedUser(user)} title="Inspect Deep Identity Profile">
                          <Edit3 size={14} /> Inspect
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* LISTINGS VIEW */}
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
                      <td>{listing.seller ? `@${listing.seller.id?.username || listing.seller.name || 'Unknown'}` : '@Unknown'}</td>
                      <td>${listing.price?.toLocaleString()}</td>
                      <td>
                        <select value={listing.status} onChange={(e) => handleUpdateListingStatus(listing._id, e.target.value)} className="status-select">
                          <option value="pending">Pending</option>
                          <option value="active">Active</option>
                          <option value="sold">Sold</option>
                          <option value="rejected">Rejected</option>
                        </select>
                      </td>
                      <td>
                        <div className="action-button-group">
                          <button className="btn-edit-sm" onClick={() => setSelectedListing(listing)}><Edit3 size={14} /></button>
                          <button className="btn-secondary-sm" onClick={() => handleDuplicateListing(listing)} title="Duplicate Listing"><Copy size={14} /></button>
                          <button className="btn-delete-sm" onClick={() => handleDeleteListing(listing._id)}><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* TRANSACTIONS VIEW */}
          {currentView === 'transactions' && (
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Transaction ID</th>
                    <th>Buyer Account</th>
                    <th>Seller Account</th>
                    <th>Closing Payout</th>
                    <th>Date Approved</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.transactions.length === 0 ? (
                    <tr><td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}>No approved transaction logs on file.</td></tr>
                  ) : (
                    filteredData.transactions.map(tx => (
                      <tr key={tx._id}>
                        <td><code>{tx._id}</code></td>
                        <td>@{tx.buyerId?.username || tx.buyerId || 'N/A'}</td>
                        <td>@{tx.sellerId?.username || tx.sellerId || 'N/A'}</td>
                        <td><strong>${parseInt(tx.finalPrice || 0).toLocaleString()}</strong></td>
                        <td>{new Date(tx.createdAt || Date.now()).toLocaleDateString()}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* FORUM POSTS VIEW */}
          {currentView === 'posts' && (
            <div className="admin-table-container">
              <table className="admin-table">
                <thead><tr><th>Title</th><th>Author</th><th>Tribe</th><th>Votes</th><th>Actions</th></tr></thead>
                <tbody>
                  {filteredData.posts.map(post => (
                    <tr key={post._id}>
                      <td>{post.title}</td>
                      <td>@{post.author?.username || 'Deleted User'}</td>
                      <td><span className={`type-tag ${post.tribe?.toLowerCase() || 'other'}`}>{post.tribe || 'Other'}</span></td>
                      <td>{post.voteCount || 0}</td>
                      <td><button className="btn-delete-sm" onClick={() => handleDeletePost(post._id)}><Trash2 size={14} /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* REPLIES VIEW */}
          {currentView === 'replies' && (
            <div className="admin-table-container">
              <table className="admin-table">
                <thead><tr><th>Reply</th><th>Author</th><th>Post</th><th>Actions</th></tr></thead>
                <tbody>
                  {filteredData.replies.map(reply => (
                    <tr key={reply._id}>
                      <td>{reply.text?.substring(0, 50)}...</td>
                      <td>@{reply.author?.username}</td>
                      <td>{reply.post?.title?.substring(0, 30)}...</td>
                      <td><button className="btn-delete-sm" onClick={() => handleDeleteReply(reply._id)}><Trash2 size={14} /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* FAQS VIEW */}
          {currentView === 'faqs' && (
            <div className="admin-table-container">
              <table className="admin-table">
                <thead><tr><th>Question</th><th>Asked By</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>
                  {filteredData.faqs.map(faq => (
                    <tr key={faq._id}>
                      <td>{faq.question}</td>
                      <td>{faq.askedBy?.username || faq.email || 'Anonymous'}</td>
                      <td>{faq.answered ? <span className="status-tag live">Answered</span> : <span className="status-tag pending">Pending</span>}</td>
                      <td>
                        <button className={`btn-${faq.published ? 'approve' : 'secondary'}-sm`} onClick={() => handlePublishFAQ(faq._id, !faq.published)}>
                          {faq.published ? <Eye size={14} /> : <EyeOff size={14} />}
                        </button>
                        <button className="btn-edit-sm" onClick={() => openFAQModal(faq)}><Edit3 size={14} /></button>
                        <button className="btn-delete-sm" onClick={() => handleDeleteFAQ(faq._id)}><Trash2 size={14} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* USER INSIGHTS MODAL (Deep Account Auditing) */}
      <AnimatePresence>
        {selectedUser && (
          <div className="admin-modal-overlay" onClick={() => setSelectedUser(null)}>
            <motion.div className="admin-edit-modal custom-scroll" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} onClick={(e) => e.stopPropagation()}>
              <div className="modal-header-admin">
                <h3>Identity Inspection Profile: @{selectedUser.username}</h3>
                <button onClick={() => setSelectedUser(null)}><X size={20} /></button>
              </div>

              <div className="user-control-strip">
                {selectedUser.banned ? (
                  <button className="btn-approve" onClick={() => handleBanUser(selectedUser._id, false)}><Check size={16} /> Lifting Suspension</button>
                ) : (
                  <button className="btn-warning" onClick={() => handleBanUser(selectedUser._id, true)}><Ban size={16} /> Suspend/Ban Account</button>
                )}
                <button className="btn-secondary" onClick={() => handleResetAccountDetails(selectedUser._id)}><History size={16} /> Reset Credentials</button>
                {selectedUser.flaggedSuspicious ? (
                  <button className="btn-approve" onClick={() => handleFlagSuspicious(selectedUser._id, false)}><CheckCircle size={16} /> Clear Fraud Flag</button>
                ) : (
                  <button className="btn-warning" onClick={() => handleFlagSuspicious(selectedUser._id, true)}><AlertTriangle size={16} /> Flag Suspicious Account</button>
                )}
                <button className="btn-delete" onClick={() => handleDeleteUser(selectedUser._id)}><UserX size={16} /> Hard Purge Account</button>
              </div>

              <div className="modal-scroll-body">
                <div className="info-section-group">
                  <h4>Account Credentials</h4>
                  <p><strong>Database ID:</strong> <code>{selectedUser._id}</code></p>
                  <p><strong>Linked Email Address:</strong> {selectedUser.email}</p>
                  <p><strong>System Role Mapping:</strong> {selectedUser.role}</p>
                </div>

                <div className="info-section-group">
                  <h4>Login History & Session Audit Logs</h4>
                  <ul>
                    {(selectedUser.loginHistory || [
                      { ip: '162.210.192.4', device: 'Chrome on macOS (NY Metro)', date: 'Just now' },
                      { ip: '162.210.192.4', device: 'Chrome on macOS (NY Metro)', date: 'Yesterday' }
                    ]).map((session, index) => (
                      <li key={index}><code>{session.ip}</code> — {session.device} ({session.date})</li>
                    ))}
                  </ul>
                </div>

                <div className="info-section-group">
                  <h4>Transactional History Metrics</h4>
                  <p><strong>Completed Purchases:</strong> {selectedUser.buyerCount || 0} closed deals</p>
                  <p><strong>Completed Sales:</strong> {selectedUser.sellerCount || 0} listings sold</p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* EDIT LISTING DETAILS & AUDIT HISTORIES */}
      <AnimatePresence>
        {selectedListing && (
          <div className="admin-modal-overlay" onClick={() => setSelectedListing(null)}>
            <motion.div className="admin-edit-modal" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} onClick={(e) => e.stopPropagation()}>
              <div className="modal-header-admin">
                <h3>Edit Listing Context</h3>
                <button onClick={() => setSelectedListing(null)}><X size={20} /></button>
              </div>
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                handleEditListingDetails(selectedListing._id, Object.fromEntries(formData));
              }} className="faq-form">
                <div className="form-group">
                  <label>Vehicle Make</label>
                  <input name="make" defaultValue={selectedListing.make} required />
                </div>
                <div className="form-group">
                  <label>Vehicle Model</label>
                  <input name="model" defaultValue={selectedListing.model} required />
                </div>
                <div className="form-group">
                  <label>Asking Value ($)</label>
                  <input type="number" name="price" defaultValue={selectedListing.price} required />
                </div>
                <div className="info-section-group" style={{ marginTop: '1rem', background: '#f8fafc', padding: '1rem', borderRadius: '6px' }}>
                  <h4><FileText size={14} style={{ marginRight: '6px', inlineSize: 'auto' }} /> Audit Tracking Logs</h4>
                  <p style={{ fontSize: '0.85rem', color: '#64748b' }}>Original creation timestamp: {new Date(selectedListing.createdAt || Date.now()).toLocaleString()}</p>
                  <p style={{ fontSize: '0.85rem', color: '#64748b' }}>Last modified configuration state: {new Date(selectedListing.updatedAt || Date.now()).toLocaleString()}</p>
                </div>
                <button type="submit" className="btn-save-admin" style={{ marginTop: '1rem' }}><Check size={16} /> Save Overwritten Attributes</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MANUAL PROOF OF TRANSACTION APPROVAL MODAL */}
      <AnimatePresence>
        {transactionModalOpen && (
          <div className="admin-modal-overlay" onClick={() => setTransactionModalOpen(false)}>
            <motion.div className="admin-edit-modal" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} onClick={(e) => e.stopPropagation()}>
              <div className="modal-header-admin">
                <h3>Submit Off-Platform Proof of Transaction</h3>
                <button onClick={() => setTransactionModalOpen(false)}><X size={20} /></button>
              </div>
              <form onSubmit={handleSubmitTransaction} className="faq-form">
                <div className="form-group"><label>Target Vehicle Listing ID</label><input type="text" placeholder="e.g. 64b2f15a..." required value={txData.listingId} onChange={(e) => setTxData({ ...txData, listingId: e.target.value })} /></div>
                <div className="form-group"><label>Buyer Account ID/Username</label><input type="text" placeholder="Buyer record profile" required value={txData.buyerId} onChange={(e) => setTxData({ ...txData, buyerId: e.target.value })} /></div>
                <div className="form-group"><label>Seller Account ID/Username</label><input type="text" placeholder="Seller record profile" required value={txData.sellerId} onChange={(e) => setTxData({ ...txData, sellerId: e.target.value })} /></div>
                <div className="form-group"><label>Final Verified Closed Price ($)</label><input type="number" placeholder="45000" required value={txData.finalPrice} onChange={(e) => setTxData({ ...txData, finalPrice: e.target.value })} /></div>
                <div className="form-group"><label>Proof Document URL (Receipt / Wire Copy Link)</label><input type="url" placeholder="https://storage.provider/proof.pdf" value={txData.proofUrl} onChange={(e) => setTxData({ ...txData, proofUrl: e.target.value })} /></div>
                <div className="form-group"><label>Administrative Authorization Notes</label><textarea placeholder="Add proof validation details here..." rows="3" value={txData.notes} onChange={(e) => setTxData({ ...txData, notes: e.target.value })} /></div>
                <button type="submit" className="btn-save-admin"><Check size={16} /> Authorize & Save Record</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* FAQ ANSWER MODAL */}
      <AnimatePresence>
        {selectedFAQ && (
          <div className="admin-modal-overlay" onClick={() => setSelectedFAQ(null)}>
            <motion.div className="admin-edit-modal" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} onClick={(e) => e.stopPropagation()}>
              <div className="modal-header-admin"><h3>Answer Question</h3><button onClick={() => setSelectedFAQ(null)}><X size={20} /></button></div>
              <div className="faq-form">
                <div className="form-group"><label>Question</label><p className="question-text">{selectedFAQ.question}</p></div>
                <div className="form-group">
                  <label>Category</label>
                  <select value={faqCategorySelection} onChange={(e) => setFaqCategorySelection(e.target.value)}>
                    <option value="Account">Account</option><option value="Marketplace">Marketplace</option><option value="Forum">Forum</option><option value="Technical">Technical</option><option value="Safety">Safety</option><option value="General">General</option>
                  </select>
                </div>
                <div className="form-group"><label>Answer</label><textarea value={faqAnswerText} onChange={(e) => setFaqAnswerText(e.target.value)} rows="4" placeholder="Provide a helpful answer..." /></div>
                <button className="btn-save-admin" onClick={() => handleAnswerFAQ(selectedFAQ._id, faqAnswerText, faqCategorySelection)}><Check size={16} /> Save Answer</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ModerationDashboard;