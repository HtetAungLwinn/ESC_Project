const db = require('./database')

async function createBooking(req, res){
    const {
        dest_id,
        stay_info, //stores json file of format start_date, end_date, nights, adults, children, room_type
        price,
        payment_info, // stores payment_id and payee_id
        message_to_hotel
    } = req.body;

    const booking_reference = `REF-${Date.now()}`;

    try{
        const [result] = await db.query(`
      INSERT INTO bookings (
        dest_id, stay_info, message_to_hotel,
        price, payment_info, booking_reference
      ) VALUES (?, ?, ?, ?, ?, ?)
    `, [
      dest_id,
      JSON.stringify(stay_info),
      message_to_hotel,
      price,
      JSON.stringify(payment_info),
      booking_reference
    ]);

    res.status(200).json({
      success: true,
      booking_id: result.insertId,
      booking_reference
    });
    }catch (err){
        console.error('Booking error:', err);
        res.status(500).json({ success: false, error: 'Failed to create booking' });
    }
}

async function getBookingByID(req,res){
    const { uid,id } = req.params;

    try{
        const [rows] = await db.query('SELECT * FROM bookings WHERE bid = ? AND uid = ?', [id, uid]);

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Booking not found' });
        }

        const booking = rows[0];
        booking.stay_info = JSON.parse(booking.stay_info);
        booking.payment_info = JSON.parse(booking.payment_info);

        res.status(200).json(booking);
    } catch (err) {
        console.error('Fetch error:', err);
        res.status(500).json({ error: 'Failed to retrieve booking' });
    }
}

async function getAllBookings(req,res) {
  const { uid } = req.params;

  try{
    const [rows] = await db.query('SELECT * FROM bookings WHERE uid = ?', [uid]);

    if (rows.length == 0){
      return res.status(404).json({ error: 'No bookings found' });
    }

    const bookings = rows;
    for (let i in bookings){
      bookings[i].stay_info = JSON.parse(bookings[i].stay_info);
      bookings[i].payment_info = JSON.parse(bookings[i].payment_info);
    }

    res.status(202).json(bookings)
  }catch (err) {
    console.error('Fetch error');
    res.status(500).json({ error: 'Failed to recieve bookings' });
  }
  
}

module.exports = {
  createBooking,
  getBookingByID,
  getAllBookings
};