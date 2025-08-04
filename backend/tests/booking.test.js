const { createBooking, getAllBookings } = require('../models/booking.js');
const booking = require('../models/booking.js');
const httpMocks = require('node-mocks-http');
const path = require('path');

jest.mock('../models/database'); // adjust path accordingly
const db = require('../models/database');

const bookingDetails = require(path.resolve(__dirname, './mockData/bookingDetails.json'));

global.fetch = jest.fn();

describe('createBooking', () => {

    const baseQuery = {
            bid: 9,
            dest_id: "M781",
            stay_info: {
              adults: 2,
              nights: 3,
              children: 1,
              room_type: "Family Suite"
            },
            price: 720.00,
            payment_info: {
              amount: 720,
              method: "Stripe Card",
              status: "Paid",
              paid_at: "2025-08-01T10:12:34.000Z",
              currency: "SGD",
              transaction_id: "pi_test_0001",
              payment_method_id: "pm_test_0001"
            },
            booking_reference: "REF-1754039184260",
            created_at: "2025-08-01 10:12:34",
            message_to_hotel: "Please provide baby cot",
            uid: "user_A1",
            start_date: "2025-08-10",
            end_date: "2025-08-13",
            hotel_id: "2A12",
            hotel_name: "Marina Bay Family Hotel",
            hotel_addr: "12 Orchard Rd, Singapore"

        }

    afterEach(() => {
        fetch.mockClear();
        jest.clearAllMocks();
    })

    test('returns 400 if parameters missing', async () => {
        const req = httpMocks.createRequest({ params: {} });
        const res = httpMocks.createResponse();

        await createBooking(req, res);

        expect(res.statusCode).toBe(400);
        expect(res._getJSONData()).toEqual({ error: 'Missing query parameters' });
    })

    test('returns 200 if booking is created successfully', async () => {
        db.query.mockResolvedValueOnce([{ insertId: 123 }]);

        const req = httpMocks.createRequest({ body: baseQuery })
        const res = httpMocks.createResponse();

        await createBooking(req, res);

        expect(res.statusCode).toBe(200);
    })

    test('returns 500 if there is error in creating booking', async () => {
        db.query.mockImplementation(() => {
          throw new Error('DB error');
        });

        const req = httpMocks.createRequest({ body: baseQuery });
        const res = httpMocks.createResponse();

        await createBooking(req, res);

        expect(res.statusCode).toBe(500);
        expect(res._getJSONData()).toEqual({
          success: false,
          error: 'Failed to create booking'
        });
    })
});

describe('getAllBookings', () => {

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should return 202 and list of bookings if found', async () => {
    const mockBookings = [
      { bid: 1, uid: 'user_A1', dest_id: 'M123', price: 200 },
      { bid: 2, uid: 'user_A1', dest_id: 'M456', price: 350 }
    ];

    db.query.mockResolvedValue([mockBookings]);

    const req = httpMocks.createRequest({
      method: 'GET',
      query: { uid: 'user_A1' }
    });

    const res = httpMocks.createResponse();

    await getAllBookings(req, res);

    expect(res.statusCode).toBe(202);
    expect(res._getJSONData()).toEqual(mockBookings);
  });

  test('should return 404 if no bookings found', async () => {
    db.query.mockResolvedValue([[]]);

    const req = httpMocks.createRequest({
      method: 'GET',
      query: { uid: 'user_B2' }
    });

    const res = httpMocks.createResponse();

    await getAllBookings(req, res);

    expect(res.statusCode).toBe(404);
    expect(res._getJSONData()).toEqual({ error: 'No bookings found' });
  });

  test('should return 500 if DB query fails', async () => {
    db.query.mockImplementation(() => {
      throw new Error('DB failure');
    });

    const req = httpMocks.createRequest({
      method: 'GET',
      query: { uid: 'user_X' }
    });

    const res = httpMocks.createResponse();

    await getAllBookings(req, res);

    expect(res.statusCode).toBe(500);
    expect(res._getJSONData()).toEqual({ error: 'Failed to recieve bookings' });
  });

});