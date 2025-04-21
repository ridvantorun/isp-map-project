const mongoose = require('mongoose');

const villagesSchema = new mongoose.Schema({
    Id: { type: Number, required: true, unique: true },
    DistrictId: { type: Number, required: true },
    Name: { type: String, required: true },
    TypeCode: { type: Number, required: true },
    TypeDescription: { type: String, required: true },
  }, { collection: 'villages' });

module.exports = mongoose.model('Koy', villagesSchema);