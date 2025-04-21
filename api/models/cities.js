// models/Sehir.js
const mongoose = require('mongoose');

const citiesSchema = new mongoose.Schema({
    Name: { type: String, required: true },
    Id: { type: Number, required: true, unique: true }
}, { collection: 'cities' });

module.exports = mongoose.model('Sehir', citiesSchema);