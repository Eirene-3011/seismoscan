const express = require('express');
const router = express.Router();
const {
  createAssessment, getAssessments, getAssessmentById, updateAssessment, deleteAssessment, computeScorePreview
} = require('../controllers/rvsController');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

router.post('/compute-score', computeScorePreview);
router.post('/', createAssessment);
router.get('/', getAssessments);
router.get('/:id', getAssessmentById);
router.put('/:id', updateAssessment);
router.delete('/:id', deleteAssessment);

module.exports = router;
