// models/Ilce.js
const mongoose = require('mongoose');

const districtsSchema = new mongoose.Schema({
    Id: { type: Number, required: true, unique: true },
    Name: { type: String, required: true },
    CityId: { type: Number, required: true }
  }, { collection: 'districts' });

module.exports = mongoose.model('Ilce', districtsSchema);