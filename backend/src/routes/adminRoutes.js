const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const User = require('../models/User');
const Post = require('../models/Post');
const Reply = require('../models/Reply');
const Listing = require('../models/Listing');
const FAQ = require('../models/FAQ');
const Transaction = require('../models/Transaction'); // Imported transaction reference

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

// Update user details manually
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

// 🆕 Verify Identity Matrix
router.put('/users/:id/verify-identity', async (req, res) => {
  try {
    const { identityVerified } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { identityVerified },
      { new: true }
    ).select('-password');
    res.json(user);
  } catch (error) {
    console.error('Error verifying identity:', error);
    res.status(500).json({ message: 'Error updating verification status' });
  }
});

// 🆕 Flag Suspicious Accounts
router.put('/users/:id/flag', async (req, res) => {
  try {
    const { flaggedSuspicious } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { flaggedSuspicious },
      { new: true }
    ).select('-password');
    res.json(user);
  } catch (error) {
    console.error('Error flagging user profile:', error);
    res.status(500).json({ message: 'Error mapping risk parameter' });
  }
});

// 🆕 Hard Account Reset Credential Overwrite
router.put('/users/:id/reset-details', async (req, res) => {
  try {
    const { password } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User profile missing' });
    
    user.password = password; // Triggers mongoose .pre('save') pre-hook crypt execution
    await user.save();
    res.json({ success: true, message: 'Account overwritten smoothly' });
  } catch (error) {
    console.error('Error saving overwritten security profile:', error);
    res.status(500).json({ message: 'Error overriding profile data' });
  }
});

// Delete user
router.delete('/users/:id', async (req, res) => {
  try {
    await Post.deleteMany({ author: req.params.id });
    await Reply.deleteMany({ author: req.params.id });
    await Listing.deleteMany({ 'seller.id': req.params.id });
    
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
    await Reply.deleteMany({ post: req.params.id });
    const post = await Post.findByIdAndDelete(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ message: 'Error deleting post' });
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
    if (!reply) return res.status(404).json({ message: 'Reply not found' });
    await Post.findByIdAndUpdate(reply.post, { $inc: { replyCount: -1 } });
    res.json({ message: 'Reply deleted successfully' });
  } catch (error) {
    console.error('Error deleting reply:', error);
    res.status(500).json({ message: 'Error deleting reply' });
  }
});

// ==================== LISTINGS ====================

// Get all listings
router.get('/listings', async (req, res) => {
  try {
    const listings = await Listing.find()
      .populate('seller', 'username email avatar verified')
      .sort({ createdAt: -1 });
    res.json(listings);
  } catch (error) {
    console.error('Error fetching listings:', error);
    res.status(500).json({ message: 'Error fetching listings' });
  }
});

// 🆕 Edit Specific Attributes for a Listing
router.put('/listings/:id/edit', async (req, res) => {
  try {
    const updatedListing = await Listing.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    ).populate('seller', 'username email avatar verified');
    res.json(updatedListing);
  } catch (error) {
    console.error('Error editing listing fields:', error);
    res.status(500).json({ message: 'Failed to update listing metrics' });
  }
});

// 🆕 Duplicate an Existing Listing
router.post('/listings/duplicate', async (req, res) => {
  try {
    const { originalId } = req.body;
    const original = await Listing.findById(originalId);
    if (!original) return res.status(404).json({ message: 'Source listing missing' });

    const sourceData = original.toObject();
    delete sourceData._id;
    delete sourceData.createdAt;
    delete sourceData.updatedAt;

    const copy = new Listing({
      ...sourceData,
      status: 'pending' // Force review lifecycle back on clone
    });

    await copy.save();
    res.status(201).json(copy);
  } catch (error) {
    console.error('Error processing duplication mutation:', error);
    res.status(500).json({ message: 'Duplication sequence broken' });
  }
});

// Update listing status
router.put('/listings/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const listing = await Listing.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    ).populate('seller', 'username email avatar verified');
    
    if (!listing) return res.status(404).json({ message: 'Listing not found' });
    res.json(listing);
  } catch (error) {
    console.error('Error updating listing status:', error);
    res.status(500).json({ message: 'Error changing listing status' });
  }
});

// Delete listing
router.delete('/listings/:id', async (req, res) => {
  try {
    const listing = await Listing.findByIdAndDelete(req.params.id);
    if (!listing) return res.status(404).json({ message: 'Listing not found' });
    res.json({ message: 'Listing deleted successfully' });
  } catch (error) {
    console.error('Error deleting listing:', error);
    res.status(500).json({ message: 'Error deleting listing' });
  }
});

// ==================== 🆕 TRANSACTIONS HANDLING ====================

// Fetch full transaction historical tracking list
router.get('/transactions', async (req, res) => {
  try {
    const transactions = await Transaction.find({})
      .populate('buyerId', 'username email')
      .populate('sellerId', 'username email')
      .populate('listingId', 'year make model price')
      .sort({ createdAt: -1 });
    res.json(transactions);
  } catch (error) {
    console.error('Error processing audit profiles:', error);
    res.status(500).json({ message: 'Internal validation failed' });
  }
});

// Handle incoming Proof of Off-Platform Transaction Submission
router.post('/transactions/approve-proof', async (req, res) => {
  const { listingId, buyerId, sellerId, finalPrice, notes, proofUrl } = req.body;
  try {
    const tx = new Transaction({
      listingId,
      buyerId,
      sellerId,
      finalPrice,
      notes,
      proofUrl,
      status: 'approved'
    });
    await tx.save();

    // Cascading updates across adjacent structures
    await Listing.findByIdAndUpdate(listingId, { status: 'sold' });
    await User.findByIdAndUpdate(buyerId, { $inc: { buyerCount: 1 } });
    await User.findByIdAndUpdate(sellerId, { $inc: { sellerCount: 1 } });

    res.status(201).json({ success: true, tx });
  } catch (error) {
    console.error('Error processing pipeline signature logging:', error);
    res.status(400).json({ message: 'Validation parse failure on input credentials' });
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
    
    if (!faq) return res.status(404).json({ message: 'Question not found' });
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
    if (!faq) return res.status(404).json({ message: 'FAQ not found' });
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
    const faq = await FAQ.findByIdAndUpdate(req.params.id, { published }, { new: true });
    if (!faq) return res.status(404).json({ message: 'FAQ not found' });
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