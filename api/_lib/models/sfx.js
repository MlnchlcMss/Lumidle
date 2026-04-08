const mongoose = require('mongoose');

const sfxSchema = new mongoose.Schema({
  testSubject: { type: String, required: true }, // base name (no variant)
  skillName: { type: String, required: true },
  sfxFile: { type: String, required: true },  
  iconFile: { type: String, required: true },  // e.g. '/icons/ahri-q.png'
  releaseDate: { type: Date, default: Date.now }
});

module.exports = mongoose.model('SFX', sfxSchema);