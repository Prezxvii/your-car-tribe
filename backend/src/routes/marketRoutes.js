const express = require('express');
const router = express.Router();
const { getMarketCheckListings, getSingleListing } = require('../services/marketCheckService');
const Listing = require('../models/Listing'); 

// --- TEST ENDPOINT: Check MarketCheck API Connection ---
router.get('/test-api', async (req, res) => {
  try {
    console.log('🧪 Testing MarketCheck API connection...');
    
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

// --- 1. GET ALL ---
router.get('/all', async (req, res) => {
  try {
    const { search, zip, radius } = req.query;
    
    // Fetch both sources with individual error handling
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

// --- 2. GET SINGLE LISTING (Enhanced with detailed error logging) ---
router.get('/listing/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🔍 Fetching listing with ID: ${id}`);
    
    let listing = null;
    
    // Detect if it's a MarketCheck ID or a MongoDB ObjectId
    if (id.startsWith('mc-')) {
      console.log("📡 Detected MarketCheck ID, calling external API...");
      
      try {
        listing = await getSingleListing(id);
        console.log("✅ MarketCheck listing retrieved:", listing ? "Success" : "Not found");
      } catch (mcError) {
        console.error("❌ MarketCheck API Error:", mcError.message);
        console.error("Full error:", mcError);
        
        // Return a more specific error
        return res.status(503).json({ 
          message: "External dealer network temporarily unavailable",
          error: mcError.message 
        });
      }
    } else {
      console.log("🗄️ Detected MongoDB ID, querying internal DB...");
      
      // Basic check to ensure it's a valid MongoDB ID format before querying
      if (id.match(/^[0-9a-fA-F]{24}$/)) {
        listing = await Listing.findById(id);
        console.log("✅ Internal listing retrieved:", listing ? "Success" : "Not found");
      } else {
        console.log("❌ Invalid MongoDB ID format");
        return res.status(400).json({ message: "Invalid listing ID format" });
      }
    }
    
    if (!listing) {
      console.log("⚠️ Listing not found in either source");
      return res.status(404).json({ 
        message: "Vehicle not found in Tribe or Dealer networks" 
      });
    }
    
    console.log("✅ Returning listing data");
    res.json(listing);
    
  } catch (error) {
    console.error("❌ Backend Listing Error:", error.message);
    console.error("Stack trace:", error.stack);
    res.status(500).json({ 
      message: "Error retrieving vehicle details",
      error: error.message 
    });
  }
});

module.exports = router;