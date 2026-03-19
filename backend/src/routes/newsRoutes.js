const express = require('express');
const router = express.Router();
const axios = require('axios');

// ✅ Your API Key
const NEWS_API_KEY = '46c7224f350846e0b5932cb038f8e6e0';

// ✅ GET car-related news - FORCE 20 ARTICLES
router.get('/car-news', async (req, res) => {
  try {
    console.log('📰 Fetching news from NewsAPI...');
    
    // Fetch news from NewsAPI with explicit pageSize: 20
    const response = await axios.get('https://newsapi.org/v2/everything', {
      params: {
        q: 'cars OR automotive OR vehicles OR "car news" OR "auto industry"',
        language: 'en',
        sortBy: 'publishedAt',
        pageSize: 20, // Request exactly 20
        apiKey: NEWS_API_KEY
      }
    });

    console.log(`✅ NewsAPI returned ${response.data.articles.length} articles`);

    // ✅ Format with GUARANTEED descriptions
    const formattedArticles = response.data.articles
      .filter(article => article.title && article.url) // Only valid articles
      .slice(0, 20) // Ensure we only take 20
      .map(article => {
        // Build description with multiple fallbacks
        let description = '';
        
        if (article.description && article.description.trim().length > 10) {
          description = article.description.trim();
        } else if (article.content && article.content.trim().length > 10) {
          description = article.content
            .replace(/\[.*?\]/g, '')
            .trim()
            .substring(0, 150);
        } else {
          description = 'Read the latest automotive news and industry updates.';
        }

        return {
          title: article.title,
          description: description,
          url: article.url,
          urlToImage: article.urlToImage || 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=400&h=250&fit=crop',
          publishedAt: article.publishedAt,
          source: {
            name: article.source?.name || 'News Source'
          }
        };
      });

    console.log(`✅ Sending ${formattedArticles.length} formatted articles to frontend`);
    res.json(formattedArticles);
    
  } catch (error) {
    console.error('❌ Error fetching news:', error.message);
    console.log('⚠️ Using fallback mock news data (20 articles)');
    
    // ✅ FALLBACK: 20 mock articles with FULL descriptions
    const mockNews = [
      {
        title: 'JPJ eBid: CFG, QAB-P number plates up for bidding',
        description: 'The Road Transport Department (JPJ) is auctioning special vehicle registration numbers including CFG and QAB-P series plates through their online bidding platform. These premium plates are available to the highest bidders.',
        url: 'https://paultan.org/2024/03/17/jpj-ebid-cfg-qab-p-number-plates',
        urlToImage: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=400&h=250&fit=crop',
        publishedAt: new Date().toISOString(),
        source: { name: "Paul Tan's Automotive News" }
      },
      {
        title: 'Lotus Eletre 600 receives MY27 upgrades, still RM489k',
        description: 'The electric SUV gets enhanced features and improved performance for the Malaysian market while maintaining its competitive pricing of RM489,000. New updates include advanced driver assistance systems.',
        url: 'https://paultan.org/2024/03/17/lotus-eletre-600-my27',
        urlToImage: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=400&h=250&fit=crop',
        publishedAt: new Date(Date.now() - 3600000).toISOString(),
        source: { name: "Paul Tan's Automotive News" }
      },
      {
        title: 'Feb 2026 Malaysian vehicle sales down by 19% – MAA',
        description: 'The Malaysian Automotive Association reports a significant decline in vehicle sales for February 2026 compared to the previous year, citing economic factors.',
        url: 'https://paultan.org/2024/03/17/feb-2026-vehicle-sales-maa',
        urlToImage: 'https://images.unsplash.com/photo-1619405399517-d7fce0f13302?w=400&h=250&fit=crop',
        publishedAt: new Date(Date.now() - 7200000).toISOString(),
        source: { name: 'Malaysian Automotive Association' }
      },
      {
        title: 'PUBG Mobile Reveals New Apollo Automobile Collaboration',
        description: 'Popular mobile game announces partnership with automotive brand Apollo for exclusive in-game content featuring luxury vehicles and customization options.',
        url: 'https://bleedingcool.com/games/pubg-mobile-apollo',
        urlToImage: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=400&h=250&fit=crop',
        publishedAt: new Date(Date.now() - 10800000).toISOString(),
        source: { name: 'Bleeding Cool News' }
      },
      {
        title: 'First quantum battery prototype enables instantaneous EV charging',
        description: 'Breakthrough technology from researchers could revolutionize electric vehicle charging, making it as fast as filling up with gas at a traditional fuel station.',
        url: 'https://notebookcheck.net/quantum-battery-ev-charging',
        urlToImage: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=400&h=250&fit=crop',
        publishedAt: new Date(Date.now() - 14400000).toISOString(),
        source: { name: 'Notebookcheck.net' }
      },
      {
        title: 'Tokyo Auto Salon 2026: Custom Builds & Tuning Trends',
        description: 'Complete coverage from Japan\'s premier automotive aftermarket trade show featuring the latest tuning trends and custom builds.',
        url: 'https://speedhunters.com/tokyo-auto-salon-2026',
        urlToImage: 'https://images.unsplash.com/photo-1617531653332-bd46c24f2068?w=400&h=250&fit=crop',
        publishedAt: new Date(Date.now() - 18000000).toISOString(),
        source: { name: 'Speedhunters' }
      },
      {
        title: 'Tesla Model Y Refresh Spotted Testing in California',
        description: 'Spy photographers have captured images of the upcoming Tesla Model Y refresh, featuring redesigned headlights and updated interior technology.',
        url: 'https://electrek.co/tesla-model-y-refresh',
        urlToImage: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=400&h=250&fit=crop',
        publishedAt: new Date(Date.now() - 21600000).toISOString(),
        source: { name: 'Electrek' }
      },
      {
        title: 'Porsche Announces New GT3 RS With Increased Performance',
        description: 'Porsche unveils the latest iteration of their track-focused GT3 RS, featuring aerodynamic improvements and a more powerful flat-six engine.',
        url: 'https://autoweek.com/porsche-gt3-rs',
        urlToImage: 'https://images.unsplash.com/photo-1614200187524-dc4b892acf16?w=400&h=250&fit=crop',
        publishedAt: new Date(Date.now() - 25200000).toISOString(),
        source: { name: 'Autoweek' }
      },
      {
        title: 'Ford Mustang Dark Horse Sets Nürburgring Record',
        description: 'The Ford Mustang Dark Horse has set a new lap record for American muscle cars at the legendary Nürburgring Nordschleife circuit.',
        url: 'https://motortrend.com/mustang-dark-horse-record',
        urlToImage: 'https://images.unsplash.com/photo-1584345604476-8ec5f5d9d5d0?w=400&h=250&fit=crop',
        publishedAt: new Date(Date.now() - 28800000).toISOString(),
        source: { name: 'MotorTrend' }
      },
      {
        title: 'BMW M3 Touring Finally Coming to North America',
        description: 'After years of waiting, BMW confirms the M3 Touring wagon will be available in North American markets starting next year.',
        url: 'https://caranddriver.com/bmw-m3-touring-usa',
        urlToImage: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=400&h=250&fit=crop',
        publishedAt: new Date(Date.now() - 32400000).toISOString(),
        source: { name: 'Car and Driver' }
      },
      {
        title: 'Rivian R2 Pre-Orders Exceed 100,000 in First Week',
        description: 'Rivian\'s more affordable R2 electric SUV has generated massive interest with over 100,000 pre-orders placed within the first week of unveiling.',
        url: 'https://insideevs.com/rivian-r2-preorders',
        urlToImage: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=400&h=250&fit=crop',
        publishedAt: new Date(Date.now() - 36000000).toISOString(),
        source: { name: 'InsideEVs' }
      },
      {
        title: 'Honda Civic Type R Breaks Production Car Record',
        description: 'The latest Honda Civic Type R has set a new lap record for front-wheel drive production cars at several major racing circuits worldwide.',
        url: 'https://roadandtrack.com/civic-type-r-record',
        urlToImage: 'https://images.unsplash.com/photo-1590362891991-f776e747a588?w=400&h=250&fit=crop',
        publishedAt: new Date(Date.now() - 39600000).toISOString(),
        source: { name: 'Road & Track' }
      },
      {
        title: 'Lamborghini Teases All-Electric Supercar Concept',
        description: 'Lamborghini has released teaser images of their first all-electric supercar concept, scheduled for full reveal at the upcoming Geneva Motor Show.',
        url: 'https://topgear.com/lamborghini-electric-concept',
        urlToImage: 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=400&h=250&fit=crop',
        publishedAt: new Date(Date.now() - 43200000).toISOString(),
        source: { name: 'Top Gear' }
      },
      {
        title: 'Mazda MX-5 Celebrates 35 Years With Special Edition',
        description: 'Mazda commemorates 35 years of the iconic MX-5 roadster with a limited edition model featuring unique styling and performance enhancements.',
        url: 'https://autocar.co.uk/mazda-mx5-35th-anniversary',
        urlToImage: 'https://images.unsplash.com/photo-1617531653332-bd46c24f2068?w=400&h=250&fit=crop',
        publishedAt: new Date(Date.now() - 46800000).toISOString(),
        source: { name: 'Autocar' }
      },
      {
        title: 'Audi Unveils New E-Tron GT Performance Variant',
        description: 'Audi expands the E-Tron GT lineup with a new high-performance variant delivering over 900 horsepower and sub-2-second acceleration.',
        url: 'https://electrek.co/audi-etron-gt-performance',
        urlToImage: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=400&h=250&fit=crop',
        publishedAt: new Date(Date.now() - 50400000).toISOString(),
        source: { name: 'Electrek' }
      },
      {
        title: 'Mercedes-AMG One Hypercar Begins Customer Deliveries',
        description: 'Mercedes-Benz has started delivering the AMG One hypercar to customers, bringing Formula 1 technology to the road in a limited production run.',
        url: 'https://autoweek.com/mercedes-amg-one-deliveries',
        urlToImage: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=400&h=250&fit=crop',
        publishedAt: new Date(Date.now() - 54000000).toISOString(),
        source: { name: 'Autoweek' }
      },
      {
        title: 'Volkswagen ID.7 GTX Unveiled as Performance Electric Sedan',
        description: 'Volkswagen reveals the sporty GTX variant of the ID.7 electric sedan, featuring dual motors and enhanced driving dynamics.',
        url: 'https://insideevs.com/vw-id7-gtx',
        urlToImage: 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?w=400&h=250&fit=crop',
        publishedAt: new Date(Date.now() - 57600000).toISOString(),
        source: { name: 'InsideEVs' }
      },
      {
        title: 'Nissan Z NISMO Returns With 450 Horsepower',
        description: 'Nissan announces the return of the Z NISMO badge with a performance-enhanced version producing 450 horsepower from its twin-turbo V6.',
        url: 'https://motortrend.com/nissan-z-nismo',
        urlToImage: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400&h=250&fit=crop',
        publishedAt: new Date(Date.now() - 61200000).toISOString(),
        source: { name: 'MotorTrend' }
      },
      {
        title: 'Hyundai IONIQ 7 Three-Row Electric SUV Revealed',
        description: 'Hyundai unveils the production version of the IONIQ 7, a three-row electric SUV with advanced autonomous driving capabilities.',
        url: 'https://caranddriver.com/hyundai-ioniq-7',
        urlToImage: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=400&h=250&fit=crop',
        publishedAt: new Date(Date.now() - 64800000).toISOString(),
        source: { name: 'Car and Driver' }
      },
      {
        title: 'Alpine A110 R Ultimate Edition Announced',
        description: 'Alpine unveils the ultimate version of the A110 sports car with weight reductions, aerodynamic improvements, and track-focused upgrades.',
        url: 'https://topgear.com/alpine-a110-r-ultimate',
        urlToImage: 'https://images.unsplash.com/photo-1614200187524-dc4b892acf16?w=400&h=250&fit=crop',
        publishedAt: new Date(Date.now() - 68400000).toISOString(),
        source: { name: 'Top Gear' }
      }
    ];

    res.json(mockNews);
  }
});

module.exports = router;