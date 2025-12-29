const axios = require('axios');

const BASE_URL = 'https://api.marketcheck.com/v2';

// Cache to store listings temporarily (in-memory)
const listingsCache = new Map();
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

const assignTribeTag = (make) => {
  if (!make) return 'Classic';
  const m = make.toUpperCase();
  const euro = ['BMW', 'MERCEDES-BENZ', 'AUDI', 'VOLKSWAGEN', 'PORSCHE', 'VOLVO', 'FERRARI', 'LAMBORGHINI'];
  const jdm = ['NISSAN', 'TOYOTA', 'HONDA', 'SUBARU', 'MAZDA', 'MITSUBISHI', 'LEXUS', 'ACURA'];
  const muscle = ['FORD', 'CHEVROLET', 'DODGE', 'PONTIAC', 'CHRYSLER'];
  
  if (euro.includes(m)) return 'Euro';
  if (jdm.includes(m)) return 'JDM';
  if (muscle.includes(m)) return 'Muscle';
  return 'Classic';
};

const transformListing = (item) => {
  // MarketCheck's item.id format: "VIN-UUID-UUID"
  const fullId = item.id || 'NOID';
  const vin = item.vin || 'NOVIN';
  
  // Extract the actual listing ID (UUID part after VIN)
  let actualListingId = fullId;
  if (fullId.startsWith(vin)) {
    actualListingId = fullId.substring(vin.length + 1);
  }
  
  const compositeId = `mc-${vin}-${actualListingId}`;
  
  return {
    _id: compositeId,
    id: compositeId,
    year: item.build?.year || 2024,
    make: item.build?.make || 'Unknown',
    model: item.build?.model || 'Vehicle',
    price: item.price || 0,
    msrp: item.price || 0,
    currentBid: item.price || 0,
    tag: assignTribeTag(item.build?.make),
    miles: item.miles || 0,
    miles_display: item.miles ? `${item.miles.toLocaleString()} mi` : 'New',
    city: item.dealer?.city || 'Unknown',
    state: item.dealer?.state || '',
    location: item.dealer?.city ? `${item.dealer.city}, ${item.dealer.state}` : 'Location Unknown',
    
    // Full listing details
    description: item.extra?.description || item.extra?.ft || `${item.build?.make} ${item.build?.model} available now.`,
    
    media: {
      photo_links: item.media?.photo_links || []
    },
    images: item.media?.photo_links || [],
    imageUrl: item.media?.photo_links?.[0] || 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=800&q=80',
    
    specs: {
      engine: item.build?.engine || 'N/A',
      transmission: item.build?.transmission || 'N/A',
      vin: item.vin
    },
    
    engine_description: item.build?.engine,
    transmission_description: item.build?.transmission,
    vin: item.vin,
    
    dealer_name: item.dealer?.name || 'Verified Dealer',
    seller: {
      name: item.dealer?.name || 'Verified Dealer',
      type: 'dealer',
      tribes: [assignTribeTag(item.build?.make)],
      avatar: null
    },
    
    origin: 'Marketplace',
    source: 'marketcheck',
    
    // Store the raw item for full details
    _raw: item
  };
};

const getMarketCheckListings = async (searchQuery, zip, radius) => {
  try {
    console.log('📡 Fetching MarketCheck listings...');
    console.log('Search params:', { searchQuery, zip, radius });
    
    // FIX: Use proper string concatenation with parentheses, not backticks
    const response = await axios.get(`${BASE_URL}/search/car/active`, {
      params: {
        api_key: process.env.MARKETCHECK_API_KEY,
        car_type: 'used',
        rows: 40,
        year_make_model: searchQuery || '',
        zip: zip || '10523',
        radius: radius || '25',
        sort_by: 'distance',
      },
      timeout: 15000 // 15 second timeout
    });

    console.log(`✅ MarketCheck API returned ${response.data.num_found || 0} listings`);

    // Debug: Log first listing structure
    if (response.data.listings && response.data.listings.length > 0) {
      const sample = response.data.listings[0];
      console.log('📋 Sample listing structure:');
      console.log('  - id:', sample.id);
      console.log('  - vin:', sample.vin);
      console.log('  - heading:', sample.heading);
      console.log('  - Type of id:', typeof sample.id);
      
      // Log a few more to see the pattern
      if (response.data.listings.length > 1) {
        const sample2 = response.data.listings[1];
        console.log('📋 Second listing:');
        console.log('  - id:', sample2.id);
        console.log('  - vin:', sample2.vin);
      }
    }

    return (response.data.listings || []).map(item => {
      // MarketCheck's item.id format: "VIN-UUID-UUID"
      // We need to extract just the UUID part (everything after the VIN)
      const fullId = item.id || 'NOID';
      const vin = item.vin || 'NOVIN';
      
      // Extract the actual listing ID (UUID part after VIN)
      // Format: "VIN-uuid-uuid" -> we want "uuid-uuid"
      let actualListingId = fullId;
      if (fullId.startsWith(vin)) {
        actualListingId = fullId.substring(vin.length + 1); // +1 to skip the dash
      }
      
      // Create composite ID for our frontend: mc-VIN-actualID
      const compositeId = `mc-${vin}-${actualListingId}`;
      
      console.log(`Creating listing - VIN: ${vin}, Actual ID: ${actualListingId}, Composite: ${compositeId}`);
      
      return {
        // Use the composite ID
        id: compositeId,
        _id: compositeId,
      year: item.build?.year || 2024,
      make: item.build?.make || 'Unknown',
      model: item.build?.model || 'Vehicle',
      price: item.price || 0, // Match your ListingDetail component
      currentBid: item.price || 0,
      tag: assignTribeTag(item.build?.make),
      miles: item.miles || 0,
      miles_display: item.miles ? `${item.miles.toLocaleString()} mi` : 'New',
      city: item.dealer?.city || 'Unknown',
      state: item.dealer?.state || '',
      location: item.dealer?.city ? `${item.dealer.city}, ${item.dealer.state}` : 'Location Unknown',
      // FIX: Include media object for ListingDetail compatibility
      media: {
        photo_links: item.media?.photo_links || []
      },
      images: item.media?.photo_links || [],
      imageUrl: item.media?.photo_links?.[0] || 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=800&q=80',
      dealer_name: item.dealer?.name || 'Dealer Network',
      vin: item.vin,
      origin: 'Marketplace',
      source: 'marketcheck'
    };
    });
  } catch (error) {
    console.error('❌ MarketCheck API Error (getListings):', error.message);
    if (error.response) {
      console.error('API Response Status:', error.response.status);
      console.error('API Response Data:', error.response.data);
    }
    // Return empty array instead of throwing to prevent frontend crashes
    return [];
  }
};

const getSingleListing = async (compositeId) => {
  try {
    console.log(`📡 Fetching single listing: ${compositeId}`);
    
    // First, check the cache
    const cached = listingsCache.get(compositeId);
    if (cached && (Date.now() - cached.timestamp < CACHE_DURATION)) {
      console.log('✅ Found listing in cache');
      return cached.data;
    }
    
    console.log('⚠️ Listing not in cache');
    
    // If not in cache, we need to search for it because MarketCheck doesn't 
    // support individual listing retrieval via their /listing/:id endpoint
    console.log('🔄 Searching MarketCheck API to find this listing...');
    
    if (!process.env.MARKETCHECK_API_KEY) {
      throw new Error('MarketCheck API key not configured');
    }

    // Extract VIN to search for this specific vehicle
    const withoutPrefix = compositeId.substring(3);
    const vin = withoutPrefix.substring(0, 17);
    
    console.log(`Searching by VIN: ${vin}`);

    // Search by VIN to find the listing
    const response = await axios.get(`${BASE_URL}/search/car/active`, {
      params: {
        api_key: process.env.MARKETCHECK_API_KEY,
        vin: vin,
        rows: 1
      },
      timeout: 15000
    });

    if (response.data.listings && response.data.listings.length > 0) {
      console.log('✅ Found listing via VIN search');
      const item = response.data.listings[0];
      const transformed = transformListing(item);
      
      // Cache it
      listingsCache.set(compositeId, {
        data: transformed,
        timestamp: Date.now()
      });
      
      return transformed;
    } else {
      console.log('⚠️ Listing not found - it may have been sold or removed');
      return null;
    }
    
  } catch (error) {
    console.error('❌ MarketCheck API Error (getSingleListing):', error.message);
    
    if (error.response?.status === 404) {
      console.log('⚠️ 404 error - listing may have been removed');
      return null;
    }
    
    throw error;
  }
};

module.exports = { getMarketCheckListings, getSingleListing };