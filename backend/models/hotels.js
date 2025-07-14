// Get hotels ids from api
async function getHotelsByDestinationId(req, res) {
  const { destination_id } = req.query;

  if (!destination_id) {
    return res.status(400).json({ error: 'Missing destination_id' });
  }

  try {
    const response = await fetch(`https://hotelapi.loyalty.dev/api/hotels?destination_id=${destination_id}`);

    if (!response.ok) {
      return res.status(response.status).json({ error: 'Failed to fetch hotels from external API' });
    }

    const hotels = await response.json();
    return res.json(hotels);
  } catch (err) {
    console.error('Error fetching hotels:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function getHotelPricesById(req, res) {
  const { id } = req.params; // hotel ID from URL param
  const queryParams = req.query; // all query params (destination_id, checkin, checkout, etc)

  if (!id) {
    return res.status(400).json({ error: 'Missing hotel id' });
  }

  try {
    const queryString = new URLSearchParams(queryParams).toString();
    const externalUrl = `https://hotelapi.loyalty.dev/api/hotels/${id}/price?${queryString}`;

    // 👇 Log outgoing request for debugging
    console.log("🔍 Fetching hotel price from:", externalUrl);

    const response = await fetch(externalUrl);

    // 👇 Log status code and raw response body
    const text = await response.text();  // read body as raw text
    console.log("🌐 Status:", response.status);
    console.log("📄 Response body:", text);

    if (!response.ok) {
      return res.status(response.status).json({ error: 'Failed to fetch hotel prices from external API' });
    }

    // 👇 Then parse the text to JSON
    const priceData = JSON.parse(text);
    return res.json(priceData);
  } catch (err) {
    console.error('🔥 Error fetching hotel prices:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function getBulkHotelPrices(req, res) {
  const { destination_id, checkin, checkout, guests } = req.query;

  if (!destination_id || !checkin || !checkout || !guests) {
    return res.status(400).json({ error: 'Missing required query parameters' });
  }

  try {
    const response = await fetch(
      `https://hotelapi.loyalty.dev/api/hotels/prices?destination_id=${destination_id}` +
      `&checkin=${checkin}&checkout=${checkout}&guests=${guests}&partner_id=1&lang=en_US&currency=SGD&country_code=SG`
    );

    const text = await response.text();
    console.log("🌐 Status:", response.status);
    console.log("📄 Bulk response body:", text);

    if (!response.ok) {
      return res.status(response.status).json({ error: 'Failed to fetch bulk prices from external API' });
    }

    const pricesData = JSON.parse(text);
    return res.json(pricesData);
  } catch (err) {
    console.error('🔥 Error fetching bulk hotel prices:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}


module.exports = { getHotelsByDestinationId, getHotelPricesById, getBulkHotelPrices };
