const { createBooking, getAllBookings, deleteBooking } = require('../models/booking.js');
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

  test('should fetch and return all booking fields correctly', async () => {
  // Mock a booking with all expected fields
    const fullBooking = {
      bid: 9,
      dest_id: "M781",
      stay_info: JSON.stringify({
        adults: 2,
        nights: 3,
        children: 1,
        room_type: "Family Suite"
      }),
      price: 720.00,
      payment_info: JSON.stringify({
        amount: 720,
        method: "Stripe Card",
        status: "Paid",
        paid_at: "2025-08-01T10:12:34.000Z",
        currency: "SGD",
        transaction_id: "pi_test_0001",
        payment_method_id: "pm_test_0001"
      }),
      booking_reference: "REF-1754039184260",
      created_at: "2025-08-01 10:12:34",
      message_to_hotel: "Please provide baby cot",
      uid: "user_A1",
      start_date: "2025-08-10",
      end_date: "2025-08-13",
      hotel_id: "2A12",
      hotel_name: "Marina Bay Family Hotel",
      hotel_addr: "12 Orchard Rd, Singapore"
    };

    // Mock DB query to return this booking in an array
    db.query.mockResolvedValue([[fullBooking]]);

    const req = httpMocks.createRequest({
      method: 'GET',
      query: { uid: 'user_A1' }
    });
    const res = httpMocks.createResponse();

    await getAllBookings(req, res);

    expect(res.statusCode).toBe(202);

    const data = res._getJSONData();

    // Check if the returned data is an array and length 1
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBe(1);

    const booking = data[0];

    // Check all fields individually
    expect(booking).toMatchObject({
      bid: 9,
      dest_id: "M781",
      price: 720.00,
      booking_reference: "REF-1754039184260",
      message_to_hotel: "Please provide baby cot",
      uid: "user_A1",
      start_date: "2025-08-10",
      end_date: "2025-08-13",
      hotel_id: "2A12",
      hotel_name: "Marina Bay Family Hotel",
      hotel_addr: "12 Orchard Rd, Singapore"
    });

    // Check JSON fields (stay_info, payment_info) are JSON strings and can be parsed
    expect(typeof booking.stay_info).toBe('string');
    expect(() => JSON.parse(booking.stay_info)).not.toThrow();

    expect(typeof booking.payment_info).toBe('string');
    expect(() => JSON.parse(booking.payment_info)).not.toThrow();

    // Optional: check parsed content
    const stayInfo = JSON.parse(booking.stay_info);
    expect(stayInfo).toMatchObject({
      adults: 2,
      nights: 3,
      children: 1,
      room_type: "Family Suite"
    });

    const paymentInfo = JSON.parse(booking.payment_info);
    expect(paymentInfo).toMatchObject({
      amount: 720,
      method: "Stripe Card",
      status: "Paid"
      // ... you can check more fields here if you want
    });
  });


});

describe('deleteBooking', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should return 400 if booking ID is missing', async () => {
    const req = httpMocks.createRequest({ method: 'DELETE', body: {} }); // no bid in body
    const res = httpMocks.createResponse();

    await deleteBooking(req, res);

    expect(res.statusCode).toBe(400);
    expect(res._getJSONData()).toEqual({ error: 'Missing booking ID' });
  });

  test('should return 200 if booking is deleted successfully', async () => {
    db.query.mockResolvedValue([{ affectedRows: 1 }]);

    const req = httpMocks.createRequest({
      method: 'DELETE',
      body: { bid: 5 }, // pass bid in body
    });
    const res = httpMocks.createResponse();

    await deleteBooking(req, res);

    expect(res.statusCode).toBe(200);
    expect(res._getJSONData()).toEqual({
      success: true,
      message: 'Booking deleted successfully',
    });
  });

  test('should return 404 if booking not found', async () => {
    db.query.mockResolvedValue([{ affectedRows: 0 }]);

    const req = httpMocks.createRequest({
      method: 'DELETE',
      body: { bid: 5 }, // bid present but no rows deleted
    });
    const res = httpMocks.createResponse();

    await deleteBooking(req, res);

    expect(res.statusCode).toBe(404);
    expect(res._getJSONData()).toEqual({ error: 'Booking not found' });
  });

  test('should return 500 if DB query fails', async () => {
    db.query.mockImplementation(() => {
      throw new Error('DB error');
    });

    const req = httpMocks.createRequest({
      method: 'DELETE',
      body: { bid: 5 }, // bid present to reach DB call
    });
    const res = httpMocks.createResponse();

    await deleteBooking(req, res);

    expect(res.statusCode).toBe(500);
    expect(res._getJSONData()).toEqual({ error: 'Failed to delete booking' });
  });
});