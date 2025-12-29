const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const Reply = require('../models/Reply');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// --- GET ALL POSTS (Includes Trending & FAQ logic) ---
router.get('/posts', async (req, res) => {
  try {
    const { category, tribe, sort } = req.query;
    let filter = {};
    
    // Category Filtering (Supports 'FAQ', 'Discussion', etc.)
    if (category && category !== 'All') filter.category = category;
    if (tribe && tribe !== 'All') filter.tribe = tribe;
    
    let sortOption = { createdAt: -1 };

    if (sort === 'trending') {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      filter.createdAt = { $gte: sevenDaysAgo };
      sortOption = { voteCount: -1, createdAt: -1 };
    }
    
    const posts = await Post.find(filter)
      .populate('author', 'username fullName')
      .sort(sortOption)
      .limit(50);
    
    res.json(posts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ message: 'Error fetching posts' });
  }
});

// --- CREATE NEW POST (Users can post to FAQ category) ---
router.post('/posts', protect, async (req, res) => {
  try {
    const { title, description, category, tribe } = req.body;
    
    if (!title || !description) {
      return res.status(400).json({ message: 'Title and description are required' });
    }
    
    const post = await Post.create({
      title,
      description,
      category: category || 'Discussion',
      tribe: tribe || 'All',
      author: req.user._id,
      answer: "" // Initialize blank for FAQ purposes
    });
    
    const populatedPost = await Post.findById(post._id)
      .populate('author', 'username fullName');
    
    res.status(201).json(populatedPost);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error creating post' });
  }
});

// --- ADMIN ONLY: ANSWER FAQ ---
// This allows you to update the 'answer' field on a specific post
router.patch('/posts/:id/answer', protect, adminOnly, async (req, res) => {
  try {
    const { answer } = req.body;
    const post = await Post.findByIdAndUpdate(
      req.params.id,
      { answer, isResolved: true },
      { new: true }
    ).populate('author', 'username fullName');

    if (!post) return res.status(404).json({ message: 'Post not found' });
    
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: 'Error updating answer' });
  }
});

// --- VOTE ON POST ---
router.post('/posts/:id/vote', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    
    const voteIndex = post.votes.indexOf(req.user._id);

    if (voteIndex > -1) {
      post.votes.splice(voteIndex, 1);
      post.voteCount = Math.max(0, post.voteCount - 1);
    } else {
      post.votes.push(req.user._id);
      post.voteCount += 1;
    }
    
    await post.save();
    res.json({ voteCount: post.voteCount, hasVoted: voteIndex === -1 });
  } catch (error) {
    res.status(500).json({ message: 'Error processing vote' });
  }
});

// --- ADD REPLY ---
router.post('/posts/:id/replies', protect, async (req, res) => {
  try {
    const { text } = req.body;
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const reply = await Reply.create({
      post: req.params.id,
      author: req.user._id,
      text: text.trim()
    });
    
    post.replyCount += 1;
    await post.save();
    
    const populatedReply = await Reply.findById(reply._id)
      .populate('author', 'username fullName');
    
    res.status(201).json(populatedReply);
  } catch (error) {
    res.status(500).json({ message: 'Error adding reply' });
  }
});

// --- GET REPLIES ---
router.get('/posts/:id/replies', async (req, res) => {
  try {
    const replies = await Reply.find({ post: req.params.id })
      .populate('author', 'username fullName')
      .sort({ createdAt: 1 });
    res.json(replies);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching replies' });
  }
});

module.exports = router;