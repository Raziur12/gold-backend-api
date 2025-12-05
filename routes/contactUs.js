const express = require('express');
const router = express.Router();
const db = require('../db');
const sql = require('mssql');

// The hardcoded ID of the single contact us record
const CONTACT_US_ID = 'BB7A60C6-9EF6-4693-8094-89016FB6FB2A';

// GET the contact us details
router.get('/', async (req, res) => {
  try {
    const pool = db.getPool();
    const result = await pool.request()
      .input('Id', sql.UniqueIdentifier, CONTACT_US_ID)
      .execute('dbo.sp_ContactUs_GetById');
    res.json(result.recordset[0]);
  } catch (err) {
    res.status(500).json({ msg: 'Database error', error: err.message });
  }
});

// UPDATE the contact us details
router.put('/', async (req, res) => {
  const { title, description, phone, whatsapp, working_days, working_hours } = req.body;
  try {
    const pool = db.getPool();
    await pool.request()
      .input('Id', sql.UniqueIdentifier, CONTACT_US_ID)
      .input('title', sql.NVarChar(100), title)
      .input('description', sql.NVarChar(2000), description)
      .input('phone', sql.NVarChar(15), phone)
      .input('whatsapp', sql.NVarChar(15), whatsapp)
      .input('working_days', sql.NVarChar(100), working_days)
      .input('working_hours', sql.NVarChar(50), working_hours)
      .execute('dbo.sp_ContactUs_Update');
    res.json({ msg: 'Contact Us details updated successfully' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

module.exports = router;
