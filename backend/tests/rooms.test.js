// tests/rooms.test.js

const { getRoomsByHotelId, getBulkRoomPrices } = require('../models/rooms');
const httpMocks = require('node-mocks-http');
const path = require('path');

const hotelDetails = require(path.resolve(__dirname, './mockData/hotelDetails.json'));
const roomDetails = require(path.resolve(__dirname, './mockData/roomDetails.json'));

global.fetch = jest.fn();

describe('getRoomsByHotelId', () => {
  afterEach(() => {
    fetch.mockClear();
  });

  test('returns 400 if hotel id is missing', async () => {
    const req = httpMocks.createRequest({ params: {} });
    const res = httpMocks.createResponse();

    await getRoomsByHotelId(req, res);

    expect(res.statusCode).toBe(400);
    expect(res._getJSONData()).toEqual({ error: 'Missing hotel id' });
  });

  test('returns 200 and hotel details from external API', async () => {
    fetch.mockResolvedValue({
      ok: true,
      json: async () => hotelDetails,
    });

    const req = httpMocks.createRequest({ params: { id: 'jOZC' } });
    const res = httpMocks.createResponse();

    await getRoomsByHotelId(req, res);

    expect(fetch).toHaveBeenCalledWith('https://hotelapi.loyalty.dev/api/hotels/jOZC');
    expect(res.statusCode).toBe(200);
    expect(res._getJSONData()).toEqual(hotelDetails);
  });

  test('returns 502 if external API fails', async () => {
    fetch.mockResolvedValue({
      ok: false,
      status: 502
    });

    const req = httpMocks.createRequest({ params: { id: 'jOZC' } });
    const res = httpMocks.createResponse();

    await getRoomsByHotelId(req, res);

    expect(res.statusCode).toBe(502);
    expect(res._getJSONData()).toEqual({ error: 'Failed to fetch rooms from external API' });
  });

  test('returns 500 if fetch throws an error', async () => {
    fetch.mockRejectedValue(new Error('Network error'));

    const req = httpMocks.createRequest({ params: { id: 'jOZC' } });
    const res = httpMocks.createResponse();

    await getRoomsByHotelId(req, res);

    expect(res.statusCode).toBe(500);
    expect(res._getJSONData()).toHaveProperty('error', 'Internal server error');
  });

  test('checks does hotel id exist', async () => {
    fetch.mockResolvedValue({
      ok: true,
      json: async () => hotelDetails,
    });

    const req = httpMocks.createRequest({ params: { id: 'jOZC' } });
    const res = httpMocks.createResponse();

    await getRoomsByHotelId(req, res);

    const data = res._getJSONData();

    expect(res.statusCode).toBe(200);
    expect(data).toHaveProperty('id');
    expect(data).toEqual(hotelDetails);
  });

  test('returns hotel id correctly', async () => {
    fetch.mockResolvedValue({
      ok: true,
      json: async () => hotelDetails,
    });

    const req = httpMocks.createRequest({ params: { id: 'jOZC' } });
    const res = httpMocks.createResponse();

    await getRoomsByHotelId(req, res);

    const data = res._getJSONData();

    expect(res.statusCode).toBe(200);
    expect(data.id).toBe('jOZC');
    expect(data).toEqual(hotelDetails);
  });

  test('checks does hotel name exist', async () => {
    fetch.mockResolvedValue({
      ok: true,
      json: async () => hotelDetails,
    });

    const req = httpMocks.createRequest({ params: { id: 'jOZC' } });
    const res = httpMocks.createResponse();

    await getRoomsByHotelId(req, res);

    const data = res._getJSONData();

    expect(res.statusCode).toBe(200);
    expect(data).toHaveProperty('name');
    expect(data).toEqual(hotelDetails);
  });

  test('returns hotel name correctly', async () => {
    fetch.mockResolvedValue({
      ok: true,
      json: async () => hotelDetails,
    });

    const req = httpMocks.createRequest({ params: { id: 'jOZC' } });
    const res = httpMocks.createResponse();

    await getRoomsByHotelId(req, res);

    const data = res._getJSONData();

    expect(res.statusCode).toBe(200);
    expect(data.name).toBe('Park Avenue Rochester');
    expect(data).toEqual(hotelDetails);
  });

  test('checks does hotel latitude exist', async () => {
    fetch.mockResolvedValue({
      ok: true,
      json: async () => hotelDetails,
    });

    const req = httpMocks.createRequest({ params: { id: 'jOZC' } });
    const res = httpMocks.createResponse();

    await getRoomsByHotelId(req, res);

    const data = res._getJSONData();

    expect(res.statusCode).toBe(200);
    expect(data).toHaveProperty('latitude');
    expect(data).toEqual(hotelDetails);
  });

  test('returns hotel latitude correctly', async () => {
    fetch.mockResolvedValue({
      ok: true,
      json: async () => hotelDetails,
    });

    const req = httpMocks.createRequest({ params: { id: 'jOZC' } });
    const res = httpMocks.createResponse();

    await getRoomsByHotelId(req, res);

    const data = res._getJSONData();

    expect(res.statusCode).toBe(200);
    expect(data.latitude).toBe(1.3049);
    expect(data).toEqual(hotelDetails);
  });

  test('checks does hotel longitude exist', async () => {
    fetch.mockResolvedValue({
      ok: true,
      json: async () => hotelDetails,
    });

    const req = httpMocks.createRequest({ params: { id: 'jOZC' } });
    const res = httpMocks.createResponse();

    await getRoomsByHotelId(req, res);

    const data = res._getJSONData();

    expect(res.statusCode).toBe(200);
    expect(data).toHaveProperty('longitude');
    expect(data).toEqual(hotelDetails);
  });

  test('returns hotel longitude correctly', async () => {
    fetch.mockResolvedValue({
      ok: true,
      json: async () => hotelDetails,
    });

    const req = httpMocks.createRequest({ params: { id: 'jOZC' } });
    const res = httpMocks.createResponse();

    await getRoomsByHotelId(req, res);

    const data = res._getJSONData();

    expect(res.statusCode).toBe(200);
    expect(data.longitude).toBe(103.788184);
    expect(data).toEqual(hotelDetails);
  });

  test('checks does hotel address exist', async () => {
    fetch.mockResolvedValue({
      ok: true,
      json: async () => hotelDetails,
    });

    const req = httpMocks.createRequest({ params: { id: 'jOZC' } });
    const res = httpMocks.createResponse();

    await getRoomsByHotelId(req, res);

    const data = res._getJSONData();

    expect(res.statusCode).toBe(200);
    expect(data).toHaveProperty('address');
    expect(data).toEqual(hotelDetails);
  });

  test('returns hotel address correctly', async () => {
    fetch.mockResolvedValue({
      ok: true,
      json: async () => hotelDetails,
    });

    const req = httpMocks.createRequest({ params: { id: 'jOZC' } });
    const res = httpMocks.createResponse();

    await getRoomsByHotelId(req, res);

    const data = res._getJSONData();

    expect(res.statusCode).toBe(200);
    expect(data.address).toBe('31 Rochester Drive');
    expect(data).toEqual(hotelDetails);
  });

  test('checks does hotel rating exist', async () => {
    fetch.mockResolvedValue({
      ok: true,
      json: async () => hotelDetails,
    });

    const req = httpMocks.createRequest({ params: { id: 'jOZC' } });
    const res = httpMocks.createResponse();

    await getRoomsByHotelId(req, res);

    const data = res._getJSONData();

    expect(res.statusCode).toBe(200);
    expect(data).toHaveProperty('rating');
    expect(data).toEqual(hotelDetails);
  });

  test('returns hotel rating correctly', async () => {
    fetch.mockResolvedValue({
      ok: true,
      json: async () => hotelDetails,
    });

    const req = httpMocks.createRequest({ params: { id: 'jOZC' } });
    const res = httpMocks.createResponse();

    await getRoomsByHotelId(req, res);

    const data = res._getJSONData();

    expect(res.statusCode).toBe(200);
    expect(data.rating).toBe(4);
    expect(data).toEqual(hotelDetails);
  });

  test('checks does hotel categories exist', async () => {
    fetch.mockResolvedValue({
      ok: true,
      json: async () => hotelDetails,
    });

    const req = httpMocks.createRequest({ params: { id: 'jOZC' } });
    const res = httpMocks.createResponse();

    await getRoomsByHotelId(req, res);

    const data = res._getJSONData();

    expect(res.statusCode).toBe(200);
    expect(data).toHaveProperty('categories');
    expect(data).toEqual(hotelDetails);
  });

  test('returns hotel categories correctly', async () => {
    fetch.mockResolvedValue({
      ok: true,
      json: async () => hotelDetails,
    });

    const req = httpMocks.createRequest({ params: { id: 'jOZC' } });
    const res = httpMocks.createResponse();

    await getRoomsByHotelId(req, res);

    const data = res._getJSONData();

    expect(res.statusCode).toBe(200);
    expect(data.categories).toEqual({});
    expect(data).toEqual(hotelDetails);
  });

  test('checks does hotel description exist', async () => {
    fetch.mockResolvedValue({
      ok: true,
      json: async () => hotelDetails,
    });

    const req = httpMocks.createRequest({ params: { id: 'jOZC' } });
    const res = httpMocks.createResponse();

    await getRoomsByHotelId(req, res);

    const data = res._getJSONData();

    expect(res.statusCode).toBe(200);
    expect(data).toHaveProperty('description');
    expect(data).toEqual(hotelDetails);
  });

  test('returns hotel description correctly', async () => {
    fetch.mockResolvedValue({
      ok: true,
      json: async () => hotelDetails,
    });

    const req = httpMocks.createRequest({ params: { id: 'jOZC' } });
    const res = httpMocks.createResponse();

    await getRoomsByHotelId(req, res);

    const data = res._getJSONData();

    expect(res.statusCode).toBe(200);
    expect(data.description).toContain("Don't miss out on recreational opportunities");
    expect(data).toEqual(hotelDetails);
  });

  test('checks does hotel amenities exist', async () => {
    fetch.mockResolvedValue({
      ok: true,
      json: async () => hotelDetails,
    });

    const req = httpMocks.createRequest({ params: { id: 'jOZC' } });
    const res = httpMocks.createResponse();

    await getRoomsByHotelId(req, res);

    const data = res._getJSONData();

    expect(res.statusCode).toBe(200);
    expect(data).toHaveProperty('amenities');
    expect(data).toEqual(hotelDetails);
  });

  test('returns hotel amenities correctly', async () => {
    fetch.mockResolvedValue({
      ok: true,
      json: async () => hotelDetails,
    });

    const req = httpMocks.createRequest({ params: { id: 'jOZC' } });
    const res = httpMocks.createResponse();

    await getRoomsByHotelId(req, res);

    const data = res._getJSONData();

    expect(res.statusCode).toBe(200);
    expect(data.amenities).toEqual({
      inHouseBar: true,
      fitnessFacility: true,
      inHouseDining: true,
      dryCleaning: true,
      outdoorPool: true,
      nonSmokingRooms: true,
      continentalBreakfast: true,
      airportTransportation: true
    });
    expect(data).toEqual(hotelDetails);
  });

  test('checks does hotel image details exist', async () => {
    fetch.mockResolvedValue({
      ok: true,
      json: async () => hotelDetails,
    });

    const req = httpMocks.createRequest({ params: { id: 'jOZC' } });
    const res = httpMocks.createResponse();

    await getRoomsByHotelId(req, res);

    const data = res._getJSONData();

    expect(res.statusCode).toBe(200);
    expect(data).toHaveProperty('image_details');
    expect(data).toEqual(hotelDetails);
  });

  test('returns hotel image count correctly', async () => {
    fetch.mockResolvedValue({
      ok: true,
      json: async () => hotelDetails,
    });

    const req = httpMocks.createRequest({ params: { id: 'jOZC' } });
    const res = httpMocks.createResponse();

    await getRoomsByHotelId(req, res);

    const data = res._getJSONData();

    expect(res.statusCode).toBe(200);
    expect(data.image_details.count).toBe(69);
    expect(data).toEqual(hotelDetails);
  });
});

describe('getBulkRoomPrices', () => {
  const baseQuery = {
    destination_id: 'RsBU',
    checkin: '2025-10-10',
    checkout: '2025-10-17',
    guests: '2',
  };

  afterEach(() => {
    fetch.mockClear();
    jest.clearAllMocks();
  });

  test('returns 400 if query parameters are missing', async () => {
    const req = httpMocks.createRequest({ query: {}, params: {} });
    const res = httpMocks.createResponse();

    await getBulkRoomPrices(req, res);

    expect(res.statusCode).toBe(400);
    expect(res._getJSONData()).toHaveProperty('error');
  });
  
  test('returns 400 if hotel id is missing', async () => {
    const req = httpMocks.createRequest({ query: baseQuery, params: {} });
    const res = httpMocks.createResponse();

    await getBulkRoomPrices(req, res);

    expect(res.statusCode).toBe(400);
    expect(res._getJSONData()).toHaveProperty('error', 'Missing hotel id');
  });
  
  test('returns 200 and room details when completed is true', async () => {
    fetch.mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => JSON.stringify(roomDetails)
    });

    const req = httpMocks.createRequest({ query: baseQuery, params: { id: 'jOZC' } });
    const res = httpMocks.createResponse();

    // Speed up test by mocking delay
    jest.spyOn(global, 'setTimeout').mockImplementation((fn) => fn());

    await getBulkRoomPrices(req, res);

    expect(res.statusCode).toBe(200);
    expect(res._getJSONData()).toEqual(roomDetails);
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/hotels/jOZC/price'));
  });

  test('returns 202 after retries if not completed', async () => {
    fetch.mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => JSON.stringify({ completed: false })
    });

    const req = httpMocks.createRequest({ query: baseQuery, params: { id: 'jOZC' } });
    const res = httpMocks.createResponse();

    // Speed up test by mocking delay
    jest.spyOn(global, 'setTimeout').mockImplementation((fn) => fn());

    await getBulkRoomPrices(req, res);

    expect(fetch).toHaveBeenCalledTimes(10);
    expect(res.statusCode).toBe(202);
    expect(res._getJSONData()).toHaveProperty('error');
  });

  test('returns 500 if fetch throws error', async () => {
    fetch.mockRejectedValue(new Error('Fetch failed'));

    const req = httpMocks.createRequest({
      query: baseQuery,
      params: { id: 'jOZC' }
    });

    const res = httpMocks.createResponse();

    await getBulkRoomPrices(req, res);

    expect(res.statusCode).toBe(500);
    expect(res._getJSONData()).toHaveProperty('error', 'Internal server error');
  });

  test('returns 500 if response is invalid JSON', async () => {
    fetch.mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => "not valid json"
    });

    const req = httpMocks.createRequest({
      query: baseQuery,
      params: { id: 'jOZC' }
    });

    const res = httpMocks.createResponse();

    await getBulkRoomPrices(req, res);

    expect(res.statusCode).toBe(500);
    expect(res._getJSONData()).toHaveProperty('error', 'Failed to parse response from external API');
  });

  test('returns 400 if response.ok is false', async () => {
    fetch.mockResolvedValue({
      ok: false,
      status: 400,
      text: async () => 'Bad request'
    });

    const req = httpMocks.createRequest({
      query: baseQuery,
      params: { id: 'jOZC' }
    });

    const res = httpMocks.createResponse();

    await getBulkRoomPrices(req, res);

    expect(res.statusCode).toBe(400);
    expect(res._getJSONData()).toEqual({
      error: 'Failed to fetch bulk prices from external API',
      details: 'Bad request'
    });
  });  

  test('checks does rooms exist', async () => {
    fetch.mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => JSON.stringify(roomDetails),
    });

    const req = httpMocks.createRequest({ query: baseQuery, params: { id: 'jOZC' } });
    const res = httpMocks.createResponse();

    // Speed up test by mocking delay
    jest.spyOn(global, 'setTimeout').mockImplementation((fn) => fn());

    await getBulkRoomPrices(req, res);

    const data = res._getJSONData();

    expect(res.statusCode).toBe(200);
    expect(data).toHaveProperty('rooms');
    expect(typeof data.rooms).toBe('object');
    expect(res._getJSONData()).toEqual(roomDetails);
  });

  test('checks does room key exist', async () => {
    fetch.mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => JSON.stringify(roomDetails),
    });

    const req = httpMocks.createRequest({ query: baseQuery, params: { id: 'jOZC' } });
    const res = httpMocks.createResponse();

    // Speed up test by mocking delay
    jest.spyOn(global, 'setTimeout').mockImplementation((fn) => fn());

    await getBulkRoomPrices(req, res);

    const data = res._getJSONData();

    expect(res.statusCode).toBe(200);
    expect(data.rooms[0]).toHaveProperty('key');
    expect(res._getJSONData()).toEqual(roomDetails);
  });

  test('returns room key correctly', async () => {
    fetch.mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => JSON.stringify(roomDetails),
    });

    const req = httpMocks.createRequest({ query: baseQuery, params: { id: 'jOZC' } });
    const res = httpMocks.createResponse();

    // Speed up test by mocking delay
    jest.spyOn(global, 'setTimeout').mockImplementation((fn) => fn());

    await getBulkRoomPrices(req, res);

    const data = res._getJSONData();

    expect(res.statusCode).toBe(200);
    expect(data.rooms[0].key).toBe('d898dc2d-8e07-548a-b5bd-979bd5766d9a');
    expect(res._getJSONData()).toEqual(roomDetails);
  });

  test('checks does room roomNormlizedDescription exist', async () => {
    fetch.mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => JSON.stringify(roomDetails),
    });

    const req = httpMocks.createRequest({ query: baseQuery, params: { id: 'jOZC' } });
    const res = httpMocks.createResponse();

    // Speed up test by mocking delay
    jest.spyOn(global, 'setTimeout').mockImplementation((fn) => fn());

    await getBulkRoomPrices(req, res);

    const data = res._getJSONData();

    expect(res.statusCode).toBe(200);
    expect(data.rooms[0]).toHaveProperty('roomNormalizedDescription');
    expect(res._getJSONData()).toEqual(roomDetails);
  });

  test('returns room roomNormlizedDescription correctly', async () => {
    fetch.mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => JSON.stringify(roomDetails),
    });

    const req = httpMocks.createRequest({ query: baseQuery, params: { id: 'jOZC' } });
    const res = httpMocks.createResponse();

    // Speed up test by mocking delay
    jest.spyOn(global, 'setTimeout').mockImplementation((fn) => fn());

    await getBulkRoomPrices(req, res);

    const data = res._getJSONData();

    expect(res.statusCode).toBe(200);
    expect(data.rooms[0].roomNormalizedDescription).toBe("Superior Double Or Twin Room 1 King Bed");
    expect(res._getJSONData()).toEqual(roomDetails);
  });

  test('checks does room free cancellation exist', async () => {
    fetch.mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => JSON.stringify(roomDetails),
    });

    const req = httpMocks.createRequest({ query: baseQuery, params: { id: 'jOZC' } });
    const res = httpMocks.createResponse();

    // Speed up test by mocking delay
    jest.spyOn(global, 'setTimeout').mockImplementation((fn) => fn());

    await getBulkRoomPrices(req, res);

    const data = res._getJSONData();

    expect(res.statusCode).toBe(200);
    expect(data.rooms[0]).toHaveProperty('free_cancellation');
    expect(res._getJSONData()).toEqual(roomDetails);
  });

  test('returns room free cancellation correctly', async () => {
    fetch.mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => JSON.stringify(roomDetails),
    });

    const req = httpMocks.createRequest({ query: baseQuery, params: { id: 'jOZC' } });
    const res = httpMocks.createResponse();

    // Speed up test by mocking delay
    jest.spyOn(global, 'setTimeout').mockImplementation((fn) => fn());

    await getBulkRoomPrices(req, res);

    const data = res._getJSONData();

    expect(res.statusCode).toBe(200);
    expect(data.rooms[0].free_cancellation).toBe(true);
    expect(res._getJSONData()).toEqual(roomDetails);
  });

  test('checks does room description exist', async () => {
    fetch.mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => JSON.stringify(roomDetails),
    });

    const req = httpMocks.createRequest({ query: baseQuery, params: { id: 'jOZC' } });
    const res = httpMocks.createResponse();

    // Speed up test by mocking delay
    jest.spyOn(global, 'setTimeout').mockImplementation((fn) => fn());

    await getBulkRoomPrices(req, res);

    const data = res._getJSONData();

    expect(res.statusCode).toBe(200);
    expect(data.rooms[0]).toHaveProperty('description');
    expect(res._getJSONData()).toEqual(roomDetails);
  });

  test('returns room description correctly', async () => {
    fetch.mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => JSON.stringify(roomDetails),
    });

    const req = httpMocks.createRequest({ query: baseQuery, params: { id: 'jOZC' } });
    const res = httpMocks.createResponse();

    // Speed up test by mocking delay
    jest.spyOn(global, 'setTimeout').mockImplementation((fn) => fn());

    await getBulkRoomPrices(req, res);

    const data = res._getJSONData();

    expect(res.statusCode).toBe(200);
    expect(data.rooms[0].description).toBe("Superior Double or Twin Room 1 King Bed");
    expect(res._getJSONData()).toEqual(roomDetails);
  });

  test('checks does room long_description exist', async () => {
    fetch.mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => JSON.stringify(roomDetails),
    });

    const req = httpMocks.createRequest({ query: baseQuery, params: { id: 'jOZC' } });
    const res = httpMocks.createResponse();

    // Speed up test by mocking delay
    jest.spyOn(global, 'setTimeout').mockImplementation((fn) => fn());

    await getBulkRoomPrices(req, res);

    const data = res._getJSONData();

    expect(res.statusCode).toBe(200);
    expect(data.rooms[0]).toHaveProperty('long_description');
    expect(res._getJSONData()).toEqual(roomDetails);
  });

  test('returns room long_description correctly', async () => {
    fetch.mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => JSON.stringify(roomDetails),
    });

    const req = httpMocks.createRequest({ query: baseQuery, params: { id: 'jOZC' } });
    const res = httpMocks.createResponse();

    // Speed up test by mocking delay
    jest.spyOn(global, 'setTimeout').mockImplementation((fn) => fn());

    await getBulkRoomPrices(req, res);

    const data = res._getJSONData();

    expect(res.statusCode).toBe(200);
    expect(data.rooms[0].long_description).toContain("1 King Bed OR 2 Twin Beds");
    expect(res._getJSONData()).toEqual(roomDetails);
  });

  test('checks does room images exist', async () => {
    fetch.mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => JSON.stringify(roomDetails),
    });

    const req = httpMocks.createRequest({ query: baseQuery, params: { id: 'jOZC' } });
    const res = httpMocks.createResponse();

    // Speed up test by mocking delay
    jest.spyOn(global, 'setTimeout').mockImplementation((fn) => fn());

    await getBulkRoomPrices(req, res);

    const data = res._getJSONData();

    expect(res.statusCode).toBe(200);
    expect(data.rooms[0]).toHaveProperty('images');
    expect(res._getJSONData()).toEqual(roomDetails);
  });

  test('returns room images correctly', async () => {
    fetch.mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => JSON.stringify(roomDetails),
    });

    const req = httpMocks.createRequest({ query: baseQuery, params: { id: 'jOZC' } });
    const res = httpMocks.createResponse();

    // Speed up test by mocking delay
    jest.spyOn(global, 'setTimeout').mockImplementation((fn) => fn());

    await getBulkRoomPrices(req, res);

    const data = res._getJSONData();

    expect(res.statusCode).toBe(200);
    expect(data.rooms[0].images).toStrictEqual([
      {
          "url": "https://i.travelapi.com/lodging/5000000/4720000/4715700/4715695/68404fde_b.jpg",
          "high_resolution_url": "https://i.travelapi.com/lodging/5000000/4720000/4715700/4715695/68404fde_z.jpg",
          "hero_image": true
        },
        {
          "url": "https://i.travelapi.com/lodging/5000000/4720000/4715700/4715695/1162b969_b.jpg",
          "high_resolution_url": "https://i.travelapi.com/lodging/5000000/4720000/4715700/4715695/1162b969_z.jpg",
          "hero_image": false
        },
        {
          "url": "https://i.travelapi.com/lodging/5000000/4720000/4715700/4715695/95ba8298_b.jpg",
          "high_resolution_url": "https://i.travelapi.com/lodging/5000000/4720000/4715700/4715695/95ba8298_z.jpg",
          "hero_image": false
        },
        {
          "url": "https://i.travelapi.com/lodging/5000000/4720000/4715700/4715695/0a5af278_b.jpg",
          "high_resolution_url": "https://i.travelapi.com/lodging/5000000/4720000/4715700/4715695/0a5af278_z.jpg",
          "hero_image": false
        }
    ]);
    expect(res._getJSONData()).toEqual(roomDetails);
  });

  test('checks does room amenities exist', async () => {
    fetch.mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => JSON.stringify(roomDetails),
    });

    const req = httpMocks.createRequest({ query: baseQuery, params: { id: 'jOZC' } });
    const res = httpMocks.createResponse();

    // Speed up test by mocking delay
    jest.spyOn(global, 'setTimeout').mockImplementation((fn) => fn());

    await getBulkRoomPrices(req, res);

    const data = res._getJSONData();

    expect(res.statusCode).toBe(200);
    expect(data.rooms[0]).toHaveProperty('amenities');
    expect(res._getJSONData()).toEqual(roomDetails);
  });

  test('returns room amenities correctly', async () => {
    fetch.mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => JSON.stringify(roomDetails),
    });

    const req = httpMocks.createRequest({ query: baseQuery, params: { id: 'jOZC' } });
    const res = httpMocks.createResponse();

    // Speed up test by mocking delay
    jest.spyOn(global, 'setTimeout').mockImplementation((fn) => fn());

    await getBulkRoomPrices(req, res);

    const data = res._getJSONData();

    expect(res.statusCode).toBe(200);
    expect(data.rooms[0].amenities).toStrictEqual([
      "Air conditioning",
        "Electric kettle",
        "Towels provided",
        "Bedsheets provided",
        "Laptop-friendly workspace",
        "Mini-fridge",
        "Minibar",
        "Coffee/tea maker",
        "Daily housekeeping",
        "Phone",
        "Private bathroom",
        "Hair dryer",
        "Iron/ironing board",
        "In-room safe",
        "Desk",
        "Room service",
        "Wireless internet access",
        "Slippers",
        "Bathtub only",
        "Cable TV service",
        "Free WiFi",
        "LED TV",
        "Non-Smoking"
    ]);
    expect(res._getJSONData()).toEqual(roomDetails);
  });

  test('checks does room converted_price exist', async () => {
    fetch.mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => JSON.stringify(roomDetails),
    });

    const req = httpMocks.createRequest({ query: baseQuery, params: { id: 'jOZC' } });
    const res = httpMocks.createResponse();

    // Speed up test by mocking delay
    jest.spyOn(global, 'setTimeout').mockImplementation((fn) => fn());

    await getBulkRoomPrices(req, res);

    const data = res._getJSONData();

    expect(res.statusCode).toBe(200);
    expect(data.rooms[0]).toHaveProperty('converted_price');
    expect(res._getJSONData()).toEqual(roomDetails);
  });

  test('returns room converted_price correctly', async () => {
    fetch.mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => JSON.stringify(roomDetails),
    });

    const req = httpMocks.createRequest({ query: baseQuery, params: { id: 'jOZC' } });
    const res = httpMocks.createResponse();

    // Speed up test by mocking delay
    jest.spyOn(global, 'setTimeout').mockImplementation((fn) => fn());

    await getBulkRoomPrices(req, res);

    const data = res._getJSONData();

    expect(res.statusCode).toBe(200);
    expect(data.rooms[0].converted_price).toBe(2898.44);
    expect(res._getJSONData()).toEqual(roomDetails);
  });

  test('checks does room market_rates exist', async () => {
    fetch.mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => JSON.stringify(roomDetails),
    });

    const req = httpMocks.createRequest({ query: baseQuery, params: { id: 'jOZC' } });
    const res = httpMocks.createResponse();

    // Speed up test by mocking delay
    jest.spyOn(global, 'setTimeout').mockImplementation((fn) => fn());

    await getBulkRoomPrices(req, res);

    const data = res._getJSONData();

    expect(res.statusCode).toBe(200);
    expect(data.rooms[0]).toHaveProperty('market_rates');
    expect(res._getJSONData()).toEqual(roomDetails);
  });

  test('returns room market_rates correctly', async () => {
    fetch.mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => JSON.stringify(roomDetails),
    });

    const req = httpMocks.createRequest({ query: baseQuery, params: { id: 'jOZC' } });
    const res = httpMocks.createResponse();

    // Speed up test by mocking delay
    jest.spyOn(global, 'setTimeout').mockImplementation((fn) => fn());

    await getBulkRoomPrices(req, res);

    const data = res._getJSONData();

    expect(res.statusCode).toBe(200);
    expect(data.rooms[0].market_rates).toStrictEqual([
      {
          "supplier": "expedia",
          "rate": 2509.4784227088
        }
    ]);
    expect(res._getJSONData()).toEqual(roomDetails);
  });

  test('checks does room roomAdditionalInfo exist', async () => {
    fetch.mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => JSON.stringify(roomDetails),
    });

    const req = httpMocks.createRequest({ query: baseQuery, params: { id: 'jOZC' } });
    const res = httpMocks.createResponse();

    // Speed up test by mocking delay
    jest.spyOn(global, 'setTimeout').mockImplementation((fn) => fn());

    await getBulkRoomPrices(req, res);

    const data = res._getJSONData();

    expect(res.statusCode).toBe(200);
    expect(data.rooms[0]).toHaveProperty('roomAdditionalInfo');
    expect(res._getJSONData()).toEqual(roomDetails);
  });

  test('returns room roomAdditionalInfo correctly', async () => {
    fetch.mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => JSON.stringify(roomDetails),
    });

    const req = httpMocks.createRequest({ query: baseQuery, params: { id: 'jOZC' } });
    const res = httpMocks.createResponse();

    // Speed up test by mocking delay
    jest.spyOn(global, 'setTimeout').mockImplementation((fn) => fn());

    await getBulkRoomPrices(req, res);

    const data = res._getJSONData();

    expect(res.statusCode).toBe(200);
    expect(data.rooms[0].roomAdditionalInfo).toStrictEqual({
      "breakfastInfo": "hotel_detail_room_only",
        "displayFields": {
          "special_check_in_instructions": "Front desk staff will greet guests on arrival at the property.",
          "check_in_instructions": "\u003Cul\u003E  \u003Cli\u003EExtra-person charges may apply and vary depending on property policy\u003C/li\u003E\u003Cli\u003EGovernment-issued photo identification and a credit card, debit card, or cash deposit may be required at check-in for incidental charges\u003C/li\u003E\u003Cli\u003ESpecial requests are subject to availability upon check-in and may incur additional charges; special requests cannot be guaranteed\u003C/li\u003E\u003Cli\u003EThis property accepts credit cards and cash\u003C/li\u003E  \u003C/ul\u003E",
          "know_before_you_go": "\u003Cul\u003E   \u003Cli\u003EOne child 12 years old or younger stays free when occupying the parent or guardian's room, using existing bedding. \u003C/li\u003E\u003Cli\u003ENo pets and no service animals are allowed at this property. \u003C/li\u003E\u003Cli\u003EParking height restrictions apply. \u003C/li\u003E \u003C/ul\u003E",
          "fees_optional": "\u003Cul\u003E \u003Cli\u003EFee for buffet breakfast: approximately SGD 35 for adults and SGD 22 for children\u003C/li\u003E\u003Cli\u003ECovered self parking fee: SGD 8 per night\u003C/li\u003E\u003C/ul\u003E \u003Cp\u003EThe above list may not be comprehensive. Fees and deposits may not include tax and are subject to change. \u003C/p\u003E",
          "fees_mandatory": null,
          "kaligo_service_fee": 295.52,
          "hotel_fees": [],
          "surcharges": [
            {
              "type": "TaxAndServiceFee",
              "amount": 316.46
            }
          ]
        }
    });
    expect(res._getJSONData()).toEqual(roomDetails);
  });

  test('checks does room breakfastInfo exist', async () => {
    fetch.mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => JSON.stringify(roomDetails),
    });

    const req = httpMocks.createRequest({ query: baseQuery, params: { id: 'jOZC' } });
    const res = httpMocks.createResponse();

    // Speed up test by mocking delay
    jest.spyOn(global, 'setTimeout').mockImplementation((fn) => fn());

    await getBulkRoomPrices(req, res);

    const data = res._getJSONData();

    expect(res.statusCode).toBe(200);
    expect(data.rooms[0].roomAdditionalInfo).toHaveProperty('breakfastInfo');
    expect(res._getJSONData()).toEqual(roomDetails);
  });

  test('returns room breakfastInfo correctly', async () => {
    fetch.mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => JSON.stringify(roomDetails),
    });

    const req = httpMocks.createRequest({ query: baseQuery, params: { id: 'jOZC' } });
    const res = httpMocks.createResponse();

    // Speed up test by mocking delay
    jest.spyOn(global, 'setTimeout').mockImplementation((fn) => fn());

    await getBulkRoomPrices(req, res);

    const data = res._getJSONData();

    expect(res.statusCode).toBe(200);
    expect(data.rooms[0].roomAdditionalInfo.breakfastInfo).toBe("hotel_detail_room_only");
    expect(res._getJSONData()).toEqual(roomDetails);
  });
});
