const express = require('express');
const router = express.Router();
const { uploadPhoto, getPhotos, deletePhoto } = require('../controllers/photoController');
const { authenticateToken } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.use(authenticateToken);

router.post('/', upload.single('photo'), uploadPhoto);
router.get('/', getPhotos);
router.delete('/:id', deletePhoto);

module.exports = router;
