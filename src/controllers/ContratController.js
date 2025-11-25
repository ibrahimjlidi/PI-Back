const Contrat = require('../models/Contrat');

// Create a new contract
exports.createContrat = async (req, res) => {
  try {
    const contrat = new Contrat(req.body);
    await contrat.save();
    res.status(201).json(contrat);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get all contracts (optional filters: clientId, freelanceId, statut)
exports.getAllContrats = async (req, res) => {
  try {
    const filter = {};
    if (req.query.clientId) filter.clientId = req.query.clientId;
    if (req.query.freelanceId) filter.freelanceId = req.query.freelanceId;
    if (req.query.statut) filter.statut = req.query.statut;

    const contrats = await Contrat.find(filter)
      .populate('clientId', 'nom prenom email')
      .populate('freelanceId', 'nom prenom email')
      .populate('publicationId', 'titre');

    res.status(200).json(contrats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single contract by ID
exports.getContratById = async (req, res) => {
  try {
    const contrat = await Contrat.findById(req.params.id)
      .populate('clientId', 'nom prenom email')
      .populate('freelanceId', 'nom prenom email')
      .populate('publicationId', 'titre')
      .populate('notes.auteur', 'nom prenom email');
    if (!contrat) return res.status(404).json({ message: 'Contrat not found' });
    res.status(200).json(contrat);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update contract
exports.updateContrat = async (req, res) => {
  try {
    const contrat = await Contrat.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!contrat) return res.status(404).json({ message: 'Contrat not found' });
    res.status(200).json(contrat);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete contract
exports.deleteContrat = async (req, res) => {
  try {
    const contrat = await Contrat.findByIdAndDelete(req.params.id);
    if (!contrat) return res.status(404).json({ message: 'Contrat not found' });
    res.status(200).json({ message: 'Contrat deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add a milestone
exports.addMilestone = async (req, res) => {
  try {
    const contrat = await Contrat.findById(req.params.id);
    if (!contrat) return res.status(404).json({ message: 'Contrat not found' });

    contrat.milestones.push(req.body);
    contrat.avancement = contrat.calculerAvancement();
    await contrat.save();

    res.status(201).json(contrat);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update milestone status
exports.updateMilestoneStatus = async (req, res) => {
  try {
    const contrat = await Contrat.findById(req.params.id);
    if (!contrat) return res.status(404).json({ message: 'Contrat not found' });

    const milestone = contrat.milestones.id(req.params.milestoneId);
    if (!milestone) return res.status(404).json({ message: 'Milestone not found' });

    milestone.statut = req.body.statut;
    if (req.body.dateCompletion) milestone.dateCompletion = req.body.dateCompletion;
    contrat.avancement = contrat.calculerAvancement();

    await contrat.save();
    res.status(200).json(contrat);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
