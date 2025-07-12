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

// Feature 2: Get UID by destination term and display all relevant hotels based on the matched UID
async function getUidByDestinationTerm(req, res) {
  const { term } = req.query;

  if (!term || term.trim() === '') {
    return res.status(400).json({ error: 'Missing destination term' });
  }

  try {
    const [rows] = await db.query(
      'SELECT uid, term FROM destinations WHERE LOWER(term) = LOWER(?) LIMIT 1',
      [term.trim()]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'No destinations found matching the term' });
    }

    return res.json(rows[0]);
  } catch (err) {
    console.error('Database error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = {
  getAllDestinations,
  getUidByDestinationTerm,
};