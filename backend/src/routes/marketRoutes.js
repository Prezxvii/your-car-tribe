const express = require('express');
const router = express.Router();
const mongoose = require('mongoose'); 
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
// CREATE A LISTING (ROBUST FALLBACKS ADDED)
// ==========================================================================
router.post('/submit', upload.array('photos'), async (req, res) => {
  try {
    console.log('=== SUBMIT REACHED ===');

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No authorization token provided' });
    }

    const token = authHeader.split(' ')[1];
    let currentUser;
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      currentUser = await User.findById(decoded.id).select('-password');
    } catch (tokenErr) {
      return res.status(401).json({ error: 'Invalid or expired token. Please sign in again.' });
    }

    if (!currentUser) {
      return res.status(401).json({ error: 'User profile not found' });
    }

    const { year, make, model, price, miles, location, description, titleStatus, tag, highlights, specs } = req.body;

    let parsedHighlights = [];
    let parsedSpecs = {
      engine: 'N/A', transmission: 'Manual 6-Speed', drivetrain: 'N/A',
      vin: 'Inquire', fuelType: 'Gasoline', exteriorColor: 'N/A', interiorColor: 'N/A'
    };

    try {
      parsedHighlights = highlights ? (Array.isArray(highlights) ? highlights : JSON.parse(highlights)) : [];
    } catch (e) { console.error('Non-critical highlights parse fallback bypass:', e.message); }

    try {
      if (specs) {
        const incomingSpecs = typeof specs === 'object' ? specs : JSON.parse(specs);
        parsedSpecs = { ...parsedSpecs, ...incomingSpecs };
      }
    } catch (e) { console.error('Non-critical specs parse fallback bypass:', e.message); }

    const parsedYear = parseInt(String(year).replace(/[^0-9]/g, ''), 10) || new Date().getFullYear();
    const parsedPrice = parseFloat(String(price).replace(/[^0-9.]/g, '')) || 0;
    const cleanMiles = miles ? String(miles).replace(/[^0-9]/g, '') : '0';

    // Safely extract paths from Cloudinary files array
    const photoUrls = req.files?.length > 0 
      ? req.files.map(f => f.path || f.secure_url || f.url) 
      : ['https://placehold.co/600x400?text=No+Image'];

    // Enforce matching fields with schema requirements strictly
    const listingPayload = {
      year:        parsedYear,
      make:        make        || 'Unknown Make',
      model:       model       || 'Unknown Model',
      price:       parsedPrice,
      miles:       cleanMiles,
      location:    location    || 'Not Specified',
      description: description || '',
      titleStatus: titleStatus || 'Clean',
      tag:         ['JDM', 'EURO', 'MUSCLE', '4X4', 'CLASSIC', 'OTHER'].includes(tag) ? tag : 'OTHER',
      highlights:  parsedHighlights,
      specs:       parsedSpecs,
      images:      photoUrls,
      status:      'active',
      seller:      currentUser._id 
    };

    const newListing = new Listing(listingPayload);
    await newListing.save();

    console.log('=== LISTING SAVED SUCCESSFULLY ===');

    return res.status(201).json({
      success: true,
      message: 'Listing created successfully',
      listing: newListing
    });

  } catch (error) {
    console.error('❌ CRITICAL SUBMIT ROUTE EXCEPTION:', error);
    return res.status(500).json({ 
      error: 'Backend failed to process vehicle submission.', 
      message: error.message 
    });
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
      return res.status(400).json({ error: "Missing required review fields" });
    }

    const listing = await Listing.findById(id);
    if (!listing) {
      return res.status(404).json({ error: "Vehicle dossier not found" });
    }

    const numericRating = Number(rating);

    let finalUserId = new mongoose.Types.ObjectId(); 
    let finalAvatar = "";

    try {
      const userDoc = await User.findOne({ username });
      if (userDoc) {
        finalUserId = userDoc._id;
        finalAvatar = userDoc.avatar || "";
      }
    } catch (userErr) {
      console.log("Non-critical user reference lookup bypass.");
    }
    
    const targetReview = {
      userId: finalUserId,
      username: String(username),
      userAvatar: finalAvatar, 
      tribe: tribe || 'Enthusiast',
      rating: isNaN(numericRating) ? 5 : numericRating,
      comment: String(comment)
    };

    listing.reviews.push(targetReview);
    await listing.save();

    const updatedListing = await Listing.findById(id).populate('seller', 'username personalName avatar interests knowWhats');

    return res.status(201).json(updatedListing);
  } catch (err) {
    console.error("❌ CRITICAL DB VALIDATION FAILURE DETAILS:", err);
    return res.status(500).json({ 
      error: "Could not post verification recommendation.", 
      message: err.message,
      validationErrors: err.errors ? Object.keys(err.errors) : null 
    });
  }
});

module.exports = router;