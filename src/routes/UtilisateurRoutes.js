const express = require('express');
const router = express.Router();
const utilisateurController = require('../controllers/utilisateurController');
const { authMiddleware, isAdmin } = require('../middlewares/authMiddleware');

// PUBLIC ROUTES
router.post('/register', utilisateurController.register);
router.post('/login', utilisateurController.login);

// PROTECTED ROUTES
router.get('/utilisateurs', utilisateurController.getAllUtilisateurs);

router.get('/:id', authMiddleware, async (req, res, next) => {
  if (req.user.role === 'admin' || req.user.id === req.params.id) {
    return utilisateurController.getUtilisateurById(req, res, next);
  }
  return res.status(403).json({ message: 'Access denied' });
});

router.put('/update/:id', async (req, res, next) => {
  
    return utilisateurController.updateUtilisateur(req, res, next);
  
});

router.delete('/:id', authMiddleware, isAdmin, utilisateurController.deleteUtilisateur);
// Get all formateurs
router.get('/formateurs', utilisateurController.getFormateurs);

module.exports = router;
