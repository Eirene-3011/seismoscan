const { pool } = require('../config/database');
const { computeScore } = require('../utils/scoring');

const createAssessment = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can create assessments.' });
    }

    const {
      building_id, assessment_date, building_type, soil_type, occupancy,
      exterior_review, interior_review, drawings_reviewed, soil_source,
      geologic_source, contact_person,
      geologic_liquefaction, geologic_landslide, geologic_surf_rupt,
      adjacency_pounding, adjacency_falling_hazards,
      irregularity_vertical, irregularity_vertical_type,
      irregularity_plan, irregularity_plan_type,
      irregularity_severe_vertical, irregularity_moderate_vertical,
      hazard_unbraced_chimneys, hazard_parapets, hazard_heavy_cladding,
      hazard_appendages, hazard_other,
      additions_none, additions_yes,
      other_hazard_pounding, other_hazard_falling, other_hazard_geologic, other_hazard_damage,
      action_structural_unknown_type, action_structural_score_cutoff,
      action_structural_other_hazards, action_structural_yes, action_structural_no,
      action_nonstructural_yes, action_nonstructural_no, action_nonstructural_dnk,
      level2_performed, level2_score, level2_nonstructural,
      comments,
    } = req.body;

    if (!building_id || !building_type) {
      return res.status(400).json({ message: 'Building ID and building type are required.' });
    }

    const [buildings] = await pool.execute('SELECT * FROM buildings WHERE id = ?', [building_id]);
    if (buildings.length === 0) {
      return res.status(404).json({ message: 'Building not found.' });
    }

    const building = buildings[0];

    const scoreResult = computeScore({
      building_type,
      soil_type,
      irregularity_vertical: irregularity_vertical === true || irregularity_vertical === 'true',
      irregularity_plan: irregularity_plan === true || irregularity_plan === 'true',
      irregularity_severe_vertical: irregularity_severe_vertical === true || irregularity_severe_vertical === 'true',
      irregularity_moderate_vertical: irregularity_moderate_vertical === true || irregularity_moderate_vertical === 'true',
      year_built: building.year_built,
      stories_above: building.stories_above,
    });

    const [result] = await pool.execute(
      `INSERT INTO rvs_assessments (
        building_id, inspector_id, assessment_date, building_type, soil_type, occupancy,
        exterior_review, interior_review, drawings_reviewed, soil_source, geologic_source, contact_person,
        geologic_liquefaction, geologic_landslide, geologic_surf_rupt,
        adjacency_pounding, adjacency_falling_hazards,
        irregularity_vertical, irregularity_vertical_type,
        irregularity_plan, irregularity_plan_type,
        hazard_unbraced_chimneys, hazard_parapets, hazard_heavy_cladding,
        hazard_appendages, hazard_other,
        additions_none, additions_yes,
        base_score, mod_severe_vertical, mod_moderate_vertical, mod_plan_irregularity,
        mod_pre_code, mod_post_benchmark, mod_soil_type_ab, mod_soil_type_e_1_3, mod_soil_type_e_gt3,
        final_score, min_score, result,
        other_hazard_pounding, other_hazard_falling, other_hazard_geologic, other_hazard_damage,
        action_structural_unknown_type, action_structural_score_cutoff,
        action_structural_other_hazards, action_structural_yes, action_structural_no,
        action_nonstructural_yes, action_nonstructural_no, action_nonstructural_dnk,
        level2_performed, level2_score, level2_nonstructural, comments
      ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        building_id, req.user.id, assessment_date || new Date().toISOString().split('T')[0],
        building_type, soil_type || 'DNK', occupancy || null,
        exterior_review || 'all_sides', interior_review || 'none',
        drawings_reviewed === 'yes' || drawings_reviewed === true ? 1 : 0,
        soil_source || null, geologic_source || null, contact_person || null,
        geologic_liquefaction || 'dnk', geologic_landslide || 'dnk', geologic_surf_rupt || 'dnk',
        adjacency_pounding ? 1 : 0, adjacency_falling_hazards ? 1 : 0,
        irregularity_vertical ? 1 : 0, irregularity_vertical_type || null,
        irregularity_plan ? 1 : 0, irregularity_plan_type || null,
        hazard_unbraced_chimneys ? 1 : 0, hazard_parapets ? 1 : 0,
        hazard_heavy_cladding ? 1 : 0, hazard_appendages ? 1 : 0, hazard_other || null,
        additions_none !== false ? 1 : 0, additions_yes || null,
        scoreResult.base_score,
        scoreResult.modifiers.severe_vertical || 0,
        scoreResult.modifiers.moderate_vertical || 0,
        scoreResult.modifiers.plan_irregularity || 0,
        scoreResult.modifiers.pre_code || 0,
        scoreResult.modifiers.post_benchmark || 0,
        scoreResult.modifiers.soil_type_ab || 0,
        scoreResult.modifiers.soil_type_e_1_3 || 0,
        scoreResult.modifiers.soil_type_e_gt3 || 0,
        scoreResult.final_score, scoreResult.min_score, scoreResult.result,
        other_hazard_pounding ? 1 : 0, other_hazard_falling ? 1 : 0,
        other_hazard_geologic ? 1 : 0, other_hazard_damage ? 1 : 0,
        action_structural_unknown_type ? 1 : 0, action_structural_score_cutoff ? 1 : 0,
        action_structural_other_hazards ? 1 : 0, action_structural_yes ? 1 : 0, action_structural_no ? 1 : 0,
        action_nonstructural_yes ? 1 : 0, action_nonstructural_no ? 1 : 0, action_nonstructural_dnk ? 1 : 0,
        level2_performed ? 1 : 0, level2_score || null, level2_nonstructural || null,
        comments || null,
      ]
    );

    const [assessment] = await pool.execute('SELECT * FROM rvs_assessments WHERE id = ?', [result.insertId]);
    res.status(201).json({
      message: 'Assessment created successfully.',
      assessment: assessment[0],
      scoring: scoreResult,
    });
  } catch (error) {
    console.error('Create assessment error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

const getAssessments = async (req, res) => {
  try {
    const { result, date_from, date_to, building_id, page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let query = `
      SELECT ra.*,
             b.name as building_name, b.address as building_address,
             b.use_type, b.year_built, b.floor_area,
             b.stories_above, b.stories_below,
             b.latitude, b.longitude,
             u.name as inspector_name,
             (SELECT image_url FROM photos WHERE building_id = b.id ORDER BY uploaded_at ASC LIMIT 1) as building_photo
      FROM rvs_assessments ra
      LEFT JOIN buildings b ON ra.building_id = b.id
      LEFT JOIN users u ON ra.inspector_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (result) {
      query += ' AND ra.result = ?';
      params.push(result);
    }

    if (date_from) {
      query += ' AND ra.assessment_date >= ?';
      params.push(date_from);
    }

    if (date_to) {
      query += ' AND ra.assessment_date <= ?';
      params.push(date_to);
    }

    if (building_id) {
      query += ' AND ra.building_id = ?';
      params.push(building_id);
    }

    query += ' ORDER BY ra.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const [assessments] = await pool.execute(query, params);

    res.json({ assessments, page: parseInt(page), limit: parseInt(limit) });
  } catch (error) {
    console.error('Get assessments error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

const getAssessmentById = async (req, res) => {
  try {
    const [assessments] = await pool.execute(
      `SELECT ra.*, b.name as building_name, b.address as building_address,
              b.use_type, b.latitude, b.longitude, b.stories_above, b.stories_below,
              b.year_built, b.floor_area, u.name as inspector_name, u.email as inspector_email
       FROM rvs_assessments ra
       LEFT JOIN buildings b ON ra.building_id = b.id
       LEFT JOIN users u ON ra.inspector_id = u.id
       WHERE ra.id = ?`,
      [req.params.id]
    );

    if (assessments.length === 0) {
      return res.status(404).json({ message: 'Assessment not found.' });
    }

    const assessment = assessments[0];

    const [photos] = await pool.execute(
      'SELECT * FROM photos WHERE building_id = ? ORDER BY uploaded_at DESC',
      [assessment.building_id]
    );

    res.json({ assessment, photos });
  } catch (error) {
    console.error('Get assessment error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

const updateAssessment = async (req, res) => {
  try {
    const [assessments] = await pool.execute('SELECT * FROM rvs_assessments WHERE id = ?', [req.params.id]);
    if (assessments.length === 0) {
      return res.status(404).json({ message: 'Assessment not found.' });
    }

    const assessment = assessments[0];
    if (req.user.role !== 'admin' && assessment.inspector_id !== req.user.id) {
      return res.status(403).json({ message: 'Access denied.' });
    }

    const [buildings] = await pool.execute('SELECT * FROM buildings WHERE id = ?', [assessment.building_id]);
    const building = buildings[0];

    const {
      building_type, soil_type, irregularity_vertical, irregularity_plan,
      irregularity_severe_vertical, irregularity_moderate_vertical, comments
    } = req.body;

    const scoreResult = computeScore({
      building_type: building_type || assessment.building_type,
      soil_type: soil_type || assessment.soil_type,
      irregularity_vertical: irregularity_vertical !== undefined ? irregularity_vertical : assessment.irregularity_vertical,
      irregularity_plan: irregularity_plan !== undefined ? irregularity_plan : assessment.irregularity_plan,
      irregularity_severe_vertical,
      irregularity_moderate_vertical,
      year_built: building.year_built,
      stories_above: building.stories_above,
    });

    await pool.execute(
      `UPDATE rvs_assessments SET 
        building_type=?, soil_type=?, irregularity_vertical=?, irregularity_plan=?,
        base_score=?, final_score=?, min_score=?, result=?, comments=?
       WHERE id=?`,
      [
        building_type || assessment.building_type,
        soil_type || assessment.soil_type,
        irregularity_vertical !== undefined ? (irregularity_vertical ? 1 : 0) : assessment.irregularity_vertical,
        irregularity_plan !== undefined ? (irregularity_plan ? 1 : 0) : assessment.irregularity_plan,
        scoreResult.base_score, scoreResult.final_score, scoreResult.min_score, scoreResult.result,
        comments !== undefined ? comments : assessment.comments,
        req.params.id,
      ]
    );

    const [updated] = await pool.execute('SELECT * FROM rvs_assessments WHERE id = ?', [req.params.id]);
    res.json({ message: 'Assessment updated.', assessment: updated[0], scoring: scoreResult });
  } catch (error) {
    console.error('Update assessment error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

const deleteAssessment = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can delete assessments.' });
    }

    const [assessments] = await pool.execute('SELECT id FROM rvs_assessments WHERE id = ?', [req.params.id]);
    if (assessments.length === 0) {
      return res.status(404).json({ message: 'Assessment not found.' });
    }

    await pool.execute('DELETE FROM rvs_assessments WHERE id = ?', [req.params.id]);
    res.json({ message: 'Assessment deleted successfully.' });
  } catch (error) {
    console.error('Delete assessment error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

const computeScorePreview = async (req, res) => {
  try {
    const scoreResult = computeScore(req.body);
    res.json(scoreResult);
  } catch (error) {
    console.error('Score compute error:', error);
    res.status(500).json({ message: 'Error computing score.' });
  }
};

module.exports = { createAssessment, getAssessments, getAssessmentById, updateAssessment, deleteAssessment, computeScorePreview };
