// backend/src/routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const User = require('../models/User');
const Post = require('../models/Post');
const Reply = require('../models/Reply');
const Listing = require('../models/Listing');
const FAQ = require('../models/FAQ');

// Apply protection to ALL admin routes
router.use(protect, adminOnly);

// ==================== USERS ====================

// Get all users
router.get('/users', async (req, res) => {
  try {
    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Error fetching users' });
  }
});

// Update user
router.put('/users/:id', async (req, res) => {
  try {
    const { username, email, role, tribes, bio } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { username, email, role, tribes, bio },
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Error updating user' });
  }
});

// Ban/Unban user
router.put('/users/:id/ban', async (req, res) => {
  try {
    const { banned, banReason } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { banned, banReason, bannedAt: banned ? new Date() : null },
      { new: true }
    ).select('-password');
    
    res.json(user);
  } catch (error) {
    console.error('Error banning user:', error);
    res.status(500).json({ message: 'Error updating ban status' });
  }
});

// Delete user
router.delete('/users/:id', async (req, res) => {
  try {
    // Delete user's posts, replies, listings
    await Post.deleteMany({ author: req.params.id });
    await Reply.deleteMany({ author: req.params.id });
    await Listing.deleteMany({ seller: req.params.id });
    
    const user = await User.findByIdAndDelete(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Error deleting user' });
  }
});

// ==================== FORUM POSTS ====================

// Get all posts
router.get('/posts', async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('author', 'username email')
      .sort({ createdAt: -1 })
      .limit(100);
    res.json(posts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ message: 'Error fetching posts' });
  }
});

// Delete post
router.delete('/posts/:id', async (req, res) => {
  try {
    // Delete all replies to this post
    await Reply.deleteMany({ post: req.params.id });
    
    const post = await Post.findByIdAndDelete(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ message: 'Error deleting post' });
  }
});

// Update post (edit content, change category, etc.)
router.put('/posts/:id', async (req, res) => {
  try {
    const { title, description, category, tribe } = req.body;
    
    const post = await Post.findByIdAndUpdate(
      req.params.id,
      { title, description, category, tribe },
      { new: true }
    ).populate('author', 'username email');
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    res.json(post);
  } catch (error) {
    console.error('Error updating post:', error);
    res.status(500).json({ message: 'Error updating post' });
  }
});

// ==================== REPLIES ====================

// Get all replies
router.get('/replies', async (req, res) => {
  try {
    const replies = await Reply.find()
      .populate('author', 'username email')
      .populate('post', 'title')
      .sort({ createdAt: -1 })
      .limit(100);
    res.json(replies);
  } catch (error) {
    console.error('Error fetching replies:', error);
    res.status(500).json({ message: 'Error fetching replies' });
  }
});

// Delete reply
router.delete('/replies/:id', async (req, res) => {
  try {
    const reply = await Reply.findByIdAndDelete(req.params.id);
    
    if (!reply) {
      return res.status(404).json({ message: 'Reply not found' });
    }
    
    // Decrement reply count on post
    await Post.findByIdAndUpdate(reply.post, {
      $inc: { replyCount: -1 }
    });
    
    res.json({ message: 'Reply deleted successfully' });
  } catch (error) {
    console.error('Error deleting reply:', error);
    res.status(500).json({ message: 'Error deleting reply' });
  }
});

// Update reply
router.put('/replies/:id', async (req, res) => {
  try {
    const { text } = req.body;
    
    const reply = await Reply.findByIdAndUpdate(
      req.params.id,
      { text },
      { new: true }
    ).populate('author', 'username email');
    
    if (!reply) {
      return res.status(404).json({ message: 'Reply not found' });
    }
    
    res.json(reply);
  } catch (error) {
    console.error('Error updating reply:', error);
    res.status(500).json({ message: 'Error updating reply' });
  }
});

// ==================== LISTINGS ====================

// Get all listings
router.get('/listings', async (req, res) => {
  try {
    const listings = await Listing.find()
      .populate('seller', 'username email')
      .sort({ createdAt: -1 });
    res.json(listings);
  } catch (error) {
    console.error('Error fetching listings:', error);
    res.status(500).json({ message: 'Error fetching listings' });
  }
});

// Delete listing
router.delete('/listings/:id', async (req, res) => {
  try {
    const listing = await Listing.findByIdAndDelete(req.params.id);
    
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }
    
    res.json({ message: 'Listing deleted successfully' });
  } catch (error) {
    console.error('Error deleting listing:', error);
    res.status(500).json({ message: 'Error deleting listing' });
  }
});

// Update listing status (approve/reject)
router.put('/listings/:id/status', async (req, res) => {
  try {
    const { status } = req.body; // 'active', 'pending', 'rejected', 'sold'
    
    const listing = await Listing.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('seller', 'username email');
    
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }
    
    res.json(listing);
  } catch (error) {
    console.error('Error updating listing:', error);
    res.status(500).json({ message: 'Error updating listing' });
  }
});

// ==================== FAQ SYSTEM ====================

// Get all FAQs
router.get('/faqs', async (req, res) => {
  try {
    const faqs = await FAQ.find()
      .populate('askedBy', 'username email')
      .sort({ createdAt: -1 });
    res.json(faqs);
  } catch (error) {
    console.error('Error fetching FAQs:', error);
    res.status(500).json({ message: 'Error fetching FAQs' });
  }
});

// Get unanswered questions
router.get('/faqs/unanswered', async (req, res) => {
  try {
    const questions = await FAQ.find({ answered: false })
      .populate('askedBy', 'username email')
      .sort({ createdAt: -1 });
    res.json(questions);
  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(500).json({ message: 'Error fetching questions' });
  }
});

// Answer a question
router.put('/faqs/:id/answer', async (req, res) => {
  try {
    const { answer, category } = req.body;
    
    const faq = await FAQ.findByIdAndUpdate(
      req.params.id,
      { 
        answer, 
        category,
        answered: true,
        answeredBy: req.user.id,
        answeredAt: new Date()
      },
      { new: true }
    ).populate('askedBy', 'username email');
    
    if (!faq) {
      return res.status(404).json({ message: 'Question not found' });
    }
    
    res.json(faq);
  } catch (error) {
    console.error('Error answering question:', error);
    res.status(500).json({ message: 'Error answering question' });
  }
});

// Delete FAQ
router.delete('/faqs/:id', async (req, res) => {
  try {
    const faq = await FAQ.findByIdAndDelete(req.params.id);
    
    if (!faq) {
      return res.status(404).json({ message: 'FAQ not found' });
    }
    
    res.json({ message: 'FAQ deleted successfully' });
  } catch (error) {
    console.error('Error deleting FAQ:', error);
    res.status(500).json({ message: 'Error deleting FAQ' });
  }
});

// Publish/Unpublish FAQ
router.put('/faqs/:id/publish', async (req, res) => {
  try {
    const { published } = req.body;
    
    const faq = await FAQ.findByIdAndUpdate(
      req.params.id,
      { published },
      { new: true }
    );
    
    if (!faq) {
      return res.status(404).json({ message: 'FAQ not found' });
    }
    
    res.json(faq);
  } catch (error) {
    console.error('Error updating FAQ:', error);
    res.status(500).json({ message: 'Error updating FAQ' });
  }
});

// ==================== DASHBOARD STATS ====================

router.get('/stats', async (req, res) => {
  try {
    const [
      totalUsers,
      totalPosts,
      totalListings,
      unansweredQuestions,
      activeUsers,
      flaggedContent
    ] = await Promise.all([
      User.countDocuments(),
      Post.countDocuments(),
      Listing.countDocuments(),
      FAQ.countDocuments({ answered: false }),
      User.countDocuments({ lastActive: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } }),
      Reply.countDocuments({ flagged: true })
    ]);
    
    res.json({
      totalUsers,
      totalPosts,
      totalListings,
      unansweredQuestions,
      activeUsers,
      flaggedContent
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ message: 'Error fetching stats' });
  }
});

module.exports = router;