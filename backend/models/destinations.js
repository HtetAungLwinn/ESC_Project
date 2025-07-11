const db = require('./database')

let cachedDestinations = [];

async function getAllDestinations(req, res) {
  if (cachedDestinations.length === 0){
    try {
        const [rows] = await db.query('SELECT term FROM destinations limit 10');
        const terms = rows.map(row => row.term); // extract just strings
        console.log('Retreived terms: ', terms);
        res.json(terms); // returns ["Singapore", "Tokyo", ...]
    } catch (err) {
        console.error('Database error:', err);
        res.status(500).json({ error: 'Failed to fetch terms' });
    }
  }
  return cachedDestinations
}

module.exports = { getAllDestinations };