const cache = new Map();
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

async function getFilteredHotels(req, res) {
  const {
    uid: destination_id,
    checkin,
    checkout,
    starRating,
    guestRating,
    rooms = 1,
    minPrice,
    maxPrice,
    page = 1,
    limit = 18,
    adults = 1,
    children = 0,
    sortBy,
  } = req.query;

  if (!destination_id || !checkin || !checkout) {
    return res.status(400).json({ error: "Missing required parameters" });
  }

  const pageNum = Number(page) || 1;
  const limitNum = Number(limit) || 18;
  const offset = (pageNum - 1) * limitNum;
  const roomsNum = Number(rooms) || 1;
  const adultsNum = Number(adults) || 1;
  const childrenNum = Number(children) || 0;
  const minPriceNum = minPrice ? Number(minPrice) : 0;
  const maxPriceNum = maxPrice ? Number(maxPrice) : Infinity;

  const totalGuests = adultsNum + childrenNum;
  const guests = Array(roomsNum).fill(totalGuests).join('|');

  // Cache key includes only base params that affect raw data
  const cacheKey = JSON.stringify({
    destination_id,
    checkin,
    checkout,
    roomsNum,
    adultsNum,
    childrenNum,
  });

  try {
    // Check cache
    let baseData = null;
    const cached = cache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp < CACHE_TTL_MS)) {
      baseData = cached.data;
    } else {
      // Fetch base hotel list
      const hotelUrl = `https://hotelapi.loyalty.dev/api/hotels?destination_id=${destination_id}`;

      const pricesUrl = new URL("https://hotelapi.loyalty.dev/api/hotels/prices");
      pricesUrl.searchParams.set("destination_id", destination_id);
      pricesUrl.searchParams.set("checkin", checkin);
      pricesUrl.searchParams.set("checkout", checkout);
      pricesUrl.searchParams.set("lang", "en_US");
      pricesUrl.searchParams.set("currency", "SGD");
      pricesUrl.searchParams.set("country_code", "SG");
      pricesUrl.searchParams.set("guests", guests);
      pricesUrl.searchParams.set("partner_id", "1089");
      pricesUrl.searchParams.set("landing_page", "wl-acme-earn");
      pricesUrl.searchParams.set("product_type", "earn");

      const [hotelResp, priceResp] = await Promise.all([
        fetch(hotelUrl),
        fetch(pricesUrl.toString())
      ]);

      if (!hotelResp.ok) {
        const text = await hotelResp.text();
        return res.status(hotelResp.status).json({ error: "Hotel API error", details: text });
      }
      if (!priceResp.ok) {
        const text = await priceResp.text();
        return res.status(priceResp.status).json({ error: "Price API error", details: text });
      }

      let hotelData = await hotelResp.json();
      let priceData = await priceResp.json();

      // Retry logic if prices incomplete
      const MAX_RETRIES = 2;
      const RETRY_DELAY_MS = 300;

      for (let attempt = 1; attempt <= MAX_RETRIES && !priceData.completed; attempt++) {
        await new Promise(r => setTimeout(r, RETRY_DELAY_MS));
        const retryResp = await fetch(pricesUrl.toString());
        if (!retryResp.ok) {
          const retryText = await retryResp.text();
          return res.status(retryResp.status).json({ error: "Price API retry error", details: retryText });
        }
        priceData = await retryResp.json();
        if (priceData.completed) break;
      }

      if (!priceData.completed) {
        return res.status(202).json({ error: "Prices not ready after retries. Try again later." });
      }

      // Extract hotels list
      let hotels = Array.isArray(hotelData) ? hotelData : hotelData.hotels || [];

      // Merge prices in (priceData.hotels has id and price)
      if (priceData.hotels && priceData.hotels.length > 0) {
        const priceMap = new Map();
        priceData.hotels.forEach(({ id, price }) => {
          priceMap.set(id, price);
        });

        hotels = hotels.map(h => ({
          ...h,
          price: priceMap.get(h.id) ?? null,
        }));
      } else {
        hotels = hotels.map(h => ({ ...h, price: null }));
      }

      // Save raw base data in cache (no filtering or sorting here)
      baseData = hotels;
      cache.set(cacheKey, { timestamp: Date.now(), data: baseData });
    }

    // Now apply filtering and sorting on baseData according to query params:

    let filtered = baseData;

    // Filter by starRating
    if (starRating) {
      filtered = filtered.filter(hotel => hotel.rating >= Number(starRating));
    }

    // Filter by guestRating
    if (guestRating) {
      filtered = filtered.filter(hotel => (hotel.trustyou?.score?.overall || 0) >= Number(guestRating));
    }

    // Filter by price range
    filtered = filtered.filter(hotel => {
      const price = hotel.price;
      return typeof price === "number" && price >= minPriceNum && price <= maxPriceNum;
    });

    // Sort
    filtered.sort((a, b) => {
      if (sortBy === "price") return b.price - a.price;
      if (sortBy === "guestRating") {
        const aScore = a.trustyou?.score?.overall || 0;
        const bScore = b.trustyou?.score?.overall || 0;
        return bScore - aScore;
      }
      // Default sort by rating descending
      return b.rating - a.rating;
    });

    // Paginate
    const paged = filtered.slice(offset, offset + limitNum);

    return res.json({
      hotels: paged,
      total: filtered.length,
      page: pageNum,
      limit: limitNum,
      hasMore: offset + limitNum < filtered.length,
    });

  } catch (err) {
    return res.status(500).json({ error: "Internal server error" });
  }
}

module.exports = { getFilteredHotels, cache };
