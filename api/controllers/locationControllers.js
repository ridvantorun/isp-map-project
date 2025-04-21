// routes/locationRoutes.js
const express = require("express");
//const router = express.Router();
const mongoose = require("mongoose");
const Sehir = require("../models/cities");
const Ilce = require("../models/districts");
const Mahalle = require("../models/quarters");
const Koy = require("../models/villages");
const Sokak = require("../models/streets");
const Isp = require("../models/isp");
const IspStruct = require("../models/ispStruct");
const IspStructType = require("../models/ispStructType");
const IspStructData = require("../models/ispStructData");
const { getCoordinatesFromAddress, getCoordinatesAndBoundaryFromAddress } = require('../utils/geocoding');

exports.getSehirler = async (req, res) => {
  try {
    const cities = await Sehir.find({}); // Tüm şehirleri almak için boş sorgu
    res.json(cities); // API olduğu için render yerine json kullanıyoruz
  } catch (err) {
    console.error("Hata detayı:", err);
    res.status(500).json({ message: err.message });
  }
};

exports.getIlceler = async (req, res) => {
  try {
    let query = {};

    // CityId parametresi varsa filtreleme yap
    if (req.query.cityId || req.query.sehirKey) {
      const cityId = req.query.cityId || req.query.sehirKey;
      query = { CityId: cityId };
    }

    const districts = await Ilce.find(query); // Tüm şehirleri almak için boş sorgu
    res.json(districts); // API olduğu için render yerine json kullanıyoruz
  } catch (err) {
    console.error("Hata detayı:", err);
    res.status(500).json({ message: err.message });
  }
};

exports.getKoyler = async (req, res) => {
  try {
    let query = {};

    // CityId parametresi varsa filtreleme yap
    if (req.query.districtId || req.query.ilceKey) {
      const districtId = req.query.districtId || req.query.ilceKey;
      query = { DistrictId: districtId };
    }

    const villages = await Koy.find(query); // Tüm şehirleri almak için boş sorgu
    res.json(villages); // API olduğu için render yerine json kullanıyoruz
  } catch (err) {
    console.error("Hata detayı:", err);
    res.status(500).json({ message: err.message });
  }
};

exports.getMahalleler = async (req, res) => {
  try {
    let query = {};

    // CityId parametresi varsa filtreleme yap
    if (req.query.villageId || req.query.koyKey) {
      const villageId = req.query.villageId || req.query.koyKey;
      query = { VillageId: villageId };
    }

    const quarters = await Mahalle.find(query); // Tüm şehirleri almak için boş sorgu
    res.json(quarters); // API olduğu için render yerine json kullanıyoruz
  } catch (err) {
    console.error("Hata detayı:", err);
    res.status(500).json({ message: err.message });
  }
};

exports.getSokaklar = async (req, res) => {
  try {
    let query = {};

    // CityId parametresi varsa filtreleme yap
    if (req.query.quarterId || req.query.mahalleKey) {
      const quarterId = req.query.quarterId || req.query.mahalleKey;
      query = { QuarterId: quarterId };
    }

    const streets = await Sokak.find(query); // Tüm şehirleri almak için boş sorgu
    res.json(streets); // API olduğu için render yerine json kullanıyoruz
  } catch (err) {
    console.error("Hata detayı:", err);
    res.status(500).json({ message: err.message });
  }
};

exports.getIsp = async (req, res) => {
  try {
    const isp = await Isp.find({}); // Tüm şehirleri almak için boş sorgu
    res.json(isp); // API olduğu için render yerine json kullanıyoruz
  } catch (err) {
    console.error("Hata detayı:", err);
    res.status(500).json({ message: err.message });
  }
};

exports.getIspStruct = async (req, res) => {
  try {
    const isp_struct = await IspStruct.find({}); // Tüm şehirleri almak için boş sorgu
    res.json(isp_struct); // API olduğu için render yerine json kullanıyoruz
  } catch (err) {
    console.error("Hata detayı:", err);
    res.status(500).json({ message: err.message });
  }
};

exports.getIspStructType = async (req, res) => {
  try {
    const isp_struct_type = await IspStructType.find({}); // Tüm şehirleri almak için boş sorgu
    res.json(isp_struct_type); // API olduğu için render yerine json kullanıyoruz
  } catch (err) {
    console.error("Hata detayı:", err);
    res.status(500).json({ message: err.message });
  }
};

// ISP Structure Data Kaydetme Endpoint'i
exports.saveIspStructData = async (req, res) => {
  try {
    const ispData = req.body;
    
    // Güncellenmiş fonksiyonu kullan, polygon verilerini de al
    const { coordinates, polygon } = await getCoordinatesAndBoundaryFromAddress({
      cityName: ispData.cityName,
      districtName: ispData.districtName,
      villageName: ispData.villageName,
      quarterName: ispData.quarterName,
      streetName: ispData.streetName
    });
    
    // Yeni ISP veri kaydı oluştur
    const newIspStructData = new IspStructData({
      // Lokasyon bilgileri
      cityId: ispData.cityId,
      cityName: ispData.cityName,
      districtId: ispData.districtId,
      districtName: ispData.districtName,
      villageId: ispData.villageId,
      villageName: ispData.villageName,
      quarterId: ispData.quarterId || null,
      quarterName: ispData.quarterName || null,
      streetId: ispData.streetId || null,
      streetName: ispData.streetName || null,
      
      // Koordinat bilgileri
      coordinates: coordinates,
      
      // Sınır (polygon) verileri
      boundary: polygon || [],
      
      // ISP bilgileri
      ispId: ispData.ispId,
      ispName: ispData.ispName,
      ispStructId: ispData.ispStructId,
      ispStructName: ispData.ispStructName,
      ispStructTypeId: ispData.ispStructTypeId,
      ispStructTypeName: ispData.ispStructTypeName,
    });

    // Veritabanına kaydet
    const savedData = await newIspStructData.save();
    res.status(201).json(savedData);
  } catch (err) {
    console.error("Kayıt hatası:", err);
    res.status(500).json({ message: err.message });
  }
};

// ISP Structure Data Listeleme Endpoint'i
exports.getIspStructData = async (req, res) => {
  try {
    const ispStructData = await IspStructData.find({});
    res.json(ispStructData);
  } catch (err) {
    console.error("Veriler alınırken hata:", err);
    res.status(500).json({ message: err.message });
  }
};
