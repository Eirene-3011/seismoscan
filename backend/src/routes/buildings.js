const express = require('express');
const router = express.Router();
const {
  createBuilding, getBuildings, getBuildingById, updateBuilding, deleteBuilding
} = require('../controllers/buildingController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

router.use(authenticateToken);

router.post('/', createBuilding);
router.get('/', getBuildings);
router.get('/:id', getBuildingById);
router.put('/:id', updateBuilding);
router.delete('/:id', requireAdmin, deleteBuilding);

module.exports = router;
