const express = require('express');
const router = express.Router();
const publicationController = require('../controllers/publicationController');

router.get('/publications', publicationController.getAllPublications);
router.get('/publications/:id', publicationController.getPublicationById);
router.post('/publications', publicationController.createPublication);
router.put('/publications/:id', publicationController.updatePublication);
router.delete('/publications/:id', publicationController.deletePublication);

// candidatures pour un freelance
router.get('/publications/freelance/:freelanceId/candidatures', publicationController.getCandidaturesForFreelance);

// ajouter une candidature
router.post('/publications/:id/candidatures', publicationController.addCandidature);

// mettre à jour statut candidature
router.put('/publications/:publicationId/candidatures/:candidatureId/status', publicationController.updateCandidatureStatus);

module.exports = router;
