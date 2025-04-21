// models/Mahalle.js
const mongoose = require('mongoose');

const quartersSchema = new mongoose.Schema({
    Id: { type: Number, required: true, unique: true },
    Name: { type: String, required: true },
    VillageId: { type: Number, required: true }
  }, { collection: 'quarters' });

module.exports = mongoose.model('Mahalle', quartersSchema);