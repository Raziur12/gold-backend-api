const express = require('express');
const router = express.Router();
const db = require('../db');
const sql = require('mssql');

// The hardcoded ID of the single contact us record
const CONTACT_US_ID = 'BB7A60C6-9EF6-4693-8094-89016FB6FB2A';

/* 
   GET: Fetch Contact Us details
   Route: /api/contactus 
*/
router.get('/', async (req, res) => {
  try {
    const pool = db.getPool();
    const result = await pool.request()
      .input('Id', sql.UniqueIdentifier, CONTACT_US_ID)
      .execute('dbo.sp_ContactUs_GetById');

    if (!result.recordset[0]) {
      return res.status(404).json({ msg: 'Contact Us record not found' });
    }

    res.json(result.recordset[0]);
  } catch (err) {
    res.status(500).json({ msg: 'Database error', error: err.message });
  }
});


/* 
   UPDATE: Update Contact Us details
   Route: /api/contactus 
*/
router.put('/', async (req, res) => {
  const { title, description, phone, whatsapp, working_days, working_hours } = req.body;

  try {
    const pool = db.getPool();

    await pool.request()
      // Parameter names and sizes must match sp_ContactUs_Update:
      // @Id, @Title, @Description, @Phone, @Whatsapp, @WorkingDays, @WorkingHours
      .input('Id', sql.UniqueIdentifier, CONTACT_US_ID)
      .input('Title', sql.NVarChar(200), title)
      .input('Description', sql.NVarChar(sql.MAX), description)
      .input('Phone', sql.NVarChar(50), phone)
      .input('Whatsapp', sql.NVarChar(50), whatsapp)
      .input('WorkingDays', sql.NVarChar(200), working_days)
      .input('WorkingHours', sql.NVarChar(200), working_hours)
      .execute('dbo.sp_ContactUs_Update');

    res.json({ msg: 'Contact Us details updated successfully' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});


/* 
   POST: Save visitor contact message
   Route: /api/contactus/submit
*/
router.post('/submit', async (req, res) => {
  const { name, email, phone, message } = req.body;

  try {
    const pool = db.getPool();

    await pool.request()
      .input('name', sql.NVarChar(100), name)
      .input('email', sql.NVarChar(150), email)
      .input('phone', sql.NVarChar(15), phone)
      .input('message', sql.NVarChar(2000), message)
      .execute('dbo.sp_inquiries_create');

    res.json({ msg: 'Message saved successfully' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

module.exports = router;
