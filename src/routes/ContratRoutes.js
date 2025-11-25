const express = require('express');
const router = express.Router();
const contratController = require('../controllers/contratController');

// CRUD routes
router.post('/', contratController.createContrat); // Create
router.get('/', contratController.getAllContrats); // Get all
router.get('/:id', contratController.getContratById); // Get one
router.put('/:id', contratController.updateContrat); // Update
router.delete('/:id', contratController.deleteContrat); // Delete

// Milestone routes
router.post('/:id/milestones', contratController.addMilestone); // Add milestone
router.put('/:id/milestones/:milestoneId', contratController.updateMilestoneStatus); // Update milestone status

module.exports = router;
