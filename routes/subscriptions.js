const express = require('express');
const router = express.Router();
const db = require('../db');
const sql = require('mssql');

// GET all subscriptions
router.get('/', async (req, res) => {
  try {
    const pool = db.getPool();
    const result = await pool.request().execute('dbo.sp_Subscription_GetAll');
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ msg: 'Database error', error: err.message });
  }
});

// GET a single subscription by ID
router.get('/:id', async (req, res) => {
  try {
    const pool = db.getPool();
    const result = await pool.request()
      .input('id', sql.UniqueIdentifier, req.params.id)
      .execute('dbo.sp_Subscription_GetById');
    res.json(result.recordset[0]);
  } catch (err) {
    res.status(500).json({ msg: 'Database error', error: err.message });
  }
});

// CREATE a new subscription
router.post('/', async (req, res) => {
  const { name, price, billing_cycle, features } = req.body;

  // Basic validation to avoid obvious DB errors
  if (!name || !billing_cycle || !features) {
    return res.status(400).json({ msg: 'name, billing_cycle and features are required' });
  }

  const numericPrice = price !== undefined && price !== null ? Number(price) : null;
  if (numericPrice === null || Number.isNaN(numericPrice)) {
    return res.status(400).json({ msg: 'price must be a valid number' });
  }

  try {
    const pool = db.getPool();
    await pool.request()
      // Parameter names must match sp_Subscription_Create: @Name, @Price, @BillingCycle, @Features, @IsActive
      .input('Name', sql.NVarChar(100), name)
      .input('Price', sql.Decimal(12, 2), numericPrice)
      .input('BillingCycle', sql.NVarChar(20), billing_cycle)
      .input('Features', sql.NVarChar(sql.MAX), features)
      .input('IsActive', sql.Bit, true)
      .execute('dbo.sp_Subscription_Create');
    res.json({ msg: 'Subscription created successfully' });
  } catch (err) {
    console.error('Error creating subscription:', err.originalError || err);
    res.status(500).json({ msg: 'Server error', error: err.message, originalError: err.originalError });
  }
});

// UPDATE a subscription
router.put('/:id', async (req, res) => {
  const { name, price, billing_cycle, features } = req.body;

  const numericPrice = price !== undefined && price !== null ? Number(price) : null;
  if (numericPrice === null || Number.isNaN(numericPrice)) {
    return res.status(400).json({ msg: 'price must be a valid number' });
  }

  try {
    const pool = db.getPool();
    await pool.request()
      // Assuming sp_Subscription_Update has parameters: @Id, @Name, @Price, @BillingCycle, @Features, @IsActive
      .input('Id', sql.UniqueIdentifier, req.params.id)
      .input('Name', sql.NVarChar(100), name)
      .input('Price', sql.Decimal(12, 2), numericPrice)
      .input('BillingCycle', sql.NVarChar(20), billing_cycle)
      .input('Features', sql.NVarChar(sql.MAX), features)
      .input('IsActive', sql.Bit, true)
      .execute('dbo.sp_Subscription_Update');
    res.json({ msg: 'Subscription updated successfully' });
  } catch (err) {
    console.error('Error updating subscription:', err.originalError || err);
    res.status(500).json({ msg: 'Server error', error: err.message, originalError: err.originalError });
  }
});

// DELETE a subscription
router.delete('/:id', async (req, res) => {
  try {
    const pool = db.getPool();
    await pool.request()
      .input('Id', sql.UniqueIdentifier, req.params.id) // match @Id
      .execute('dbo.sp_Subscription_Delete');
    res.json({ msg: 'Subscription deleted successfully' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

module.exports = router;