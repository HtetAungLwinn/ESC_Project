const request = require('supertest');
const express = require('express');
const deleteAccountRouter = require('../routes/deleteAccount'); // <-- update this path
const db = require('../models/database');

jest.mock('../models/database');

const app = express();
app.use(express.json());
app.use('/api/deleteAccount', deleteAccountRouter);

describe('DELETE /api/deleteAccount', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('delete account from user and bookings, and return success', async () => {
    // Mock db.query to resolve successfully twice
    db.query.mockResolvedValueOnce()  // for deleting user
            .mockResolvedValueOnce(); // for deleting bookings

    const res = await request(app)
      .delete('/api/deleteAccount')
      .send({ uid: 123 });

    expect(db.query).toHaveBeenCalledTimes(2);
    expect(db.query).toHaveBeenNthCalledWith(1, 'DELETE FROM User WHERE uid = ?', [123]);
    expect(db.query).toHaveBeenNthCalledWith(2, 'DELETE FROM bookings WHERE uid = ?', [123]);
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ success: true });
  });

  it('should return 400 if uid is missing', async () => {
    const res = await request(app)
      .delete('/api/deleteAccount')
      .send({});  // no uid

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ success: false, error: 'Missing uid' });
    expect(db.query).not.toHaveBeenCalled();
  });

  it('return 500 if db query throws error', async () => {
    db.query.mockRejectedValueOnce(new Error('DB error'));

    const res = await request(app)
      .delete('/api/deleteAccount')
      .send({ uid: 123 });

    expect(res.statusCode).toBe(500);
    expect(res.body).toEqual({ success: false, error: 'Server error' });
  });
});
