// controllers/categorieController.js
const Categorie = require('../models/Categorie');

// Create
exports.createCategorie = async (req, res) => {
  try {
    const categorie = new Categorie(req.body);
    await categorie.save();
    res.status(201).json(categorie);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Read all
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Categorie.find({ actif: true }).sort({ ordre: 1 });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Read one
exports.getCategorieById = async (req, res) => {
  try {
    const categorie = await Categorie.findById(req.params.id);
    if (!categorie) return res.status(404).json({ error: 'Categorie not found' });
    res.json(categorie);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update
exports.updateCategorie = async (req, res) => {
  try {
    const categorie = await Categorie.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!categorie) return res.status(404).json({ error: 'Categorie not found' });
    res.json(categorie);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete
exports.deleteCategorie = async (req, res) => {
  try {
    const categorie = await Categorie.findByIdAndDelete(req.params.id);
    if (!categorie) return res.status(404).json({ error: 'Categorie not found' });
    res.json({ message: 'Categorie deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
