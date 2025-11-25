const Publication = require('../models/Publication');
const mongoose = require('mongoose');

// Util - vérifie ObjectId
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// Get all publications with optional status filter (case-insensitive)
exports.getAllPublications = async (req, res) => {
  try {
    const { statut } = req.query;
    const filter = {};
    if (statut) {
      // filtre insensible à la casse
      filter.statut = new RegExp(`^${statut}$`, 'i');
    }

    const publications = await Publication.find(filter)
      .populate('client', 'nom prenom email')
      .populate('categorie', 'nom')
      .populate({
        path: 'candidatures.candidatId',
        select: 'nom prenom email specialite'
      });

    return res.status(200).json(publications);
  } catch (error) {
    console.error('Error in getAllPublications:', error);
    return res.status(500).json({ error: 'An error occurred while fetching publications' });
  }
};

// Get publication by ID
exports.getPublicationById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) return res.status(400).json({ error: 'Invalid ID' });

    const publication = await Publication.findById(id)
      .populate('client', 'nom prenom email')
      .populate('categorie', 'nom')
      .populate({
        path: 'candidatures.candidatId',
        select: 'nom prenom email specialite'
      });

    if (!publication) return res.status(404).json({ error: 'Publication not found' });

    return res.status(200).json(publication);
  } catch (error) {
    console.error('Error in getPublicationById:', error);
    return res.status(500).json({ error: 'Error fetching publication' });
  }
};

// Get publications (and candidatures) for a freelance
// Route: GET /api/publications/freelance/:freelanceId/candidatures
// Retourne un tableau d'objets { _id: candidature._id, publication, client, candidature }
exports.getCandidaturesForFreelance = async (req, res) => {
  try {
    const { freelanceId } = req.params;
    if (!isValidObjectId(freelanceId)) return res.status(400).json({ error: 'Invalid freelance ID' });

    // Trouver publications contenant une candidature de ce freelance
    const publications = await Publication.find({ 'candidatures.candidatId': freelanceId })
      .populate('client', 'nom prenom email')
      .populate('categorie', 'nom')
      .populate({
        path: 'candidatures.candidatId',
        select: 'nom prenom email specialite'
      });

    // Construire une réponse plus simple pour le front
    const results = publications.map((pub) => {
      const candidature = pub.candidatures.find(c => {
        // peut être stocké comme ObjectId ou objet
        return String(c.candidatId) === String(freelanceId);
      });
      return {
        _id: candidature ? candidature._id : null,
        publication: {
          _id: pub._id,
          titre: pub.titre,
          description: pub.description,
          budget: pub.budget,
          dateLimite: pub.dateLimite,
          categorie: pub.categorie
        },
        client: pub.client,
        candidature // renvoie l'objet candidature complet (prixPropose, delaiPropose, statut, message, candidatId, etc.)
      };
    });

    return res.status(200).json(results);
  } catch (error) {
    console.error('Error in getCandidaturesForFreelance:', error);
    return res.status(500).json({ error: 'Error fetching candidatures for freelance' });
  }
};

// Create a publication
exports.createPublication = async (req, res) => {
  try {
    const publication = new Publication(req.body);
    await publication.save();
    return res.status(201).json(publication);
  } catch (error) {
    console.error('Error in createPublication:', error);
    return res.status(400).json({ error: error.message });
  }
};

// Update publication by ID
exports.updatePublication = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) return res.status(400).json({ error: 'Invalid ID' });

    const updated = await Publication.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
    if (!updated) return res.status(404).json({ error: 'Publication not found' });

    return res.status(200).json(updated);
  } catch (error) {
    console.error('Error in updatePublication:', error);
    return res.status(400).json({ error: error.message });
  }
};

// Delete publication by ID
exports.deletePublication = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) return res.status(400).json({ error: 'Invalid ID' });

    const deleted = await Publication.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ error: 'Publication not found' });

    return res.status(200).json({ message: 'Publication deleted' });
  } catch (error) {
    console.error('Error in deletePublication:', error);
    return res.status(500).json({ error: 'Error deleting publication' });
  }
};

// Add candidature to a publication
// Route: POST /api/publications/:id/candidatures
exports.addCandidature = async (req, res) => {
  try {
    const { id } = req.params;
    const candidature = req.body;

    if (!isValidObjectId(id)) return res.status(400).json({ error: 'Invalid publication ID' });
    if (!candidature || !candidature.candidatId) return res.status(400).json({ error: 'Candidature data incomplete' });
    if (!isValidObjectId(candidature.candidatId)) return res.status(400).json({ error: 'Invalid candidatId' });

    const publication = await Publication.findById(id);
    if (!publication) return res.status(404).json({ error: 'Publication not found' });

    // Empêcher doublons : un même candidat ne peut pas candidater deux fois (optionnel)
    const already = publication.candidatures.some(c => String(c.candidatId) === String(candidature.candidatId));
    if (already) {
      return res.status(409).json({ error: 'Candidat has already applied to this publication' });
    }

    publication.candidatures.push(candidature);
    await publication.save();

    return res.status(201).json(publication);
  } catch (error) {
    console.error('Error in addCandidature:', error);
    return res.status(400).json({ error: 'Error adding candidature' });
  }
};

// Update status of a candidature
// Route suggestion: PUT /api/publications/:publicationId/candidatures/:candidatureId/status
exports.updateCandidatureStatus = async (req, res) => {
  try {
    const { publicationId, candidatureId } = req.params;
    const { statut } = req.body;

    if (!isValidObjectId(publicationId) || !isValidObjectId(candidatureId)) {
      return res.status(400).json({ error: 'Invalid ID' });
    }
    if (!statut) return res.status(400).json({ error: 'Missing statut in body' });

    const publication = await Publication.findById(publicationId);
    if (!publication) return res.status(404).json({ error: 'Publication not found' });

    const candidature = publication.candidatures.id(candidatureId);
    if (!candidature) return res.status(404).json({ error: 'Candidature not found' });

    candidature.statut = statut;
    await publication.save();

    return res.status(200).json({ message: 'Candidature status updated', publication });
  } catch (error) {
    console.error('Error in updateCandidatureStatus:', error);
    return res.status(400).json({ error: 'Error updating candidature status' });
  }
};
