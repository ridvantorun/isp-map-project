const mongoose = require('mongoose');

const ispStructTypeSchema = new mongoose.Schema({
    Name: { type: String, required: true },
    Id: { type: Number, required: true, unique: true }
}, { collection: 'isp_struct_type' });

module.exports = mongoose.model('IspStructType', ispStructTypeSchema);