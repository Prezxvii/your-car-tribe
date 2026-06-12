const express = require('express');
const router = express.Router();
const multer = require('multer');
const { getMarketCheckListings, getSingleListing } = require('../services/marketCheckService');
const Listing = require('../models/Listing'); 

// Set up basic in-memory file storage for multer to catch multipart form data
const upload = multer({ 
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit matching server configs
});

// --- NEW ROUTE: Handle Vehicle Submission Form ---
// Express automatically prefixes this to resolve to /api/market/submit
router.post('/submit', upload.array('photos'), async (req, res) => {
  try {
    console.log('----------------------------------------------------');
    console.log('Processing incoming vehicle creation payload...');
    
    if (!req.body || Object.keys(req.body).length === 0) {
      console.log('Warning: Request body looks empty or unparsed.');
    }
    
    const { 
      year, make, model, price, miles, location, 
      description, titleStatus, tag, highlights, specs 
    } = req.body;

    console.log(`Target vehicle details identified: ${year} ${make} ${model}`);

    // Parse the stringified JSON blocks sent from the FormData object securely
    let parsedHighlights = [];
    let parsedSpecs = {};
    
    if (highlights) {
      try {
        parsedHighlights = JSON.parse(highlights);
      } catch (e) {
        console.error("Failed to parse highlights payload:", e.message);
      }
    }
    
    if (specs) {
      try {
        parsedSpecs = JSON.parse(specs);
      } catch (e) {
        console.error("Failed to parse specs payload:", e.message);
      }
    }

    // Sanitize values to strip out commas, text, spaces, or currency symbols ($) before casting
    const cleanPrice = typeof price === 'string' ? price.replace(/[^0-9.]/g, '') : price;
    const cleanMiles = typeof miles === 'string' ? miles.replace(/[^0-9]/g, '') : miles;

    const parsedPrice = parseFloat(cleanPrice) || 0;
    const parsedMiles = parseInt(cleanMiles, 10) || 0;

    console.log(`Sanitized values calculated -> Price: ${parsedPrice}, Mileage: ${parsedMiles}`);
    console.log(`Total image files intercepted by server: ${req.files ? req.files.length : 0}`);

    // Process file attachments if your server connects to cloud storage (e.g., Cloudinary, AWS S3)
    const photoUrls = req.files && req.files.length > 0 
      ? req.files.map((file, index) => `https://placehold.co/600x400?text=Vehicle+Photo+${index + 1}`) 
      : ['https://placehold.co/600x400?text=No+Images+Uploaded'];

    // Safely build out the data structure payload object
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

    // Safely verify if req.user context properties are accessible via auth middleware pipelines
    if (req.user && req.user.id) {
      listingPayload.seller = req.user.id;
    } else if (req.user && req.user._id) {
      listingPayload.seller = req.user._id;
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
    
    // Returning error message explicitly down to frontend console networks for accurate alerting
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
    res.status(500).json({
      status: 'error',
      message: error.message,
      apiKeyConfigured: !!process.env.MARKETCHECK_API_KEY,
      errorDetails: error.response?.data || 'No response from API'
    });
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
    console.error("Route Error (All):", error.message);
    res.json([]);
  }
});

// --- GET SINGLE LISTING ---
router.get('/listing/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`With ID: ${id}`);
    
    let listing = null;
    
    if (id.startsWith('mc-')) {
      console.log("Detected MarketCheck ID, calling external API...");
      
      try {
        listing = await getSingleListing(id);
        console.log("MarketCheck listing retrieved:", listing ? "Success" : "Not found");
      } catch (mcError) {
        console.error("MarketCheck API Error:", mcError.message);
        return res.status(503).json({ 
          message: "External dealer network temporarily unavailable",
          error: mcError.message 
        });
      }
    } else {
      console.log("Detected MongoDB ID, querying internal DB...");
      
      if (id.match(/^[0-9a-fA-F]{24}$/)) {
        listing = await Listing.findById(id);
        console.log("Internal listing retrieved:", listing ? "Success" : "Not found");
      } else {
        console.log("Invalid MongoDB ID format");
        return res.status(400).json({ message: "Invalid listing ID format" });
      }
    }
    
    if (!listing) {
      console.log("Listing not found in either source");
      return res.status(404).json({ 
        message: "Vehicle not found in Tribe or Dealer networks" 
      });
    }
    
    console.log("Returning listing data");
    res.json(listing);
    
  } catch (error) {
    console.error("Backend Listing Error:", error.message);
    res.status(500).json({ 
      message: "Error retrieving vehicle details",
      error: error.message 
    });
  }
});

module.exports = router;