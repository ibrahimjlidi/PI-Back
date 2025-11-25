const Specialite = require('../models/Specialite'); // create model

exports.getAllSpecialites = async (req, res) => {
  try {
    const specialites = await Specialite.find(); 
    res.status(200).json(specialites);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
