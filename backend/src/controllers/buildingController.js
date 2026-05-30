const { pool } = require('../config/database');

const createBuilding = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can create buildings.' });
    }

    const {
      name, address, use_type, latitude, longitude,
      stories_above, stories_below, year_built, floor_area,
    } = req.body;

    if (!name || !address) {
      return res.status(400).json({ message: 'Building name and address are required.' });
    }

    const [result] = await pool.execute(
      `INSERT INTO buildings (name, address, use_type, latitude, longitude, 
       stories_above, stories_below, year_built, floor_area, created_by) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, address, use_type, latitude || null, longitude || null,
       stories_above || 0, stories_below || 0, year_built || null, floor_area || null, req.user.id]
    );

    const [building] = await pool.execute('SELECT * FROM buildings WHERE id = ?', [result.insertId]);

    res.status(201).json({ message: 'Building created successfully.', building: building[0] });
  } catch (error) {
    console.error('Create building error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

const getBuildings = async (req, res) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let query = `
      SELECT b.*, u.name as created_by_name,
             COUNT(DISTINCT ra.id) as assessment_count
      FROM buildings b
      LEFT JOIN users u ON b.created_by = u.id
      LEFT JOIN rvs_assessments ra ON ra.building_id = b.id
    `;
    const params = [];

    // Users can now view all records, so we remove the created_by filter
    /*
    if (req.user.role !== 'admin') {
      query += ' WHERE b.created_by = ?';
      params.push(req.user.id);
    }
    */

    if (search) {
      query += (params.length > 0 ? ' AND' : ' WHERE') + ' (b.name LIKE ? OR b.address LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

query += ` GROUP BY b.id, u.name ORDER BY b.created_at DESC LIMIT ${parseInt(limit)} OFFSET ${offset}`;
// remove the limit/offset from params — don't push them anymore

    const [buildings] = await pool.execute(query, params);

    // Get total count
    let countQuery = 'SELECT COUNT(DISTINCT b.id) as total FROM buildings b';
    const countParams = [];
    /*
    if (req.user.role !== 'admin') {
      countQuery += ' WHERE b.created_by = ?';
      countParams.push(req.user.id);
    }
    */
    if (search) {
      countQuery += (countParams.length > 0 ? ' AND' : ' WHERE') + ' (b.name LIKE ? OR b.address LIKE ?)';
      countParams.push(`%${search}%`, `%${search}%`);
    }
    const [[{ total }]] = await pool.execute(countQuery, countParams);

    res.json({ buildings, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (error) {
    console.error('Get buildings error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

const getBuildingById = async (req, res) => {
  try {
    const [buildings] = await pool.execute(
      `SELECT b.*, u.name as created_by_name FROM buildings b
       LEFT JOIN users u ON b.created_by = u.id WHERE b.id = ?`,
      [req.params.id]
    );

    if (buildings.length === 0) {
      return res.status(404).json({ message: 'Building not found.' });
    }

    const building = buildings[0];

    // Users can view all buildings now
    /*
    if (req.user.role !== 'admin' && building.created_by !== req.user.id) {
      return res.status(403).json({ message: 'Access denied.' });
    }
    */

    // Get assessments for this building
    const [assessments] = await pool.execute(
      `SELECT ra.*, u.name as inspector_name FROM rvs_assessments ra
       LEFT JOIN users u ON ra.inspector_id = u.id
       WHERE ra.building_id = ? ORDER BY ra.assessment_date DESC`,
      [req.params.id]
    );

    // Get photos
    const [photos] = await pool.execute(
      'SELECT * FROM photos WHERE building_id = ? ORDER BY uploaded_at DESC',
      [req.params.id]
    );

    res.json({ building, assessments, photos });
  } catch (error) {
    console.error('Get building error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

const updateBuilding = async (req, res) => {
  try {
    const [buildings] = await pool.execute('SELECT * FROM buildings WHERE id = ?', [req.params.id]);
    if (buildings.length === 0) {
      return res.status(404).json({ message: 'Building not found.' });
    }

    const building = buildings[0];
    if (req.user.role !== 'admin' && building.created_by !== req.user.id) {
      return res.status(403).json({ message: 'Access denied.' });
    }

    const { name, address, use_type, latitude, longitude, stories_above, stories_below, year_built, floor_area } = req.body;

    await pool.execute(
      `UPDATE buildings SET name=?, address=?, use_type=?, latitude=?, longitude=?,
       stories_above=?, stories_below=?, year_built=?, floor_area=? WHERE id=?`,
      [name, address, use_type, latitude || null, longitude || null,
       stories_above || 0, stories_below || 0, year_built || null, floor_area || null, req.params.id]
    );

    const [updated] = await pool.execute('SELECT * FROM buildings WHERE id = ?', [req.params.id]);
    res.json({ message: 'Building updated.', building: updated[0] });
  } catch (error) {
    console.error('Update building error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

const deleteBuilding = async (req, res) => {
  try {
    const [buildings] = await pool.execute('SELECT * FROM buildings WHERE id = ?', [req.params.id]);
    if (buildings.length === 0) {
      return res.status(404).json({ message: 'Building not found.' });
    }

    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can delete buildings.' });
    }

    await pool.execute('DELETE FROM buildings WHERE id = ?', [req.params.id]);
    res.json({ message: 'Building deleted successfully.' });
  } catch (error) {
    console.error('Delete building error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

module.exports = { createBuilding, getBuildings, getBuildingById, updateBuilding, deleteBuilding };
