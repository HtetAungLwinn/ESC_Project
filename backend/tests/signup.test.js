const { getFilteredHotels, searchCache } = require('../models/hotelController');

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

  describe('Parameter Processing', () => {
    test('should use default values for optional parameters', async () => {
      mockReq.query = {
        uid: 'dest1',
        checkin: '2025-08-10',
        checkout: '2025-08-12'
      };

      // Mock successful API response
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          completed: true,
          hotels: []
        })
      });

      await getFilteredHotels(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        page: 1,
        limit: 18,
        hotels: [],
        total: 0,
        hasMore: false
      }));
    });

    test('should handle numeric string conversion', async () => {
      mockReq.query = {
        uid: 'dest1',
        checkin: '2025-08-10',
        checkout: '2025-08-12',
        page: '2',
        limit: '10',
        minPrice: '100',
        maxPrice: '500',
        minStars: '3',
        minGuestRating: '4.5'
      };

      // Mock successful API response
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          completed: true,
          hotels: []
        })
      });

      await getFilteredHotels(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        page: 2,
        limit: 10
      }));
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
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          completed: true,
          hotels: [{ id: '2', name: 'Fresh Hotel' }]
        })
      });

      await getFilteredHotels(mockReq, mockRes);

      expect(fetch).toHaveBeenCalled();
    });
  });

  describe('API Integration', () => {
    test('should handle prices not ready (202 response)', async () => {
      mockReq.query = {
        uid: 'dest1',
        checkin: '2025-08-10',
        checkout: '2025-08-12'
      };

      // Mock API response with prices not ready
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          completed: false,
          hotels: [
            { id: '1', name: 'Hotel 1', rating: 4, price: null }
          ]
        })
      });

      await getFilteredHotels(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(202);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        hotels: expect.arrayContaining([
          expect.objectContaining({ price: null })
        ])
      }));
    });

    test('should handle invalid price JSON gracefully', async () => {
      mockReq.query = {
        uid: 'dest1',
        checkin: '2025-08-10',
        checkout: '2025-08-12'
      };

      // Mock API response with invalid JSON
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => {
          throw new Error('Invalid JSON');
        }
      });

      await getFilteredHotels(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Internal server error'
      });
    });
  });

  describe('Data Normalization', () => {
    test('should handle hotel data as array', async () => {
      mockReq.query = {
        uid: 'dest1',
        checkin: '2025-08-10',
        checkout: '2025-08-12'
      };

      const hotelsArray = [
        { id: '1', name: 'Hotel 1', rating: 4, price: 150 }
      ];

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          completed: true,
          hotels: hotelsArray
        })
      });

      await getFilteredHotels(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        hotels: expect.arrayContaining([
          expect.objectContaining({ id: '1', name: 'Hotel 1' })
        ])
      }));
    });

    test('should handle hotel data as object with hotels property', async () => {
      mockReq.query = {
        uid: 'dest1',
        checkin: '2025-08-10',
        checkout: '2025-08-12'
      };

      const hotelsObject = {
        hotels: [
          { id: '1', name: 'Hotel 1', rating: 4, price: 150 }
        ]
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          completed: true,
          hotels: hotelsObject
        })
      });

      await getFilteredHotels(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        hotels: expect.arrayContaining([
          expect.objectContaining({ id: '1', name: 'Hotel 1' })
        ])
      }));
    });
  });

  describe('Filtering Logic', () => {
    test('should filter by guest rating', async () => {
      mockReq.query = {
        uid: 'dest1',
        checkin: '2025-08-10',
        checkout: '2025-08-12',
        minGuestRating: '4.0'
      };

      const hotels = [
        { id: '1', name: 'Hotel 1', rating: 3, price: 150, trustyou: { score: { overall: 75 } } },
        { id: '2', name: 'Hotel 2', rating: 5, price: 200, trustyou: { score: { overall: 85 } } }
      ];

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          completed: true,
          hotels: hotels
        })
      });

      await getFilteredHotels(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      const response = mockRes.json.mock.calls[0][0];
      expect(response.hotels).toHaveLength(1);
      expect(response.hotels[0].id).toBe('2');
    });

    test('should filter by price range', async () => {
      mockReq.query = {
        uid: 'dest1',
        checkin: '2025-08-10',
        checkout: '2025-08-12',
        minPrice: '180',
        maxPrice: '250'
      };

      const hotels = [
        { id: '1', name: 'Hotel 1', rating: 4, price: 150 },
        { id: '2', name: 'Hotel 2', rating: 5, price: 200 },
        { id: '3', name: 'Hotel 3', rating: 4, price: 300 }
      ];

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          completed: true,
          hotels: hotels
        })
      });

      await getFilteredHotels(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      const response = mockRes.json.mock.calls[0][0];
      expect(response.hotels).toHaveLength(1);
      expect(response.hotels[0].id).toBe('2');
    });

    test('should include hotels with null prices when filtering by price', async () => {
      mockReq.query = {
        uid: 'dest1',
        checkin: '2025-08-10',
        checkout: '2025-08-12',
        minPrice: '100',
        maxPrice: '200'
      };

      const hotels = [
        { id: '1', name: 'Hotel 1', rating: 4, price: 150 },
        { id: '2', name: 'Hotel 2', rating: 5, price: null },
        { id: '3', name: 'Hotel 3', rating: 4, price: 300 }
      ];

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          completed: true,
          hotels: hotels
        })
      });

      await getFilteredHotels(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      const response = mockRes.json.mock.calls[0][0];
      expect(response.hotels).toHaveLength(2);
      expect(response.hotels.map(h => h.id)).toContain('1');
      expect(response.hotels.map(h => h.id)).toContain('2');
    });
  });

  describe('Sorting Logic', () => {
    test('should sort by price when sortBy=price', async () => {
      mockReq.query = {
        uid: 'dest1',
        checkin: '2025-08-10',
        checkout: '2025-08-12',
        sortBy: 'price'
      };

      const hotels = [
        { id: '1', name: 'Hotel 1', rating: 4, price: 200 },
        { id: '2', name: 'Hotel 2', rating: 5, price: 150 }
      ];

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          completed: true,
          hotels: hotels
        })
      });

      await getFilteredHotels(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      const response = mockRes.json.mock.calls[0][0];
      expect(response.hotels[0].id).toBe('2'); // cheapest first
      expect(response.hotels[1].id).toBe('1');
    });

    test('should sort by guest rating when sortBy=guestRating', async () => {
      mockReq.query = {
        uid: 'dest1',
        checkin: '2025-08-10',
        checkout: '2025-08-12',
        sortBy: 'guestRating'
      };

      const hotels = [
        { id: '1', name: 'Hotel 1', rating: 4, price: 150, trustyou: { score: { overall: 75 } } },
        { id: '2', name: 'Hotel 2', rating: 5, price: 200, trustyou: { score: { overall: 85 } } }
      ];

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          completed: true,
          hotels: hotels
        })
      });

      await getFilteredHotels(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      const response = mockRes.json.mock.calls[0][0];
      expect(response.hotels[0].id).toBe('2'); // highest guestRating first
      expect(response.hotels[1].id).toBe('1');
    });

    test('should sort by star rating by default', async () => {
      mockReq.query = {
        uid: 'dest1',
        checkin: '2025-08-10',
        checkout: '2025-08-12'
      };

      const hotels = [
        { id: '1', name: 'Hotel 1', rating: 4, price: 150 },
        { id: '2', name: 'Hotel 2', rating: 5, price: 200 }
      ];

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          completed: true,
          hotels: hotels
        })
      });

      await getFilteredHotels(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      const response = mockRes.json.mock.calls[0][0];
      expect(response.hotels[0].id).toBe('2'); // highest star rating first
      expect(response.hotels[1].id).toBe('1');
    });
  });

  describe('Pagination Logic', () => {
    test('should paginate results correctly', async () => {
      mockReq.query = {
        uid: 'dest1',
        checkin: '2025-08-10',
        checkout: '2025-08-12',
        page: '2',
        limit: '1'
      };

      const hotels = [
        { id: '1', name: 'Hotel 1', rating: 4, price: 150 },
        { id: '2', name: 'Hotel 2', rating: 5, price: 200 }
      ];

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          completed: true,
          hotels: hotels
        })
      });

      await getFilteredHotels(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      const response = mockRes.json.mock.calls[0][0];
      expect(response.hotels).toHaveLength(1);
      expect(response.page).toBe(2);
      expect(response.total).toBe(2);
    });

    test('should indicate hasMore when there are more pages', async () => {
      mockReq.query = {
        uid: 'dest1',
        checkin: '2025-08-10',
        checkout: '2025-08-12',
        page: '1',
        limit: '1'
      };

      const hotels = [
        { id: '1', name: 'Hotel 1', rating: 4, price: 150 },
        { id: '2', name: 'Hotel 2', rating: 5, price: 200 }
      ];

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          completed: true,
          hotels: hotels
        })
      });

      await getFilteredHotels(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      const response = mockRes.json.mock.calls[0][0];
      expect(response.hasMore).toBe(true);
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
        json: async () => {
          throw new Error('Invalid JSON response');
        }
      });

      await getFilteredHotels(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Internal server error'
      });
    });
  });

  describe('Background Price Fetching', () => {
    test('should trigger background price fetch when prices not ready', async () => {
      mockReq.query = {
        uid: 'dest1',
        checkin: '2025-08-10',
        checkout: '2025-08-12'
      };

      // First call - prices not ready
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          completed: false,
          hotels: [{ id: '1', name: 'Hotel 1', price: null }]
        })
      });

      await getFilteredHotels(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(202);
      expect(fetch).toHaveBeenCalledTimes(1);
    });
  });
});