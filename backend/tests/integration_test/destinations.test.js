const request = require('supertest');
const express = require('express');
const db = require('../../models/database');

// Mock database
jest.mock('../../models/database');

describe('Destinations Router Integration', () => {
  let app;
  
  beforeAll(() => {
    app = express();
    app.use(express.json());
    
    // Mount your actual router with the correct base path
    const destinationsRouter = require('../../routes/destinations');
    app.use('/api/destinations', destinationsRouter); // Matches your route structure
  });

  beforeEach(() => {
    jest.clearAllMocks();
    // Clear cache if your implementation uses it
    if (require('../../models/destinations').__test?.clearCache) {
      require('../../models/destinations').__test.clearCache();
    }
  });

  it('GET /api/destinations/all should return destinations', async () => {
    // Mock database response
    db.query.mockResolvedValueOnce([[{ term: 'Paris' }, { term: 'London' }]]);
    
    const response = await request(app)
      .get('/api/destinations/all')
      .expect(200);
    
    expect(response.body).toEqual(['Paris', 'London']);
    expect(db.query).toHaveBeenCalledWith('SELECT term FROM destinations');
  });

  it('GET /api/destinations/uid should return destination by term', async () => {
    db.query.mockResolvedValueOnce([[{ uid: '123', term: 'Paris' }]]);
    
    const response = await request(app)
      .get('/api/destinations/uid?term=Paris')
      .expect(200);
    
    expect(response.body).toEqual({ uid: '123', term: 'Paris' });
    expect(db.query).toHaveBeenCalledWith(
      'SELECT uid, term FROM destinations WHERE LOWER(term) = LOWER(?) LIMIT 1',
      ['Paris']
    );
  });

  it('GET /api/destinations/uid should return 400 if term is missing', async () => {
    const response = await request(app)
      .get('/api/destinations/uid')
      .expect(400);
    
    expect(response.body.error).toBeDefined();
  });
});