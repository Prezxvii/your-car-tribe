const express = require('express');
const router = express.Router();
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { getMarketCheckListings, getSingleListing } = require('../services/marketCheckService');
const Listing = require('../models/Listing');

// Configure Cloudinary
cloudinary.config({
  cloud_name: 'dwgf82ubk',
  api_key: '676816716634948',
  api_secret: 'gO6qa6n7sE7NyBh0UofJ9rZrUzc'
});

// Configure multer to upload directly to Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'your-car-tribe',
    allowed_formats: ['jpg', 'jpeg', 'png', 'heic'],
    transformation: [{ width: 1200, height: 800, crop: 'limit', quality: 'auto' }]
  }
});

const upload = multer({ storage });

// ==========================================================================
// CREATE A LISTING
// ==========================================================================
router.post('/submit', upload.array('photos'), async (req, res) => {
  try {
    console.log('=== SUBMIT REACHED ===');

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    let currentUser;
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      currentUser = await User.findById(decoded.id).select('-password');
    } catch (tokenErr) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    if (!currentUser) {
      return res.status(401).json({ error: 'User not found' });
    }

    console.log('user verified:', currentUser._id);

    const { year, make, model, price, miles, location, description, titleStatus, tag, highlights, specs } = req.body;

    let parsedHighlights = [];
    let parsedSpecs = {};

    try {
      parsedHighlights = highlights
        ? (Array.isArray(highlights) ? highlights : JSON.parse(highlights))
        : [];
    } catch (e) { console.error('highlights parse error:', e.message); }

    try {
      parsedSpecs = specs
        ? (typeof specs === 'object' && !Array.isArray(specs) ? specs : JSON.parse(specs))
        : {};
    } catch (e) { console.error('specs parse error:', e.message); }

    const parsedYear = parseInt(String(year).replace(/[^0-9]/g, ''), 10) || new Date().getFullYear();
    const parsedPrice = parseFloat(String(price).replace(/[^0-9.]/g, '')) || 0;
    const cleanMiles = String(miles).replace(/[^0-9]/g, '') || '0';

    // Real Cloudinary URLs from uploaded files
    const photoUrls = req.files?.length > 0
      ? req.files.map(f => f.path)
      : ['https://placehold.co/600x400?text=No+Image'];

    console.log('Photos uploaded to Cloudinary:', photoUrls);

    const listingPayload = {
      year:        parsedYear,
      make:        make        || 'Unknown',
      model:       model       || 'Unknown',
      price:       parsedPrice,
      miles:       cleanMiles,
      location:    location    || 'Not Specified',
      description: description || '',
      titleStatus: titleStatus || 'Clean',
      tag:         tag         || 'OTHER',
      highlights:  parsedHighlights,
      specs:       parsedSpecs,
      images:      photoUrls,
      status:      'active',
      // FIX: Matches your Schema definition (direct reference, not object mapping)
      seller:      currentUser._id 
    };

    const newListing = new Listing(listingPayload);
    await newListing.save();

    console.log('=== LISTING SAVED SUCCESSFULLY ===');

    return res.status(201).json({
      success: true,
      message: 'Listing created',
      listing: newListing
    });

  } catch (error) {
    console.error('SUBMIT ERROR:', error.name, '-', error.message);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: 'Validation failed', details: error.message });
    }
    return res.status(500).json({ error: 'Server error', details: error.message });
  }
});

// ==========================================================================
// GET ALL LISTINGS
// ==========================================================================
router.get('/all', async (req, res) => {
  try {
    const { search, zip, radius } = req.query;
    let externalListings = [];
    let internalListings = [];
    try {
      externalListings = await getMarketCheckListings(search, zip, radius);
    } catch (extError) {
      console.error("External API Error:", extError.message);
    }
    try {
      internalListings = await Listing.find({ status: 'active' });
    } catch (intError) {
      console.error("Internal DB Error:", intError.message);
    }
    res.json([...internalListings, ...externalListings]);
  } catch (error) {
    res.json([]);
  }
});

// ==========================================================================
// GET SINGLE LISTING BY ID
// ==========================================================================
router.get('/listing/:id', async (req, res) => {
  try {
    const { id } = req.params;
    let listing = null;
    if (id.startsWith('mc-')) {
      try {
        listing = await getSingleListing(id);
      } catch (mcError) {
        return res.status(503).json({ message: "External network unavailable", error: mcError.message });
      }
    } else {
      if (id.match(/^[0-9a-fA-F]{24}$/)) {
        // FIXED: Added .populate('seller') so your frontend profile widget works smoothly
        listing = await Listing.findById(id).populate('seller', 'username personalName avatar interests knowWhats');
      } else {
        return res.status(400).json({ message: "Invalid listing ID format" });
      }
    }
    if (!listing) {
      return res.status(404).json({ message: "Vehicle not found" });
    }
    res.json(listing);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving details", error: error.message });
  }
});

// ==========================================================================
// ADD A RECOMMENDATION / REVIEW TO A LISTING
// ==========================================================================
router.post('/listing/:id/review', async (req, res) => {
  try {
    const { id } = req.params;
    const { username, tribe, rating, comment } = req.body;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: "Invalid listing ID format" });
    }

    if (!username || !rating || !comment) {
      return res.status(400).json({ error: "Missing required review payload elements" });
    }

    const listing = await Listing.findById(id);
    if (!listing) {
      return res.status(404).json({ error: "Vehicle dossier not found" });
    }

    // Try to find the actual user to fulfill the schema's required userId field
    const numericRating = Number(rating);
    const userDoc = await User.findOne({ username });
    
    const targetReview = {
      userId: userDoc ? userDoc._id : new require('mongoose').Types.ObjectId(), // Fallback placeholder if missing
      username,
      tribe: tribe || 'Enthusiast',
      rating: isNaN(numericRating) ? 5 : numericRating,
      comment
    };

    listing.reviews.push(targetReview);
    
    // Triggers schema calculations automatically
    await listing.save();

    // Returns the fresh listing document containing the new data structure array
    return res.status(201).json(listing);
  } catch (err) {
    console.error("Review creation endpoint breakdown:", err);
    return res.status(500).json({ error: "Could not post verification recommendation to document." });
  }
});

module.exports = router;