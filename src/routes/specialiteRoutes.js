const express = require('express');
const router = express.Router();
const SpecialiteController = require('../controllers/specialiteController');

// GET all specialties
router.get('/', SpecialiteController.getAllSpecialites);

module.exports = router;
