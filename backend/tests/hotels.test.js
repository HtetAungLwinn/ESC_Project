// Mock fetch globally
global.fetch = jest.fn();
console.log('fetch is', fetch);

const httpMocks = require('node-mocks-http');
const path = require('path');
const { getFilteredHotels, cache } = require('../models/hotels');

console.log('Global fetch in test:', global.fetch);

const hotelDetails = require(path.resolve(__dirname, './mockData/hotelsDetails.json'));
const priceDetails = require(path.resolve(__dirname, './mockData/priceDetails.json'));

describe('getFilteredHotels Controller', () => {
  let req, res;

  beforeEach(() => {
    cache.clear();
    jest.clearAllMocks();
    req = httpMocks.createRequest({
      method: 'GET',
      query: {
        uid: '123',
        checkin: '2025-08-15',
        checkout: '2025-08-20'
      }
    });
    res = httpMocks.createResponse();
  });

  const setFetchMockSequence = (...responses) => {
    fetch.mockReset();
    responses.forEach(r => {
      fetch.mockResolvedValueOnce({
        ok: r.ok !== false,
        status: r.status || 200,
        json: jest.fn().mockResolvedValue(r.json),
        text: jest.fn().mockResolvedValue(r.text || '')
      });
    });
  };

  test('returns 400 if missing required params', async () => {
    req.query = {};
    await getFilteredHotels(req, res);
    expect(res.statusCode).toBe(400);
    expect(res._getJSONData().error).toMatch(/Missing required parameters/);
  });

  test('returns data from cache if valid', async () => {
    const cacheKey = JSON.stringify({
      destination_id: '123',
      checkin: '2025-08-15',
      checkout: '2025-08-20',
      roomsNum: 1,
      adultsNum: 1,
      childrenNum: 0
    });
    const { cache } = require('../models/hotels');
    cache.set(cacheKey, { timestamp: Date.now(), data: [{ id: 1, rating: 5, price: 100 }] });

    await getFilteredHotels(req, res);
    const data = res._getJSONData();
    expect(data.hotels.length).toBe(1);
    expect(data.hotels[0].price).toBe(100);
  });

  test('fetches hotels and prices if cache miss', async () => {
    setFetchMockSequence(
      { json: hotelDetails }, // hotelResp
      { json: { completed: true, hotels: priceDetails.hotels } } // priceResp
    );

    await getFilteredHotels(req, res);
    const data = res._getJSONData();
    expect(fetch).toHaveBeenCalledTimes(2);
    expect(data.hotels[0]).toHaveProperty('price');
  });

  test('retries when prices incomplete', async () => {
    setFetchMockSequence(
      { json: hotelDetails },
      { json: { completed: false } }, // first priceResp incomplete
      { json: { completed: true, hotels: priceDetails.hotels } } // retryResp
    );

    await getFilteredHotels(req, res);
    expect(fetch).toHaveBeenCalledTimes(3); // initial + retry
    const data = res._getJSONData();
    expect(data.hotels[0].price).toBeDefined();
  });

  test('returns 202 if prices not ready after retries', async () => {
    setFetchMockSequence(
      { json: hotelDetails },
      { json: { completed: false } },
      { json: { completed: false } },
      { json: { completed: false } }
    );

    await getFilteredHotels(req, res);
    expect(res.statusCode).toBe(202);
  });

  test('filters by starRating', async () => {
    req.query.starRating = 3;
    setFetchMockSequence(
      { json: hotelDetails },
      { json: { completed: true, hotels: priceDetails.hotels } }
    );
    await getFilteredHotels(req, res);
    expect(res._getJSONData().total).toBe(1);
  });

  test('filters by guestRating', async () => {
    req.query.guestRating = 75;
    setFetchMockSequence(
      { json: hotelDetails },
      { json: { completed: true, hotels: priceDetails.hotels } }
    );
    await getFilteredHotels(req, res);
    expect(res._getJSONData().total).toBe(2);
  });

  test('filters by price range', async () => {
    req.query.minPrice = 1000;
    req.query.maxPrice = 2000;
    setFetchMockSequence(
      { json: hotelDetails },
      { json: { completed: true, hotels: priceDetails.hotels } }
    );
    await getFilteredHotels(req, res);
    expect(res._getJSONData().total).toBe(0);
  });

  test('sorts by price descending', async () => {
    req.query.sortBy = 'price';
    setFetchMockSequence(
      { json: hotelDetails },
      { json: { completed: true, hotels: priceDetails.hotels } }
    );
    await getFilteredHotels(req, res);
    const { hotels } = res._getJSONData();
    expect(hotels[0].price).toBeGreaterThanOrEqual(hotels[1].price);
  });

    test('sorts by guestRating ascending', async () => {
    req.query.sortBy = 'guestRating';
    setFetchMockSequence(
      { json: hotelDetails },
      { json: { completed: true, hotels: priceDetails.hotels } }
    );
    await getFilteredHotels(req, res);
    const { hotels } = res._getJSONData();
    expect((hotels[0].trustyou?.score?.overall ?? 0)).toBeGreaterThanOrEqual((hotels[1].trustyou?.score?.overall ?? 0));
  });

    test('sorts by starRating ascending', async () => {
    req.query.sortBy = 'rating';
    setFetchMockSequence(
      { json: hotelDetails },
      { json: { completed: true, hotels: priceDetails.hotels } }
    );
    await getFilteredHotels(req, res);
    const { hotels } = res._getJSONData();
    expect(hotels[0].rating).toBeGreaterThanOrEqual(hotels[1].rating);
  });

  test('handles Hotel API error', async () => {
    setFetchMockSequence(
      { ok: false, status: 500, text: 'Hotel API down' }
    );
    await getFilteredHotels(req, res);
    expect(res.statusCode).toBe(500);
    expect(res._getJSONData().error).toMatch(/Hotel API error/);
  });

  test('handles Price API error', async () => {
    setFetchMockSequence(
      { json: hotelDetails },
      { ok: false, status: 500, text: 'Price API down' }
    );
    await getFilteredHotels(req, res);
    expect(res.statusCode).toBe(500);
    expect(res._getJSONData().error).toMatch(/Price API error/);
  });

  test('handles unexpected errors', async () => {
    fetch.mockRejectedValueOnce(new Error('network fail'));
    await getFilteredHotels(req, res);
    expect(res.statusCode).toBe(500);
    expect(res._getJSONData().error).toMatch(/Internal server error/);
  });
});