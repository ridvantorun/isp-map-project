
const mongoose = require('mongoose');

const ispSchema = new mongoose.Schema({
    Name: { type: String, required: true },
    Id: { type: Number, required: true, unique: true }
}, { collection: 'isp' });

module.exports = mongoose.model('Isp', ispSchema);