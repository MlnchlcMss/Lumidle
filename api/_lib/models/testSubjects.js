const mongoose = require('mongoose');

const testSubjectSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  gender: { type: String, enum: ['Male', 'Female'], required: true },
  weapon: { type: String, required: true },       
  roles: [{ type: String, enum: ['Tank', 'Fighter', 'Mage', 'Assassin', 'Ranged DPS', 'Support'] }], // max 2      
  difficulty: { type: Number, min: 1, max: 5, required: true },
  releaseDate: { type: Date, required: true },
  age: { type: Number, default: null }, // some test subjects might not have an age 
  scaling1: {
    name: { type: String, enum: ['BA AMP', 'SKILL AMP','ATK POWER'], required: true },       
    value: { type: Number, required: true }       // percentage (e.g., 4.0)
  },
  scaling2: {
    name: { type: String, default: 'ASPD' },       
    value: { type: Number, required: true }
  },
  imageUrl: { type: String, default: '' },
  wikiUrl: { type: String, default: '' }
});

testSubjectSchema.path('roles').validate(function (roles) {
  return roles.length <= 2;
}, 'Roles cannot exceed 2');

module.exports = mongoose.model('Test Subject', testSubjectSchema);