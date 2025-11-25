const express = require('express');
const router = express.Router();
const categorieController = require('../controllers/categorieController');

// CRUD endpoints
router.post('/', categorieController.createCategorie);
router.get('/', categorieController.getAllCategories);
router.get('/:id', categorieController.getCategorieById);
router.put('/:id', categorieController.updateCategorie);
router.delete('/:id', categorieController.deleteCategorie);

module.exports = router; // ✅ Must export the router, NOT an object
