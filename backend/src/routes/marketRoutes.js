const express = require('express');
const router = express.Router();
const multer = require('multer');
const { getMarketCheckListings, getSingleListing } = require('../services/marketCheckService');
const Listing = require('../models/Listing'); 

// Basic in-memory file storage configuration
const upload = multer({ 
  limits: { fileSize: 50 * 1024 * 1024 } 
});

// --- VEHICLE FORM SUBMISSION ENDPOINT ---
router.post('/submit', upload.array('photos'), async (req, res) => {
  try {
    console.log('----------------------------------------------------');
    console.log('Processing incoming vehicle creation payload...');
    
    if (!req.body) {
      console.log('Warning: Request body looks empty.');
    }
    
    const { 
      year, make, model, price, miles, location, 
      description, titleStatus, tag, highlights, specs 
    } = req.body;

    console.log(`Target vehicle details identified: ${year} ${make} ${model}`);

    // Safely parse incoming data payloads
    let parsedHighlights = [];
    let parsedSpecs = {};
    
    if (highlights) {
      try {
        parsedHighlights = typeof highlights === 'string' ? JSON.parse(highlights) : highlights;
      } catch (e) {
        console.error("Failed to parse highlights payload:", e.message);
      }
    }
    
    if (specs) {
      try {
        parsedSpecs = typeof specs === 'string' ? JSON.parse(specs) : specs;
      } catch (e) {
        console.error("Failed to parse specs payload:", e.message);
      }
    }

    // Clean formatting characters out of numbers
    const cleanPrice = typeof price === 'string' ? price.replace(/[^0-9.]/g, '') : price;
    const cleanMiles = typeof miles === 'string' ? miles.replace(/[^0-9]/g, '') : miles;

    const parsedPrice = parseFloat(cleanPrice) || 0;
    const parsedMiles = parseInt(cleanMiles, 10) || 0;

    // Process image array structures
    const photoUrls = req.files && req.files.length > 0 
      ? req.files.map((file, index) => `https://placehold.co/600x400?text=Vehicle+Photo+${index + 1}`) 
      : ['https://placehold.co/600x400?text=No+Images+Uploaded'];

    // Construct the schema listing payload document instance safely
    const listingPayload = {
      year: year || 'Unknown Year',
      make: make || 'Unknown Make',
      model: model || 'Unknown Model',
      price: parsedPrice,
      miles: parsedMiles,
      location: location || 'Not Specified',
      description: description || '',
      titleStatus: titleStatus || 'Clean',
      tag: tag || 'OTHER',
      highlights: parsedHighlights,
      specs: parsedSpecs,
      images: photoUrls,
      status: 'active'
    };

    // Use safe fallbacks for authorization checking blocks
    if (req.user) {
      listingPayload.seller = req.user.id || req.user._id || null;
    }

    const newListing = new Listing(listingPayload);
    await newListing.save();
    
    console.log('Database operation completed successfully: Document Saved.');
    console.log('----------------------------------------------------');
    
    return res.status(201).json({ 
      success: true, 
      message: 'Vehicle listing successfully created',
      listing: newListing
    });

  } catch (error) {
    console.error('CRITICAL SUBMISSION ERROR DETECTED:', error);
    return res.status(500).json({ 
      error: 'Internal server error processing listing submission',
      details: error.message 
    });
  }
});

// --- TEST ENDPOINT: Check MarketCheck API Connection ---
router.get('/test-api', async (req, res) => {
  try {
    console.log('Testing MarketCheck API connection...');
    if (!process.env.MARKETCHECK_API_KEY) {
      return res.status(500).json({ 
        status: 'error',
        message: 'MARKETCHECK_API_KEY not found in environment variables' 
      });
    }
    
    const axios = require('axios');
    const testResponse = await axios.get('https://api.marketcheck.com/v2/search/car/active', {
      params: {
        api_key: process.env.MARKETCHECK_API_KEY,
        rows: 1,
        car_type: 'used'
      },
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

// --- GET ALL ---
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

// --- GET SINGLE LISTING ---
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