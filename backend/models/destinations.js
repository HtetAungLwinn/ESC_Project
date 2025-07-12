const db = require('./database')

let cachedDestinations = [];

async function getAllDestinations(req, res) {
  if (cachedDestinations.length === 0){
    try {
        const [rows] = await db.query('SELECT term FROM destinations');
        cachedDestinations  = rows.map(row => row.term); // extract just strings
        console.log('Retreived terms: ', terms); // returns ["Singapore", "Tokyo", ...]
    } catch (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Failed to fetch terms' });
    }
  }
  return res.json(cachedDestinations);
}

module.exports = { getAllDestinations };