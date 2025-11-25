const Utilisateur = require('../models/Utilisateur');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// ------------------ REGISTER ------------------
exports.register = async (req, res) => {
  try {
    const { email, mdp, ...rest } = req.body;

    const existingUser = await Utilisateur.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "Email already in use" });

    const hashedPassword = await bcrypt.hash(mdp, 10);

    const utilisateur = new Utilisateur({ email, mdp: hashedPassword, ...rest });
    await utilisateur.save();

    res.status(201).json({ message: "User created successfully", utilisateur });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
// ------------------ GET USERS BY ROLE LIST ------------------
exports.getUtilisateursByRoles = async (req, res) => {
  try {
    // Roles to filter
    const roles = ['client', 'freelance', 'admin', 'candidat', 'formateur'];

    // Find users whose role is in the roles array
    const utilisateurs = await Utilisateur.find({ role: { $in: roles } });

    res.status(200).json(utilisateurs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ------------------ LOGIN ------------------
exports.login = async (req, res) => {
  try {
    const { email, mdp } = req.body;

    const utilisateur = await Utilisateur.findOne({ email });
    if (!utilisateur) return res.status(404).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(mdp, utilisateur.mdp);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign(
      { id: utilisateur._id, role: utilisateur.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.status(200).json({ token, utilisateur });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ------------------ GET ALL USERS ------------------
exports.getAllUtilisateurs = async (req, res) => {
  try {
    const filter = {};
    if (req.query.role) filter.role = req.query.role;
    if (req.query.specialite) filter.specialite = req.query.specialite;

    const utilisateurs = await Utilisateur.find(filter);
    res.status(200).json(utilisateurs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ------------------ GET USER BY ID ------------------
exports.getUtilisateurById = async (req, res) => {
  try {
    const utilisateur = await Utilisateur.findById(req.params.id);
    if (!utilisateur) return res.status(404).json({ message: 'Utilisateur not found' });
    res.status(200).json(utilisateur);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ------------------ UPDATE USER ------------------
exports.updateUtilisateur = async (req, res) => {
  try {
    // Only allow certain fields to be updated
    const allowedUpdates = ['nom', 'prenom', 'num_tel', 'specialite', 'tarifHoraire', 'description', 'competences', 'mdp'];
    const updates = {};
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    // Hash password if provided
    if (updates.mdp) {
      updates.mdp = await bcrypt.hash(updates.mdp, 10);
    }

    // Ensure user is updating their own profile
    if (req.userId !== req.params.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const utilisateur = await Utilisateur.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );

    if (!utilisateur) return res.status(404).json({ message: 'Utilisateur not found' });

    res.status(200).json(utilisateur);

  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
// ------------------ DELETE USER ------------------
exports.deleteUtilisateur = async (req, res) => {
  try {
    const utilisateur = await Utilisateur.findByIdAndDelete(req.params.id);
    if (!utilisateur) return res.status(404).json({ message: 'Utilisateur not found' });
    res.status(200).json({ message: 'Utilisateur deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
exports.getFormateurs = async (req, res) => {
  try {
    const formateurs = await Utilisateur.find({ role: 'formateur' });
    res.json(formateurs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};