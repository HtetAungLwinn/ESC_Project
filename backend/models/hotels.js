// Simple in-memory cache for raw data
const searchCache = new Map();
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

// Generate cache key
function generateCacheKey(params) {
  return [
    params.destination_id,
    params.checkin,
    params.checkout,
    params.guests,
    params.rooms
  ].join('|');
}

// Pagination helper
function paginate(data, page, limit) {
  const offset = (page - 1) * limit;
  return {
    hotels: data.slice(offset, offset + limit),
    total: data.length,
    page,
    limit,
    hasMore: offset + limit < data.length,
  };
}

// Background price fetcher
async function fetchPricesInBackground(cacheKey, pricesUrl) {
  try {
    console.log("🔄 Background price fetch started...");

    const priceResp = await fetch(pricesUrl);
    if (!priceResp.ok) {
      console.error("❌ Background price fetch failed:", priceResp.status);
      return;
    }

    const priceData = JSON.parse(await priceResp.text());
    if (!priceData.completed) {
      console.log("⏳ Prices still not ready in background.");
      return;
    }

    // Merge prices into cached hotels
    const cached = searchCache.get(cacheKey);
    if (!cached) return;

    const priceMap = new Map();
    priceData.hotels?.forEach(({ id, price }) => {
      if (typeof price === "number") priceMap.set(id, price);
    });

    const updated = cached.data.map(h => ({
      ...h,
      price: priceMap.get(h.id) ?? null
    }));

    searchCache.set(cacheKey, { data: updated, timestamp: Date.now() });
    console.log("✅ Background price fetch completed, cache updated.");

  } catch (err) {
    console.error("❌ Background price fetch error:", err);
  }
}

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
  const roomsNum = Number(rooms) || 1;
  const adultsNum = Number(adults) || 1;
  const childrenNum = Number(children) || 0;
  const minPriceNum = minPrice ? Number(minPrice) : 0;
  const maxPriceNum = maxPrice ? Number(maxPrice) : Infinity;
  const totalGuests = adultsNum + childrenNum;
  const guests = Array(roomsNum).fill(totalGuests).join('|');

  const cacheKey = generateCacheKey({
    destination_id,
    checkin,
    checkout,
    guests,
    rooms: roomsNum,
  });

  try {
    let rawData;

    // Use cached data if valid
    const cached = searchCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      console.log("✅ Using cached data");
      rawData = cached.data;
    } else {
      console.time("🟡 Fetch Raw Data");

      // Construct URLs
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

      // Fetch hotels & prices
      const [hotelResp, priceResp] = await Promise.all([
        fetch(hotelUrl),
        fetch(pricesUrl.toString())
      ]);
      const hotelText = await hotelResp.text();
      const priceText = await priceResp.text();

      if (!hotelResp.ok) {
        return res.status(hotelResp.status).json({ error: "Hotel API error", details: hotelText });
      }

      let hotelData = JSON.parse(hotelText);
      let priceData;
      try {
        priceData = JSON.parse(priceText);
      } catch {
        priceData = { completed: false, hotels: [] };
      }

      // Normalize hotel data
      let hotels = Array.isArray(hotelData) ? hotelData : hotelData.hotels || [];

      if (!priceData.completed) {
        console.log("⏳ Prices not ready, returning hotels without prices.");

        // Set price to null for all hotels
        const merged = hotels.map(h => ({ ...h, price: null }));

        // Cache raw hotels immediately
        searchCache.set(cacheKey, { data: merged, timestamp: Date.now() });

        // Trigger background price fetching
        fetchPricesInBackground(cacheKey, pricesUrl.toString());

        console.timeEnd("🟡 Fetch Raw Data");

        // Return hotels without prices (202 Accepted)
        return res.status(202).json(paginate(merged, pageNum, limitNum));
      }

      // Merge hotels with prices (if prices ready)
      const priceMap = new Map();
      priceData.hotels?.forEach(({ id, price }) => {
        if (typeof price === "number") priceMap.set(id, price);
      });

      const merged = hotels.map(h => ({
        ...h,
        price: priceMap.get(h.id) ?? null
      }));

      rawData = merged;

      // Cache merged data
      searchCache.set(cacheKey, { data: rawData, timestamp: Date.now() });

      console.timeEnd("🟡 Fetch Raw Data");
    }

    // Apply filters
    let filtered = rawData.filter(hotel => {
      const ratingOk = !starRating || hotel.rating >= Number(starRating);
      const guestScore = hotel.trustyou?.score?.overall ?? 0;
      const guestOk = !guestRating || guestScore >= Number(guestRating);
      const priceOk = hotel.price === null || (hotel.price >= minPriceNum && hotel.price <= maxPriceNum);
      return ratingOk && guestOk && priceOk;
    });

    // Sort dynamically
    filtered = filtered.sort((a, b) => {
      if (sortBy === "price") return (a.price ?? Infinity) - (b.price ?? Infinity);
      if (sortBy === "guestRating") {
        const aScore = a.trustyou?.score?.overall || 0;
        const bScore = b.trustyou?.score?.overall || 0;
        return bScore - aScore;
      }
      return b.rating - a.rating;
    });

    // Return paginated response
    return res.json(paginate(filtered, pageNum, limitNum));

  } catch (err) {
    console.error("❌ Backend error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

module.exports = { getFilteredHotels, searchCache };
