// server.js
require('dotenv').config({ path: '../.env' }); // Bir üst dizindeki .env dosyasını kullan
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const locationRoutes = require('./routes/locationRoutes'); // Routes dosyasından import ediyoruz

const app = express();

// Middleware'ler
//app.use(cors({ origin: process.env.CORS_ORIGIN }));
app.use(cors());
app.use(express.json());

// MongoDB Bağlantısı
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost/iss-map-project', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB bağlantısı başarılı'))
.catch(err => console.error('MongoDB bağlantı hatası:', err));

// Rotalar
app.use('/api', locationRoutes);

// Sunucuyu Başlat
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`API http://localhost:${PORT} üzerinde çalışıyor`);
});