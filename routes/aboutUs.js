const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const db = require('../db');
const sql = require('mssql');


// Set up storage for multer
const storage = multer.diskStorage({
  destination: './public/uploads/',
  filename: function(req, file, cb){
    cb(null, 'about-us-' + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits:{fileSize: 1000000}, // 1MB limit
  fileFilter: function(req, file, cb){
    checkFileType(file, cb);
  }
}).single('image'); // 'image' is the name of the form field

// Check File Type
function checkFileType(file, cb){
  const filetypes = /jpeg|jpg|png/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if(mimetype && extname){
    return cb(null,true);
  } else {
    cb('Error: Images Only!');
  }
}

// GET the about us details
router.get('/', async (req, res) => {
  try {
    const pool = db.getPool();
    const result = await pool.request()
      .input('Id', sql.UniqueIdentifier, 'EADD1984-251F-4F1B-9F2B-513CE4AD76F8')
      .execute('dbo.sp_AboutUs_GetById');
    res.json(result.recordset[0]);
  } catch (err) {
    res.status(500).json({ msg: 'Database error', error: err.message });
  }
});

// UPDATE the about us details
router.put('/', (req, res) => {
  upload(req, res, async (err) => {
    if(err){
      return res.status(400).json({ msg: err });
    }

    const { title, subtitle, description } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : req.body.image_url;

    try {
      const pool = db.getPool();
      await pool.request()
        // Parameter names and sizes must match sp_AboutUs_Update: @Id, @Title, @Subtitle, @Description, @ImageUrl
        .input('Id', sql.UniqueIdentifier, 'EADD1984-251F-4F1B-9F2B-513CE4AD76F8')
        .input('Title', sql.NVarChar(300), title)
        .input('Subtitle', sql.NVarChar(500), subtitle)
        .input('Description', sql.NVarChar(sql.MAX), description)
        .input('ImageUrl', sql.NVarChar(1000), imageUrl)
        .execute('dbo.sp_AboutUs_Update');
      res.json({ msg: 'About Us details updated successfully' });
    } catch (dbErr) {
      res.status(500).json({ msg: 'Server error', error: dbErr.message });
    }
  });
});

module.exports = router;
