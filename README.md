# ISS Harita Projesi 👋

Bu proje, Türkiye'deki İnternet Servis Sağlayıcı (ISS) altyapılarını harita üzerinde görselleştirmek için geliştirilmiş bir mobil uygulamadır. Kullanıcılar bölgelerdeki altyapı dağılımını görüntüleyebilir ve yeni altyapı verisi ekleyebilirler.

## Özellikler

- Harita üzerinde ISS altyapı dağılımını görselleştirme
- Bölge bazlı altyapı analizi (ADSL, VDSL, Fiber, vb.)
- ISP ve altyapı tipi dağılımı istatistikleri
- Yeni ISP altyapı verisi ekleme
- İl, ilçe, köy, mahalle ve sokak bazlı konum seçimi

## Kullanılan Teknolojiler

### Frontend
- React Native / Expo
- React Navigation
- MapLibre / React Native Maps
- Lucide Icons

### Backend
- Node.js / Express
- MongoDB
- Mongoose
- Nominatim API

## Kurulum

### Bağımlılıkları Yükleme

```bash
npm install
```

### Backend Ayarları

1. MongoDB bağlantı bilgilerinizi `.env` dosyasında ayarlayın:
   ```
   MONGODB_URI=mongodb+srv://username:password@yourcluster.mongodb.net/iss-map-project
   PORT=3000
   CORS_ORIGIN=http://localhost:3000
   NODE_ENV=development
   ```

2. Proje yolunda yeni bir terminal açıp API sunucusunu başlatın:
   ```bash
   cd api
   node server.js
   ```

### Uygulamayı Başlatma
Proje yolunda yeni bir terminal açıp uygulamayı başlatın:
```bash
npx expo start
```

Bu komut çalıştırıldığında aşağıdaki seçeneklerle uygulamayı açabilirsiniz:

- [Android emülatörü](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simülatörü](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go) uygulaması ile fiziksel cihazda

## Kullanım

### Harita Ekranı
- Harita üzerinde bölgelere tıklayarak altyapı bilgilerini görüntüleyebilirsiniz
- Bölgeler altyapı tipine göre renklendirilmiştir (Kırmızı: ADSL, Turuncu: VDSL, Yeşil: Fiber, Mavi: Diğer)
- Sağ alt köşedeki butonlarla haritayı yenileyebilir veya merkeze dönebilirsiniz

### Veri Ekleme Ekranı
- İl, ilçe, köy ve gerekirse mahalle/sokak seçimi yapabilirsiniz
- İnternet servis sağlayıcı ve altyapı türünü seçebilirsiniz
- Kaydet butonu ile veriyi veritabanına ekleyebilirsiniz

## Geliştirme

Proje, Expo'nun dosya tabanlı yönlendirme sistemini kullanmaktadır. Ana uygulama kodları `app` dizininde bulunur:

- `app/(tabs)/index.tsx`: Harita ekranı
- `app/(tabs)/IspAdd.tsx`: Veri ekleme ekranı
- `api/` dizini: Backend API kodları

## Not

Bu uygulama geliştirme aşamasındadır ve gerçek veriler içermeyebilir. Eğitim ve öğrenim amaçlı kullanılmalıdır.
