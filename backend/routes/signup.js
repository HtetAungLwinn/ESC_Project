const express = require('express');
const router = express.Router();
const db = require('../models/database');
const bcrypt = require('bcrypt');

async function signupHandler(req, res) {
  const { uid, firstName, lastName, salutation, religion, phoneNumber, address, postalCode, email, password, roles } = req.body;

  try {
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const query = `INSERT INTO User (uid, FirstName, LastName, Salutation, Religion, PhoneNumber, Address, PostalCode, Email, Password, Roles)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    await db.execute(query, [uid, firstName, lastName, salutation, religion, phoneNumber, address, postalCode, email, hashedPassword, roles]);

    res.status(200).json({ success: true });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      // Already inserted
      return res.status(409).json({ success: false, error: 'User already exists' });
    }
    res.status(500).json({ success: false, error: error.message });
  }
}

router.post('/', signupHandler);

module.exports = { router, signupHandler };
