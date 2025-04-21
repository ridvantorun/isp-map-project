// models/Sokak.js
const mongoose = require('mongoose');

const streetsSchema = new mongoose.Schema({
    Id: { type: Number, required: true, unique: true },
    Name: { type: String, required: true },
    QuarterId: { type: Number, required: true }
  }, { collection: 'streets' });

module.exports = mongoose.model('Sokak', streetsSchema);