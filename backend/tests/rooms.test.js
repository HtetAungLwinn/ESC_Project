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
});
