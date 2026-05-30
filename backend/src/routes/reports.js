const express = require('express');
const router = express.Router();
const { getReport, getDashboardStats } = require('../controllers/reportController');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

router.get('/dashboard', getDashboardStats);
router.get('/:id', getReport);

module.exports = router;
