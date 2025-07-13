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

module.exports = { getHotelsByDestinationId };
