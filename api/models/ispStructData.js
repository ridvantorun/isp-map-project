const mongoose = require('mongoose');

const ispStructDataSchema = new mongoose.Schema({
  // Lokasyon bilgileri
  cityId: { type: String, required: true },
  cityName: { type: String, required: true },
  districtId: { type: String, required: true },
  districtName: { type: String, required: true },
  villageId: { type: String, required: true },
  villageName: { type: String, required: true },
  quarterId: { type: String },
  quarterName: { type: String },
  streetId: { type: String },
  streetName: { type: String },
  
  // Koordinat ve sınır bilgileri
  coordinates: {
    latitude: { type: Number },
    longitude: { type: Number }
  },
  
  // Sınır (polygon) verileri için yeni alan
  boundary: [{
    latitude: { type: Number },
    longitude: { type: Number }
  }],
  
  // ISP bilgileri
  ispId: { type: String, required: true },
  ispName: { type: String, required: true },
  ispStructId: { type: String, required: true },
  ispStructName: { type: String, required: true },
  ispStructTypeId: { type: String, required: true },
  ispStructTypeName: { type: String, required: true },
  
  // Metadata
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('IspStructData', ispStructDataSchema, 'isp_struct_data');