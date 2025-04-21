const mongoose = require('mongoose');

const ispStructSchema = new mongoose.Schema({
    Name: { type: String, required: true },
    Id: { type: Number, required: true, unique: true }
}, { collection: 'isp_struct' });

module.exports = mongoose.model('IspStruct', ispStructSchema);