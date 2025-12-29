const axios = require('axios');
const cheerio = require('cheerio');

const scrapeBaT = async () => {
  try {
    const { data } = await axios.get('https://bringatrailer.com/auctions/');
    const $ = cheerio.load(data);
    const cars = [];

    // This selects the auction items from BaT's actual HTML structure
    $('.auctions-footer-container').each((i, el) => {
      cars.push({
        id: `bat-${i}`,
        make: $(el).find('.featured-listing-title').text().trim(),
        currentBid: $(el).find('.quote-value').text(),
        origin: 'Bring a Trailer',
        // In a real scrape, you'd target the specific img tags here
        imageUrl: 'https://images.unsplash.com/photo-1616140510212-076193796d11' 
      });
    });

    return cars;
  } catch (error) {
    console.error("BaT Scrape Error:", error);
    return [];
  }
};

module.exports = { scrapeBaT };