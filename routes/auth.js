const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
const db = require('../db');
const sql = require('mssql');


router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  // Validation
  if (!email || !password) {
    return res.status(400).json({ msg: 'Please enter all fields' });
  }

  if (email.length > 50) {
    return res.status(400).json({ msg: 'Email cannot be more than 50 characters' });
  }

  if (password.length > 100) {
    return res.status(400).json({ msg: 'Password cannot be more than 100 characters' });
  }

  try {
    const pool = db.getPool();
    const result = await pool.request()
      .input('email', sql.NVarChar(50), email)
      .query('SELECT * FROM admin_users WHERE email = @email');

    const user = result.recordset[0];
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    res.json({
      success: true,
      message: 'Login successful',
      user: { id: user.id, email: user.email, full_name: user.full_name, role: user.role }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ msg: 'Server error during login', error: err.message });
  }
});

module.exports = router;
