// Get rooms ids from api
async function getRoomsByHotelId(req, res) {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ error: 'Missing hotel id' });
  }

  try {
    const response = await fetch(`https://hotelapi.loyalty.dev/api/hotels/${id}`);

    if (!response.ok) {
      return res.status(response.status).json({ error: 'Failed to fetch rooms from external API' });
    }

    const rooms = await response.json();
    return res.json(rooms);
  } catch (err) {
    console.error('Error fetching rooms:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function getBulkRoomPrices(req, res) {
  const { destination_id, checkin, checkout, guests } = req.query;
  const { id } = req.params;

  if (!destination_id || !checkin || !checkout || !guests) {
    return res.status(400).json({ error: 'Missing required query parameters' });
  }

  if (!id) {
    return res.status(400).json({ error: 'Missing hotel id' });
  }

  const url = `https://hotelapi.loyalty.dev/api/hotels/${id}/price?destination_id=${destination_id}` +
              `&checkin=${checkin}&checkout=${checkout}&lang=en_US&currency=SGD&country_code=SG` +
              `&guests=${guests}&partner_id=1089&landing_page=wl-acme-earn&product_type=earn`;

  try {
    const MAX_RETRIES = 10;
    const RETRY_INTERVAL_MS = 1500; // 1.5 seconds

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      console.log(`Attempt ${attempt} fetching bulk room prices from: ${url}`);

      const response = await fetch(url);
      const text = await response.text();

      console.log("Status:", response.status);
      console.log("Raw response body:", text);

      if (!response.ok) {
        return res.status(response.status).json({
          error: 'Failed to fetch bulk prices from external API',
          details: text
        });
      }

      let data;
      try {
        data = JSON.parse(text);
      } catch (jsonError) {
        console.error("JSON parse error:", jsonError);
        return res.status(500).json({ error: "Failed to parse response from external API" });
      }

      // Check if API call is complete
      if (data.completed) {
        console.log("Data ready, returning prices");
        return res.json(data);
      } else {
        console.log("Data not ready yet, retrying after delay...");
        await new Promise(resolve => setTimeout(resolve, RETRY_INTERVAL_MS));
      }
    }

    // After max retries, return partial or empty response
    return res.status(202).json({ 
      error: 'Data not ready after multiple retries, please try again later.' 
    });

  } catch (err) {
    console.error('Error fetching bulk hotel prices:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = { getRoomsByHotelId, getBulkRoomPrices };
