const express = require('express');
const router = express.Router();
const ChatSession = require('../models/MessageSession');

// 1. Fetch or Initialize a Chat Session (buyer flow)
router.post('/session', async (req, res) => {
  const { listingId, buyerUsername, sellerUsername, initialMessage } = req.body;

  if (!listingId || !buyerUsername || !sellerUsername) {
    return res.status(400).json({ error: 'listingId, buyerUsername, and sellerUsername are required.' });
  }

  try {
    let session = await ChatSession.findOne({ listingId, buyerUsername });

    if (!session) {
      session = new ChatSession({
        listingId,
        buyerUsername,
        sellerUsername,
        messages: initialMessage ? [initialMessage] : []
      });
      await session.save();
    } else if (initialMessage) {
      session.messages.push(initialMessage);
      await session.save();
    }

    res.status(200).json(session);
  } catch (error) {
    console.error('Session sync error:', error);
    res.status(500).json({ error: 'Failed to synchronize chat pipeline state.' });
  }
});

// 2. NEW: Fetch all sessions where this user is the seller (for a given listing)
// The seller needs this to hydrate their side of the chat on load
router.get('/session/seller/:sellerUsername/listing/:listingId', async (req, res) => {
  const { sellerUsername, listingId } = req.params;
  try {
    // A seller may have multiple buyers — return all of them
    const sessions = await ChatSession.find({ listingId, sellerUsername });
    res.status(200).json(sessions);
  } catch (error) {
    console.error('Seller session fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch seller sessions.' });
  }
});

// 3. NEW: Fetch a single session by ID (used when seller receives a notification 
// and needs to join a specific room they haven't seen yet)
router.get('/session/:id', async (req, res) => {
  try {
    const session = await ChatSession.findById(req.params.id);
    if (!session) return res.status(404).json({ error: 'Session not found.' });
    res.status(200).json(session);
  } catch (error) {
    console.error('Session fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch session.' });
  }
});

// 4. Complete Transaction & Alert Admin
router.post('/session/:id/complete', async (req, res) => {
  try {
    const session = await ChatSession.findByIdAndUpdate(
      req.params.id,
      { isTransactionComplete: true, adminNotified: true },
      { new: true }
    );
    if (!session) return res.status(404).json({ error: 'Session not found.' });
    console.log(`Admin notification dispatched for Chat Session: ${req.params.id}`);
    res.status(200).json(session);
  } catch (error) {
    console.error('Complete transaction error:', error);
    res.status(500).json({ error: 'Could not complete core admin payload dispatch.' });
  }
});

module.exports = router;