async function getFilteredHotels(req, res) {
  const {
    uid: destination_id,
    checkin,
    checkout,
    starRating,
    guestRating,
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
  const guests = Number(adults) + Number(children);
  const minPriceNum = minPrice ? Number(minPrice) : 0;
  const maxPriceNum = maxPrice ? Number(maxPrice) : Infinity;

  try {
    console.time("🟡 Total");

    // Step 1: Construct URLs
    const hotelUrl = `https://hotelapi.loyalty.dev/api/hotels?destination_id=${destination_id}`;

    const pricesUrl = new URL("https://hotelapi.loyalty.dev/api/hotels/prices");
    pricesUrl.searchParams.set("destination_id", destination_id);
    pricesUrl.searchParams.set("checkin", checkin);
    pricesUrl.searchParams.set("checkout", checkout);
    pricesUrl.searchParams.set("guests", guests);
    pricesUrl.searchParams.set("lang", "en_US");
    pricesUrl.searchParams.set("currency", "SGD");
    pricesUrl.searchParams.set("country_code", "SG");
    pricesUrl.searchParams.set("partner_id", "1");

    // Step 2: Fetch hotel & price data
    console.time("🌐 Fetch APIs");
    const [hotelResp, priceResp] = await Promise.all([
      fetch(hotelUrl),
      fetch(pricesUrl.toString())
    ]);
    const hotelText = await hotelResp.text();
    const priceText = await priceResp.text();
    console.timeEnd("🌐 Fetch APIs");

    if (!hotelResp.ok) {
      return res.status(hotelResp.status).json({ error: "Hotel API error", details: hotelText });
    }

    if (!priceResp.ok) {
      return res.status(priceResp.status).json({ error: "Price API error", details: priceText });
    }

    const hotelData = JSON.parse(hotelText);
    let priceData = JSON.parse(priceText);

    // Step 3: Retry if prices not ready
    const MAX_RETRIES = 2;
    const RETRY_DELAY_MS = 300;

    console.time("🔁 Price Retry Check");
    for (let attempt = 1; attempt <= MAX_RETRIES && !priceData.completed; attempt++) {
      console.log(`⏳ Prices not ready. Retry ${attempt}/${MAX_RETRIES}`);
      await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));

      const retryResp = await fetch(pricesUrl.toString());
      const retryText = await retryResp.text();

      if (!retryResp.ok) {
        return res.status(retryResp.status).json({ error: "Price API retry error", details: retryText });
      }

      try {
        priceData = JSON.parse(retryText);
      } catch {
        return res.status(500).json({ error: "Failed to parse retry price response" });
      }

      if (priceData.completed) break;
    }
    console.timeEnd("🔁 Price Retry Check");

    if (!priceData.completed) {
      return res.status(202).json({ error: "Prices not ready after retries. Try again later." });
    }

    // Step 4: Filter by star & guest rating
    console.time("🔍 Filter by rating");
    let hotels = Array.isArray(hotelData) ? hotelData : hotelData.hotels || [];
    hotels = hotels.filter((hotel) => {
      const ratingOk = !starRating || hotel.rating >= Number(starRating);
      const guestScore = hotel.trustyou?.score?.overall ?? 0;
      const guestOk = !guestRating || guestScore >= Number(guestRating);
      return ratingOk && guestOk;
    });
    console.timeEnd("🔍 Filter by rating");

    // Step 5: Filter by price
    console.time("💰 Filter by price");
    const priceMap = new Map();
    priceData.hotels.forEach(({ id, price }) => {
      if (typeof price === "number" && price >= minPriceNum && price <= maxPriceNum) {
        priceMap.set(id, price);
      }
    });

    const merged = hotels
      .filter(h => priceMap.has(h.id))
      .map(h => ({
        ...h,
        price: priceMap.get(h.id),
      }));
    console.timeEnd("💰 Filter by price");

    // Step 6: Sort
    console.time("🔢 Sorting");
    const sorted = merged.sort((a, b) => {
      if (sortBy === "price") return b.price - a.price;
      if (sortBy === "guestRating") {
        const aScore = a.trustyou?.score?.overall || 0;
        const bScore = b.trustyou?.score?.overall || 0;
        return bScore - aScore;
      }
      return b.rating - a.rating;
    });
    console.timeEnd("🔢 Sorting");

    // Step 7: Pagination
    console.time("📄 Pagination");
    const paged = sorted.slice(offset, offset + limitNum);
    console.timeEnd("📄 Pagination");

    // Step 8: Format hotels before sending
    // const formattedHotels = paged.map((h) => ({
    //   id: h.id,
    //   name: h.name,
    //   price: h.price || 0,
    //   rating: h.rating,
    //   guestRating: h.trustyou?.score?.overall || 0,
    //   imageUrl:
    //     h.image_details && h.image_details.prefix && h.image_details.suffix
    //       ? `${h.image_details.prefix}${h.default_image_index ?? 0}${h.image_details.suffix}`
    //       : null,
    //   latitude: h.latitude ?? null,
    //   longitude: h.longitude ?? null,
    // }));

    console.timeEnd("🟡 Total");

    return res.json({
      hotels: paged,
      total: sorted.length,
      page: pageNum,
      limit: limitNum,
      hasMore: offset + limitNum < sorted.length,
    });
  } catch (err) {
    console.error("❌ Backend error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

module.exports = { getFilteredHotels };