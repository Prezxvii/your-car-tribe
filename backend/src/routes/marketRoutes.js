const express = require('express');
const router = express.Router();
const multer = require('multer');
const { getMarketCheckListings, getSingleListing } = require('../services/marketCheckService');
const Listing = require('../models/Listing');
const { protect } = require('../middleware/authMiddleware');

const upload = multer({ 
  limits: { fileSize: 50 * 1024 * 1024 } 
});

router.post('/submit', upload.array('photos'), protect, async (req, res) => {
  try {
    console.log('=== SUBMIT REACHED ===');
    console.log('user:', req.user?._id);
    console.log('body keys:', Object.keys(req.body || {}));

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

    const photoUrls = req.files?.length > 0
      ? req.files.map((f, i) => `https://placehold.co/600x400?text=Photo+${i + 1}`)
      : ['https://placehold.co/600x400?text=No+Image'];

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
    };

    if (req.user) {
      listingPayload.seller = {
        name:     req.user.username || req.user.name || 'Unknown',
        id:       req.user._id,
        avatar:   req.user.avatar || '',
        verified: req.user.verified || false,
      };
    }

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
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid field type', details: error.message });
    }
    return res.status(500).json({ error: 'Server error', details: error.message });
  }
});

router.get('/test-api', async (req, res) => {
  try {
    if (!process.env.MARKETCHECK_API_KEY) {
      return res.status(500).json({ status: 'error', message: 'MARKETCHECK_API_KEY not found' });
    }
    const axios = require('axios');
    const testResponse = await axios.get('https://api.marketcheck.com/v2/search/car/active', {
      params: { api_key: process.env.MARKETCHECK_API_KEY, rows: 1, car_type: 'used' },
      timeout: 10000
    });
    res.json({
      status: 'success',
      message: 'MarketCheck API is working',
      apiKeyPrefix: process.env.MARKETCHECK_API_KEY.substring(0, 8) + '...',
      sampleListingCount: testResponse.data.num_found || 0
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

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
        listing = await Listing.findById(id);
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

module.exports = router;
