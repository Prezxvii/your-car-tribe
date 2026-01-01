const axios = require('axios');

const BASE_URL = 'https://api.marketcheck.com/v2';
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

/**
 * Standardizes MarketCheck data into the Tribe format
 */
const transformListing = (item) => {
  const fullId = item.id || 'NOID';
  const vin = item.vin || 'NOVIN';
  
  // Clean the ID: MarketCheck sometimes prepends the VIN to the ID
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
    msrp: item.msrp || item.price || 0,
    tag: assignTribeTag(item.build?.make),
    miles: item.miles || 0,
    location: item.dealer?.city ? `${item.dealer.city}, ${item.dealer.state}` : 'Location Unknown',
    description: item.extra?.description || item.extra?.ft || `${item.build?.make} ${item.build?.model} available now.`,
    
    // Media handling for ListingDetail compatibility
    images: item.media?.photo_links || [],
    media: {
      photo_links: item.media?.photo_links || []
    },
    imageUrl: item.media?.photo_links?.[0] || 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=800&q=80',
    
    specs: {
      engine: item.build?.engine || 'N/A',
      transmission: item.build?.transmission || 'N/A',
      vin: item.vin
    },
    vin: item.vin,
    dealer_name: item.dealer?.name || 'Verified Dealer',
    seller: {
      name: item.dealer?.name || 'Verified Dealer',
      type: 'dealer'
    },
    origin: 'Marketplace',
    source: 'marketcheck'
  };
};

const getMarketCheckListings = async (searchQuery, zip, radius) => {
  try {
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
      timeout: 15000
    });

    return (response.data.listings || []).map(item => transformListing(item));
  } catch (error) {
    console.error('❌ MarketCheck API Error (getListings):', error.message);
    return [];
  }
};

const getSingleListing = async (compositeId) => {
  try {
    // 1. Check Cache
    const cached = listingsCache.get(compositeId);
    if (cached && (Date.now() - cached.timestamp < CACHE_DURATION)) {
      return cached.data;
    }
    
    // 2. Extract VIN (The first 17 chars after 'mc-')
    const vin = compositeId.split('-')[1];
    if (!vin) return null;

    const response = await axios.get(`${BASE_URL}/search/car/active`, {
      params: {
        api_key: process.env.MARKETCHECK_API_KEY,
        vin: vin,
        rows: 1
      },
      timeout: 15000
    });

    if (response.data.listings && response.data.listings.length > 0) {
      const transformed = transformListing(response.data.listings[0]);
      listingsCache.set(compositeId, { data: transformed, timestamp: Date.now() });
      return transformed;
    }
    return null;
  } catch (error) {
    console.error('❌ MarketCheck API Error (getSingleListing):', error.message);
    return null;
  }
};

module.exports = { getMarketCheckListings, getSingleListing };