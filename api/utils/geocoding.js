const axios = require('axios');

/**
 * OpenStreetMap Nominatim API'sini kullanarak adres metnini koordinatlara dönüştürür
 */
const getCoordinatesFromAddress = async (address) => {
  try {
    // Adres metnini koşullara göre oluştur
    let searchParts = [];
    
    // Eğer köy MERKEZ ise quarter ekle, değilse village ekle
    if (address.villageName === 'MERKEZ') {
      if (address.quarterName) {
        searchParts.push(`${address.quarterName} Mahallesi`);
      }
    } else {
      if (address.villageName) {
        searchParts.push(`${address.villageName} Köyü`);
      }
    }
    
    // Her durumda ilçe ve şehir bilgilerini ekle
    if (address.districtName) {
      searchParts.push(address.districtName);
    }
    
    if (address.cityName) {
      searchParts.push(address.cityName);
    }
    
    // Son olarak ülkeyi ekle
    searchParts.push('Turkey');
    
    // Parçaları virgülle birleştir
    const searchText = searchParts.join(', ');
    
    console.log('Aranan adres:', searchText);
    
    // URL'yi manuel olarak oluştur ve encodeURI ile işle
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURI(searchText)}&format=json&limit=1&addressdetails=1`;
    
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Map-Project (<your-openstreetmap-email>)',
        'Accept-Language': 'tr'
      },
      timeout: 5000 // 5 saniye timeout ekle
    });
    
    //console.log('API Yanıtı:', JSON.stringify(response.data, null, 2));
    
    if (response.data && response.data.length > 0) {
      const result = response.data[0];
      return {
        latitude: parseFloat(result.lat),
        longitude: parseFloat(result.lon)
      };
    }
    
    return { latitude: null, longitude: null };
  } catch (error) {
    console.error('Geocoding hatası:', error.message);
    
    // Hata detaylarını göster
    if (error.response) {
      console.error('API yanıt detayları:', JSON.stringify(error.response.data, null, 2));
    }
    
    return { latitude: null, longitude: null };
  }
};

/**
 * OpenStreetMap Nominatim API'sini kullanarak adres metnini koordinatlara ve sınır verilerine dönüştürür
 */
const getCoordinatesAndBoundaryFromAddress = async (address) => {
  try {
    // Adres metnini koşullara göre oluştur
    let searchParts = [];
    
    // Eğer köy MERKEZ ise quarter ekle, değilse village ekle
    if (address.villageName === 'MERKEZ') {
      if (address.quarterName) {
        searchParts.push(`${address.quarterName} Mahallesi`);
      }
    } else {
      if (address.villageName) {
        searchParts.push(`${address.villageName} Köyü`);
      }
    }
    
    // Her durumda ilçe ve şehir bilgilerini ekle
    if (address.districtName) {
      searchParts.push(address.districtName);
    }
    
    if (address.cityName) {
      searchParts.push(address.cityName);
    }
    
    // Son olarak ülkeyi ekle
    searchParts.push('Turkey');
    
    // Parçaları virgülle birleştir
    const searchText = searchParts.join(', ');
    
    //console.log('Aranan adres:', searchText);
    
    // URL'yi manuel olarak oluştur ve encodeURI ile işle
    // Polygon verisi almak için polygon_geojson=1 parametresini ekle
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURI(searchText)}&format=json&limit=1&addressdetails=1&polygon_geojson=1`;
    
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Map-Project (<your-openstreetmap-email>)',
        'Accept-Language': 'tr'
      },
      timeout: 5000 // 5 saniye timeout ekle
    });
    
    //console.log('API Yanıtı:', JSON.stringify(response.data, null, 2));
    
    if (response.data && response.data.length > 0) {
      const result = response.data[0];
      
      // Temel koordinat bilgisi
      const coordinates = {
        latitude: parseFloat(result.lat),
        longitude: parseFloat(result.lon)
      };
      
      // Polygon (sınır) verisi
      let polygonData = null;
      if (result.geojson) {
        if (result.geojson.type === 'Polygon') {
          // Polygon türündeki veriyi işle
          polygonData = result.geojson.coordinates[0].map(coord => ({
            latitude: coord[1],
            longitude: coord[0]
          }));
        } else if (result.geojson.type === 'MultiPolygon') {
          // MultiPolygon türündeki veriyi işle - en büyük poligonu seç
          // Basitleştirme için ilk poligonu alıyoruz, gerçek uygulamada daha karmaşık mantık gerekebilir
          polygonData = result.geojson.coordinates[0][0].map(coord => ({
            latitude: coord[1],
            longitude: coord[0]
          }));
        } else if (result.geojson.type === 'Point') {
          // Nokta türünde veri - polygon yok
          console.log('Sadece nokta verisi var, polygon bulunamadı');
        }
      }
      
      return {
        coordinates,
        polygon: polygonData
      };
    }
    
    return { coordinates: { latitude: null, longitude: null }, polygon: null };
  } catch (error) {
    console.error('Geocoding hatası:', error.message);
    
    // Hata detaylarını göster
    if (error.response) {
      console.error('API yanıt detayları:', JSON.stringify(error.response.data, null, 2));
    }
    
    return { coordinates: { latitude: null, longitude: null }, polygon: null };
  }
};

module.exports = {
  getCoordinatesFromAddress,
  getCoordinatesAndBoundaryFromAddress
};