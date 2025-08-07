const { getFilteredHotels, searchCache } = require('../models/hotels');

// Mock fetch globally
global.fetch = jest.fn();

describe('Hotel Controller Unit Tests', () => {
  let mockReq, mockRes;

  beforeEach(() => {
    mockReq = {
      query: {}
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    
    // Clear all mocks
    jest.clearAllMocks();
    
    // Clear cache
    if (searchCache && typeof searchCache.clear === 'function') {
      searchCache.clear();
    }
  });

  // Helper function to create proper fetch mock response
  const createMockResponse = (data, ok = true) => ({
    ok,
    json: jest.fn().mockResolvedValue(data),
    text: jest.fn().mockResolvedValue(JSON.stringify(data))
  });

  describe('Input Validation', () => {
    test('should return 400 if destination_id is missing', async () => {
      mockReq.query = {
        checkin: '2025-08-10',
        checkout: '2025-08-12'
      };

      await getFilteredHotels(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Missing required parameters'
      });
    });

    test('should return 400 if checkin is missing', async () => {
      mockReq.query = {
        uid: 'dest1',
        checkout: '2025-08-12'
      };

      await getFilteredHotels(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Missing required parameters'
      });
    });

    test('should return 400 if checkout is missing', async () => {
      mockReq.query = {
        uid: 'dest1',
        checkin: '2025-08-10'
      };

      await getFilteredHotels(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Missing required parameters'
      });
    });
  });

  describe('Cache Functionality', () => {
    test('should use cached data when available and valid', async () => {
      const cacheKey = 'test_cache_key';
      const cachedData = {
        hotels: [{ id: '1', name: 'Cached Hotel' }],
        timestamp: Date.now()
      };

      // Mock cache get/set if available
      if (searchCache && typeof searchCache.get === 'function') {
        searchCache.get = jest.fn().mockReturnValue(cachedData);
        searchCache.set = jest.fn();
      }

      mockReq.query = {
        uid: 'dest1',
        checkin: '2025-08-10',
        checkout: '2025-08-12'
      };

      await getFilteredHotels(mockReq, mockRes);

      // Fetch should not be called if cache is used
      expect(fetch).not.toHaveBeenCalled();
    });

    test('should fetch new data when cache is expired', async () => {
      const expiredCacheData = {
        hotels: [{ id: '1', name: 'Expired Hotel' }],
        timestamp: Date.now() - (11 * 60 * 1000) // 11 minutes ago
      };

      // Mock expired cache
      if (searchCache && typeof searchCache.get === 'function') {
        searchCache.get = jest.fn().mockReturnValue(expiredCacheData);
        searchCache.set = jest.fn();
      }

      mockReq.query = {
        uid: 'dest1',
        checkin: '2025-08-10',
        checkout: '2025-08-12'
      };

      // Mock fresh API response
      const mockData = {
        completed: true,
        hotels: [{ id: '2', name: 'Fresh Hotel' }]
      };
      fetch.mockResolvedValueOnce(createMockResponse(mockData));

      await getFilteredHotels(mockReq, mockRes);

      expect(fetch).toHaveBeenCalled();
    });
  });

  describe('API Integration', () => {
    test('should handle invalid price JSON gracefully', async () => {
      mockReq.query = {
        uid: 'dest1',
        checkin: '2025-08-10',
        checkout: '2025-08-12'
      };

      // Mock API response with invalid JSON
      fetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockRejectedValue(new Error('Invalid JSON')),
        text: jest.fn().mockRejectedValue(new Error('Invalid JSON'))
      });

      await getFilteredHotels(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Internal server error'
      });
    });
  });

  describe('Error Handling', () => {
    test('should handle fetch errors gracefully', async () => {
      mockReq.query = {
        uid: 'dest1',
        checkin: '2025-08-10',
        checkout: '2025-08-12'
      };

      fetch.mockRejectedValueOnce(new Error('Network error'));

      await getFilteredHotels(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Internal server error'
      });
    });

    test('should handle JSON parsing errors in hotel data', async () => {
      mockReq.query = {
        uid: 'dest1',
        checkin: '2025-08-10',
        checkout: '2025-08-12'
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockRejectedValue(new Error('Invalid JSON response')),
        text: jest.fn().mockRejectedValue(new Error('Invalid JSON response'))
      });

      await getFilteredHotels(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Internal server error'
      });
    });
  });
});