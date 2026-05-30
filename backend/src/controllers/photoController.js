const { pool } = require('../config/database');
const fs = require('fs');
const path = require('path');

const uploadPhoto = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded.' });
    }

    const { building_id, assessment_id, caption } = req.body;

    if (!building_id) {
      return res.status(400).json({ message: 'Building ID is required.' });
    }

    // Verify building exists
    const [buildings] = await pool.execute('SELECT id FROM buildings WHERE id = ?', [building_id]);
    if (buildings.length === 0) {
      return res.status(404).json({ message: 'Building not found.' });
    }

    const imageUrl = `/uploads/${req.file.filename}`;

    const [result] = await pool.execute(
      'INSERT INTO photos (building_id, assessment_id, image_url, caption) VALUES (?, ?, ?, ?)',
      [building_id, assessment_id || null, imageUrl, caption || null]
    );

    const [photo] = await pool.execute('SELECT * FROM photos WHERE id = ?', [result.insertId]);

    res.status(201).json({ message: 'Photo uploaded successfully.', photo: photo[0] });
  } catch (error) {
    console.error('Upload photo error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

const getPhotos = async (req, res) => {
  try {
    const { building_id } = req.query;

    let query = 'SELECT * FROM photos';
    const params = [];

    if (building_id) {
      query += ' WHERE building_id = ?';
      params.push(building_id);
    }

    query += ' ORDER BY uploaded_at DESC';

    const [photos] = await pool.execute(query, params);
    res.json({ photos });
  } catch (error) {
    console.error('Get photos error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

const deletePhoto = async (req, res) => {
  try {
    const [photos] = await pool.execute('SELECT * FROM photos WHERE id = ?', [req.params.id]);
    if (photos.length === 0) {
      return res.status(404).json({ message: 'Photo not found.' });
    }

    const photo = photos[0];

    // Delete physical file
    const filePath = path.join(process.env.UPLOAD_PATH || './uploads', path.basename(photo.image_url));
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await pool.execute('DELETE FROM photos WHERE id = ?', [req.params.id]);
    res.json({ message: 'Photo deleted.' });
  } catch (error) {
    console.error('Delete photo error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

module.exports = { uploadPhoto, getPhotos, deletePhoto };
