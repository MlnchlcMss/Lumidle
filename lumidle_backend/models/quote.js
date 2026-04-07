const mongoose = require('mongoose');

const quoteSchema = new mongoose.Schema({
  text: { type: String, required: true },
  speaker: { type: String, required: true },
  releaseDate: { type: Date, default: Date.now }    
});

module.exports = mongoose.model('Quote', quoteSchema);