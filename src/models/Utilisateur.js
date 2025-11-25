const mongoose = require('mongoose');

const utilisateurSchema = new mongoose.Schema({
  nom: { type: String, required: true },
  prenom: { type: String, required: true },
  email: { 
    type: String, 
    required: true, 
    unique: true
  },
  mdp: { type: String, required: true },
  num_tel: { type: String },
  photo: { type: String },

  role: { 
    type: String, 
    enum: ['client', 'freelance', 'admin', 'candidat', 'formateur'],
    required: true 
  },

  specialite: { type: String },
  cv_pdf: { type: String },
  competences: [{ type: String }],
  tarifHoraire: { type: Number },
  description: { type: String },

  note: { type: Number, default: 0 },
  nombreAvis: { type: Number, default: 0 },

  emailVerifie: { type: Boolean, default: false },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },

  dateInscription: { type: Date, default: Date.now },
  derniereConnexion: { type: Date }
}, {
  timestamps: true
});

utilisateurSchema.index({ role: 1, specialite: 1 });

const Utilisateur = mongoose.model('Utilisateur', utilisateurSchema);

module.exports = Utilisateur;
