/**
 * FEMA P-154 RVS Scoring Logic
 * Base scores and modifiers for seismic assessment
 */

// Base scores table from FEMA P-154 (HIGH Seismicity)
const BASE_SCORES = {
  DNK: 3.6,
  W1:  3.2,
  W1A: 2.9,  // W2 in some references
  W2:  2.9,
  S1:  2.1,
  S2:  2.0,
  S3:  2.6,
  S4:  2.0,
  S5:  1.7,
  C1:  1.5,
  C2:  2.0,
  C3:  1.2,
  PC1: 1.6,
  PC2: 1.4,
  RM1: 1.7,
  RM2: 1.7,
  URM: 1.0,
  MH:  1.5,
};

// Minimum scores per building type
const MIN_SCORES = {
  DNK: 1.1,
  W1:  0.9,
  W1A: 0.7,
  W2:  0.7,
  S1:  0.5,
  S2:  0.5,
  S3:  0.6,
  S4:  0.5,
  S5:  0.5,
  C1:  0.3,
  C2:  0.3,
  C3:  0.3,
  PC1: 0.2,
  PC2: 0.3,
  RM1: 0.3,
  RM2: 0.2,
  URM: 1.0,
  MH:  1.0,
};

// Score modifiers table from FEMA P-154 (HIGH Seismicity)
// Format: { buildingType: modifier_value }
const MODIFIERS = {
  severe_vertical: {
    DNK: -1.2, W1: -1.2, W1A: -1.2, W2: -1.1, S1: -1.1, S2: -1.0, S3: -1.1, S4: -1.0,
    C1: -0.8, C2: -0.9, C3: -1.0, PC1: -0.7, PC2: -0.1, RM1: -0.5, RM2: -0.3, URM: -0.5, MH: -0.1
  },
  moderate_vertical: {
    DNK: -0.7, W1: -0.7, W1A: -0.7, W2: -0.6, S1: -0.8, S2: -0.6, S3: -0.7, S4: -0.5,
    C1: -0.6, C2: -0.4, C3: -0.6, PC1: -0.5, PC2: -0.0, RM1: -0.5, RM2: -0.5, URM: -0.4, MH: 0
  },
  plan_irregularity: {
    DNK: -1.1, W1: -1.0, W1A: -1.0, W2: -0.8, S1: -0.7, S2: -0.9, S3: -0.7, S4: -0.6,
    C1: -0.6, C2: -0.8, C3: -0.5, PC1: -0.5, PC2: -0.3, RM1: -0.6, RM2: -0.7, URM: -0.7, MH: -0.4
  },
  pre_code: {
    DNK: -1.1, W1: -1.0, W1A: -1.0, W2: -0.8, S1: -0.6, S2: -0.8, S3: -0.6, S4: -0.2,
    C1: -0.4, C2: -0.7, C3: -0.1, PC1: -0.5, PC2: -0.3, RM1: -0.5, RM2: -0.5, URM: 0.0, MH: -0.1
  },
  post_benchmark: {
    DNK: 1.6, W1: 1.9, W1A: 2.2, W2: 1.4, S1: 1.4, S2: 1.1, S3: 1.9, S4: 0, // S4 doesn't apply
    C1: 1.9, C2: 2.1, C3: 0, // C3 doesn't apply
    PC1: 2.0, PC2: 2.4, RM1: 2.1, RM2: 2.1, URM: 0, // URM doesn't apply
    MH: 1.2
  },
  soil_type_ab: {
    DNK: 0.3, W1: 0.2, W1A: 0.2, W2: 0.5, S1: 0.4, S2: 0.2, S3: 0.5, S4: 0.0,
    C1: 0.4, C2: 0.5, C3: 0.3, PC1: 0.3, PC2: 0.6, RM1: 0.3, RM2: 0.3, URM: 0.3, MH: 0.3
  },
  soil_type_e_1_3: {
    DNK: 0.2, W1: 0.2, W1A: 0.1, W2: -0.2, S1: -0.4, S2: 0.2, S3: -0.1, S4: -0.4,
    C1: 0.0, C2: 0.0, C3: -0.2, PC1: -0.3, PC2: -0.1, RM1: -0.1, RM2: -0.1, URM: -0.2, MH: -0.4
  },
  soil_type_e_gt3: {
    DNK: -0.3, W1: -0.6, W1A: -0.9, W2: -0.6, S1: -0.6, S2: -0.9, S3: -0.6, S4: -0.6,
    C1: -0.6, C2: -0.5, C3: -0.4, PC1: -0.5, PC2: -0.7, RM1: -0.3, RM2: -0.4, URM: -0.3, MH: 0
  }
};

/**
 * Compute the RVS score based on FEMA P-154 methodology
 * @param {Object} params - Assessment parameters
 * @returns {Object} - Computed scores and result
 */
function computeScore(params) {
  const {
    building_type,
    soil_type,
    irregularity_vertical,
    irregularity_plan,
    year_built,
    stories_above,
    mod_severe_vertical = false,
    mod_moderate_vertical = false,
  } = params;

  const bt = building_type || 'DNK';

  const baseScore = BASE_SCORES[bt] || BASE_SCORES.DNK;
  const minScore = MIN_SCORES[bt] || MIN_SCORES.DNK;

  let totalModifiers = 0;
  const modDetails = {};

  // Vertical irregularity modifier (use severe or moderate)
  if (mod_severe_vertical || params.irregularity_severe_vertical) {
    const mod = MODIFIERS.severe_vertical[bt] || 0;
    modDetails.severe_vertical = mod;
    totalModifiers += mod;
  } else if (mod_moderate_vertical || params.irregularity_moderate_vertical) {
    const mod = MODIFIERS.moderate_vertical[bt] || 0;
    modDetails.moderate_vertical = mod;
    totalModifiers += mod;
  } else if (irregularity_vertical) {
    // Default to moderate if just "vertical irregularity" is checked
    const mod = MODIFIERS.moderate_vertical[bt] || 0;
    modDetails.moderate_vertical = mod;
    totalModifiers += mod;
  }

  // Plan irregularity modifier
  if (irregularity_plan) {
    const mod = MODIFIERS.plan_irregularity[bt] || 0;
    modDetails.plan_irregularity = mod;
    totalModifiers += mod;
  }

  // Pre-code or post-benchmark modifier
  // Pre-code: before local seismic code adoption (roughly 1940 or building type specific)
  // Post-benchmark: after significant code improvements
  if (year_built) {
    const yearBuilt = parseInt(year_built);
    const benchmarkYears = {
      W1: 1979, W1A: 1979, W2: 1979,
      S1: 1994, S2: 1994, S3: 1994, S4: 1994, S5: 1994,
      C1: 1994, C2: 1994, C3: 1994,
      PC1: 1994, PC2: 1994,
      RM1: 1994, RM2: 1994,
      URM: 1979, MH: 1994,
    };
    const preCodeYear = 1940;
    const benchmark = benchmarkYears[bt] || 1994;

    if (yearBuilt < preCodeYear) {
      const mod = MODIFIERS.pre_code[bt] || 0;
      modDetails.pre_code = mod;
      totalModifiers += mod;
    } else if (yearBuilt >= benchmark) {
      const mod = MODIFIERS.post_benchmark[bt] || 0;
      if (mod !== 0) {
        modDetails.post_benchmark = mod;
        totalModifiers += mod;
      }
    }
  }

  // Soil type modifiers
  if (soil_type === 'A' || soil_type === 'B') {
    const mod = MODIFIERS.soil_type_ab[bt] || 0;
    modDetails.soil_type_ab = mod;
    totalModifiers += mod;
  } else if (soil_type === 'E') {
    const numStories = parseInt(stories_above) || 1;
    if (numStories <= 3) {
      const mod = MODIFIERS.soil_type_e_1_3[bt] || 0;
      modDetails.soil_type_e_1_3 = mod;
      totalModifiers += mod;
    } else {
      const mod = MODIFIERS.soil_type_e_gt3[bt] || 0;
      modDetails.soil_type_e_gt3 = mod;
      totalModifiers += mod;
    }
  }

  // Compute final score
  let finalScore = baseScore + totalModifiers;

  // Apply minimum score
  finalScore = Math.max(finalScore, minScore);

  // Round to 1 decimal place
  finalScore = Math.round(finalScore * 10) / 10;

  const result = finalScore >= 2.0 ? 'PASS' : 'FAIL';

  return {
    base_score: baseScore,
    min_score: minScore,
    modifiers: modDetails,
    total_modifiers: Math.round(totalModifiers * 10) / 10,
    final_score: finalScore,
    result,
  };
}

module.exports = { computeScore, BASE_SCORES, MIN_SCORES, MODIFIERS };
