const { pool } = require('../config/database');

const getReport = async (req, res) => {
  try {
    const [assessments] = await pool.execute(
      `SELECT ra.*, 
              b.name as building_name, b.address as building_address,
              b.use_type, b.latitude, b.longitude, b.stories_above, b.stories_below,
              b.year_built, b.floor_area,
              u.name as inspector_name, u.email as inspector_email
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

    // Users can view all reports now
    /*
    if (req.user.role !== 'admin' && assessment.inspector_id !== req.user.id) {
      return res.status(403).json({ message: 'Access denied.' });
    }
    */

    // Get photos
    const [photos] = await pool.execute(
      'SELECT * FROM photos WHERE building_id = ? ORDER BY uploaded_at ASC',
      [assessment.building_id]
    );

    // Log report generation
    await pool.execute(
      'INSERT INTO reports (assessment_id, generated_by) VALUES (?, ?)',
      [assessment.id, req.user.id]
    );

    // Compile the four summary tables
    const report = {
      // Table 1: Building Information and Score
      table1_building_info: {
        building_name: assessment.building_name,
        address: assessment.building_address,
        use: assessment.use_type,
        latitude: assessment.latitude,
        longitude: assessment.longitude,
        stories_above: assessment.stories_above,
        stories_below: assessment.stories_below,
        year_built: assessment.year_built,
        floor_area: assessment.floor_area,
        building_type: assessment.building_type,
        occupancy: assessment.occupancy,
        soil_type: assessment.soil_type,
        base_score: parseFloat(assessment.base_score),
        mod_severe_vertical: parseFloat(assessment.mod_severe_vertical),
        mod_moderate_vertical: parseFloat(assessment.mod_moderate_vertical),
        mod_plan_irregularity: parseFloat(assessment.mod_plan_irregularity),
        mod_pre_code: parseFloat(assessment.mod_pre_code),
        mod_post_benchmark: parseFloat(assessment.mod_post_benchmark),
        mod_soil_type_ab: parseFloat(assessment.mod_soil_type_ab),
        mod_soil_type_e_1_3: parseFloat(assessment.mod_soil_type_e_1_3),
        mod_soil_type_e_gt3: parseFloat(assessment.mod_soil_type_e_gt3),
        final_score: parseFloat(assessment.final_score),
        min_score: parseFloat(assessment.min_score),
        result: assessment.result,
        assessment_date: assessment.assessment_date,
        inspector_name: assessment.inspector_name,
      },
      // Table 2: Photos
      table2_photos: photos.map(p => ({
        id: p.id,
        url: p.image_url,
        caption: p.caption,
        uploaded_at: p.uploaded_at,
      })),
      // Table 3: Extent of Review and Other Hazards
      table3_review_hazards: {
        exterior_review: assessment.exterior_review,
        interior_review: assessment.interior_review,
        drawings_reviewed: assessment.drawings_reviewed,
        soil_source: assessment.soil_source,
        geologic_source: assessment.geologic_source,
        contact_person: assessment.contact_person,
        geologic_liquefaction: assessment.geologic_liquefaction,
        geologic_landslide: assessment.geologic_landslide,
        geologic_surf_rupt: assessment.geologic_surf_rupt,
        adjacency_pounding: assessment.adjacency_pounding,
        adjacency_falling_hazards: assessment.adjacency_falling_hazards,
        irregularity_vertical: assessment.irregularity_vertical,
        irregularity_vertical_type: assessment.irregularity_vertical_type,
        irregularity_plan: assessment.irregularity_plan,
        irregularity_plan_type: assessment.irregularity_plan_type,
        hazard_unbraced_chimneys: assessment.hazard_unbraced_chimneys,
        hazard_parapets: assessment.hazard_parapets,
        hazard_heavy_cladding: assessment.hazard_heavy_cladding,
        hazard_appendages: assessment.hazard_appendages,
        hazard_other: assessment.hazard_other,
        other_hazard_pounding: assessment.other_hazard_pounding,
        other_hazard_falling: assessment.other_hazard_falling,
        other_hazard_geologic: assessment.other_hazard_geologic,
        other_hazard_damage: assessment.other_hazard_damage,
        comments: assessment.comments,
      },
      // Table 4: Action Required
      table4_action_required: {
        result: assessment.result,
        final_score: parseFloat(assessment.final_score),
        action_structural_unknown_type: assessment.action_structural_unknown_type,
        action_structural_score_cutoff: assessment.action_structural_score_cutoff,
        action_structural_other_hazards: assessment.action_structural_other_hazards,
        action_structural_yes: assessment.action_structural_yes,
        action_structural_no: assessment.action_structural_no,
        action_nonstructural_yes: assessment.action_nonstructural_yes,
        action_nonstructural_no: assessment.action_nonstructural_no,
        action_nonstructural_dnk: assessment.action_nonstructural_dnk,
        level2_performed: assessment.level2_performed,
        level2_score: assessment.level2_score,
        level2_nonstructural: assessment.level2_nonstructural,
        recommendation: assessment.result === 'PASS'
          ? 'Building passes Level 1 RVS screening. No further action required at this time.'
          : 'Building FAILS Level 1 RVS screening. A Level 2 structural evaluation is required.',
      },
    };

    res.json({ report, assessment_id: assessment.id });
  } catch (error) {
    console.error('Get report error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

const getDashboardStats = async (req, res) => {
  try {
    let baseWhere = '';
    const params = [];

    // Users can now see all stats
    /*
    if (req.user.role !== 'admin') {
      baseWhere = 'WHERE ra.inspector_id = ?';
      params.push(req.user.id);
    }
    */

    const [[stats]] = await pool.execute(
      `SELECT 
        COUNT(DISTINCT b.id) as total_buildings,
        COUNT(ra.id) as total_assessments,
        SUM(CASE WHEN ra.result = 'PASS' THEN 1 ELSE 0 END) as passed,
        SUM(CASE WHEN ra.result = 'FAIL' THEN 1 ELSE 0 END) as failed
       FROM buildings b
       LEFT JOIN rvs_assessments ra ON ra.building_id = b.id
       /* ${req.user.role !== 'admin' ? 'WHERE b.created_by = ?' : ''} */`,
      /* req.user.role !== 'admin' ? [req.user.id] : [] */ []
    );

    const [recentAssessments] = await pool.execute(
      `SELECT ra.id, ra.assessment_date, ra.building_type, ra.final_score, ra.result,
              b.name as building_name, b.address as building_address,
              u.name as inspector_name
       FROM rvs_assessments ra
       LEFT JOIN buildings b ON ra.building_id = b.id
       LEFT JOIN users u ON ra.inspector_id = u.id
       ${baseWhere}
       ORDER BY ra.created_at DESC LIMIT 5`,
      params
    );

    res.json({
      stats: {
        total_buildings: parseInt(stats.total_buildings) || 0,
        total_assessments: parseInt(stats.total_assessments) || 0,
        passed: parseInt(stats.passed) || 0,
        failed: parseInt(stats.failed) || 0,
      },
      recent_assessments: recentAssessments,
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

module.exports = { getReport, getDashboardStats };
