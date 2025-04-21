import { StyleSheet, Text, View, Button, ActivityIndicator, TouchableOpacity, ScrollView } from 'react-native';
import MapView, { Polygon, PROVIDER_DEFAULT } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RefreshCw, MapPin } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import { getIspStructData, IspStructDataResponse } from '../../api/locationService';

export default function HaritaEkrani() {
  const sonKoordinatLog = useRef<number>(0);
  const [yakinlasmaDurumu, setYakinlasmaDurumu] = useState<string>('');
  const [ispVerileri, setIspVerileri] = useState<IspStructDataResponse[]>([]);
  const [yukleniyor, setYukleniyor] = useState<boolean>(true);
  const mapRef = useRef<any>(null); // Updated ref type
  const [bilgiKutusuAcik, setBilgiKutusuAcik] = useState<boolean>(false);
  const [seciliPolygon, setSeciliPolygon] = useState<IspStructDataResponse | null>(null);
  const [bolgeDagilimVerileri, setBolgeDagilimVerileri] = useState<{
    ispDagilimi: Record<string, number>,
    ispTypesDagilimi: Record<string, number>,
    ispAltyapiDagilimi: Record<string, Record<string, number>>, // Yeni eklenen alan
    ispStructNameDagilimi: Record<string, number>, // Yeni eklenen alan
    toplamAltyapi: number
  } | null>(null);
  const [bolgeRenkHaritasi, setBolgeRenkHaritasi] = useState<Record<string, string>>({});

  // Extract data fetching into a reusable function
  const verileriGetir = async () => {
    try {
      // Bilgi kutusunu kapat ve seçili polygon'u sıfırla
      setBilgiKutusuAcik(false);
      setSeciliPolygon(null);
      setBolgeDagilimVerileri(null);
      
      setYukleniyor(true);
      const veriler = await getIspStructData();
      setIspVerileri(veriler);
      
      // Bölgelerin dominant renklerini hesapla
      const bolgeRenkleri = bolgeDominantRenkleriniHesapla(veriler);
      setBolgeRenkHaritasi(bolgeRenkleri);
      
      setYakinlasmaDurumu('Altyapı verileri güncellendi');
    } catch (error) {
      console.error('ISP verileri alınırken hata oluştu:', error);
      setYakinlasmaDurumu('Veri yenileme sırasında hata oluştu');
    } finally {
      setYukleniyor(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    verileriGetir();
  }, []);

  // Bu fonksiyonu değiştirin - koordinat göstermeyi kaldırıyoruz
  const bolgeDegistiginde = (viewState: any) => {
    // Burada hiçbir şey yapmıyoruz, koordinat bilgisi gösterilmeyecek
    // Koordinat gösterimi kaldırıldığı için düzenli güncellemeye de gerek yok
  };

  // ISP türüne göre renk döndüren fonksiyon
  const ispRengiAl = (ispStructTypeName: string): string => {
    const tipAdi = ispStructTypeName.toLowerCase();
    if (tipAdi.includes('adsl')) {
      return 'rgba(255, 0, 0, 0.5)'; // Kırmızı - ADSL
    } else if (tipAdi.includes('vdsl')) {
      return 'rgba(255, 165, 0, 0.5)'; // Turuncu - VDSL
    } else if (tipAdi.includes('fiber')) {
      return 'rgba(0, 255, 0, 0.5)'; // Yeşil - Fiber
    } else {
      return 'rgba(0, 0, 255, 0.5)'; // Mavi - Diğer
    }
  };

  // Merkeze dönme işlevi
  const merkezeDon = () => {
    if (mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: 41.0192846, // İstanbul'un koordinatları
        longitude: 28.9479296,
        latitudeDelta: 0.10,
        longitudeDelta: 0.10,
      }, 1000);
    }
    setYakinlasmaDurumu('Türkiye merkez konumuna dönüldü');
  };

  // Koordinatlar etrafında polygon oluşturan fonksiyon
  const daireselPolygonOlustur = (lat: number, lng: number, yaricapKm: number = 0.3, noktaSayisi: number = 32) => {
    const koordinatlar = [];
    const mesafeX = yaricapKm / (111.32 * Math.cos(lat * (Math.PI / 180)));
    const mesafeY = yaricapKm / 110.574;

    for (let i = 0; i < noktaSayisi; i++) {
      const aci = (i / noktaSayisi) * (2 * Math.PI);
      const dx = mesafeX * Math.cos(aci);
      const dy = mesafeY * Math.sin(aci);
      koordinatlar.push({
        latitude: lat + dy,
        longitude: lng + dx
      });
    }
    return koordinatlar;
  };

  // Bilgi kutusunu aç/kapat
  const bilgiKutusuToggle = () => {
    setBilgiKutusuAcik(!bilgiKutusuAcik);
  };

  // Bölge ISP dağılımlarını hesaplayan fonksiyon
  const bolgeDagilimlariniHesapla = (seciliVeri: IspStructDataResponse) => {
    // Seçili bölgeyle eşleşen tüm verileri filtrele - köy/mahalle durumuna göre
    const bolgeVerileri = seciliVeri.villageName !== "MERKEZ"
      ? ispVerileri.filter(veri => 
          veri.cityName === seciliVeri.cityName && 
          veri.districtName === seciliVeri.districtName && 
          veri.villageName === seciliVeri.villageName
        )
      : ispVerileri.filter(veri => 
          veri.cityName === seciliVeri.cityName && 
          veri.districtName === seciliVeri.districtName && 
          veri.villageName === seciliVeri.villageName &&
          veri.quarterName === seciliVeri.quarterName
        );
    
    // ISP dağılımı hesaplama
    const ispDagilimi: Record<string, number> = {};
    // Altyapı tipi dağılımı hesaplama
    const ispTypesDagilimi: Record<string, number> = {};
    // ISP-Altyapı tipi dağılımı hesaplama (yeni eklenen)
    const ispAltyapiDagilimi: Record<string, Record<string, number>> = {};
    // ispStructName dağılımını hesaplama (yeni eklenen)
    const ispStructNameDagilimi: Record<string, number> = {};

    bolgeVerileri.forEach(veri => {
      // ISP dağılımı
      if (ispDagilimi[veri.ispName]) {
        ispDagilimi[veri.ispName]++;
      } else {
        ispDagilimi[veri.ispName] = 1;
      }
      
      // ISP altyapı tipi dağılımı
      if (ispTypesDagilimi[veri.ispStructTypeName]) {
        ispTypesDagilimi[veri.ispStructTypeName]++;
      } else {
        ispTypesDagilimi[veri.ispStructTypeName] = 1;
      }

      // ISP-Altyapı tipi kombinasyonu dağılımı (yeni eklenen)
      if (!ispAltyapiDagilimi[veri.ispName]) {
        ispAltyapiDagilimi[veri.ispName] = {};
      }
      
      if (ispAltyapiDagilimi[veri.ispName][veri.ispStructTypeName]) {
        ispAltyapiDagilimi[veri.ispName][veri.ispStructTypeName]++;
      } else {
        ispAltyapiDagilimi[veri.ispName][veri.ispStructTypeName] = 1;
      }

      // ISP struct name dağılımı (yeni eklenen)
      if (ispStructNameDagilimi[veri.ispStructName]) {
        ispStructNameDagilimi[veri.ispStructName]++;
      } else {
        ispStructNameDagilimi[veri.ispStructName] = 1;
      }
    });
    
    return {
      ispDagilimi,
      ispTypesDagilimi,
      ispAltyapiDagilimi,
      ispStructNameDagilimi, // Yeni eklenen
      toplamAltyapi: bolgeVerileri.length
    };
  };

  // Tüm bölgelerin dominant renklerini hesapla
  const bolgeDominantRenkleriniHesapla = (veriler: IspStructDataResponse[]) => {
    const bolgeRenkleri: Record<string, string> = {};
    
    // Tüm benzersiz bölgeleri bul (köy/mahalle durumuna göre)
    const bolgeler = new Set<string>();
    veriler.forEach(veri => {
      // Village MERKEZ değilse köy seviyesinde grupla, MERKEZ ise mahalle seviyesinde
      const bolgeAnahtari = veri.villageName !== "MERKEZ"
        ? `${veri.cityName}-${veri.districtName}-${veri.villageName}`
        : `${veri.cityName}-${veri.districtName}-${veri.villageName}-${veri.quarterName}`;
      
      bolgeler.add(bolgeAnahtari);
    });
    
    // Her bölge için dominant altyapı tipini bul
    bolgeler.forEach(bolgeAnahtari => {
      const parcalar = bolgeAnahtari.split('-');
      let cityName, districtName, villageName, quarterName;
      
      // Village MERKEZ değilse 3 parça, MERKEZ ise 4 parça olacak
      if (parcalar.length === 3) {
        [cityName, districtName, villageName] = parcalar;
        quarterName = ''; // Köy durumunda mahalle önemli değil
      } else {
        [cityName, districtName, villageName, quarterName] = parcalar;
      }
      
      // Bu bölgedeki tüm verileri filtrele
      const bolgeVerileri = villageName !== "MERKEZ"
        ? veriler.filter(veri => 
            veri.cityName === cityName && 
            veri.districtName === districtName && 
            veri.villageName === villageName
          )
        : veriler.filter(veri => 
            veri.cityName === cityName && 
            veri.districtName === districtName && 
            veri.villageName === villageName &&
            veri.quarterName === quarterName
          );
      
      // Altyapı tipi dağılımını hesapla
      const tipDagilimi: Record<string, number> = {};
      bolgeVerileri.forEach(veri => {
        if (tipDagilimi[veri.ispStructTypeName]) {
          tipDagilimi[veri.ispStructTypeName]++;
        } else {
          tipDagilimi[veri.ispStructTypeName] = 1;
        }
      });
      
      // En yüksek sayıya sahip altyapı tipini bul
      let enYuksekSayi = 0;
      let dominantTip = '';
      Object.entries(tipDagilimi).forEach(([tipAdi, sayi]) => {
        if (sayi > enYuksekSayi) {
          enYuksekSayi = sayi;
          dominantTip = tipAdi;
        }
      });
      
      // Dominant tipe göre renk belirle
      const dominantRenk = ispRengiAl(dominantTip);
      bolgeRenkleri[bolgeAnahtari] = dominantRenk;
    });
    
    return bolgeRenkleri;
  };

  // Eski renderPolygons fonksiyonunu değiştirin
  const renderPolygons = () => {
    // Bölgeleri grupla (bunu koruyun)
    const bolgeler = new Map();
    
    // Gruplama kodunuzu koruyun
    ispVerileri.forEach(veri => {
      const bolgeAnahtari = veri.villageName !== "MERKEZ"
        ? `${veri.cityName}-${veri.districtName}-${veri.villageName}`
        : `${veri.cityName}-${veri.districtName}-${veri.villageName}-${veri.quarterName}`;
      
      if (!bolgeler.has(bolgeAnahtari)) {
        bolgeler.set(bolgeAnahtari, {
          veri: veri,
          veriler: []
        });
      }
      bolgeler.get(bolgeAnahtari).veriler.push(veri);
    });
    
    // Değişiklik burada: Source ve Layer yerine Polygon kullanın
    return Array.from(bolgeler.entries()).map(([bolgeAnahtari, bolge], index) => {
      // Dominant renk hesaplama kodunuzu koruyun
      const dominantRenk = bolgeRenkHaritasi[bolgeAnahtari] || ispRengiAl(bolge.veri.ispStructTypeName);
      
      // Koordinatları al - değişiklik yok
      let koordinatlar = [];
      
      if (bolge.veri.boundary && bolge.veri.boundary.length > 0) {
        koordinatlar = bolge.veri.boundary;
      } else if (bolge.veri.coordinates && bolge.veri.coordinates.latitude && bolge.veri.coordinates.longitude) {
        koordinatlar = daireselPolygonOlustur(
          bolge.veri.coordinates.latitude,
          bolge.veri.coordinates.longitude
        );
      } else {
        return null;
      }

      // Source ve Layer yerine doğrudan Polygon döndürün
      return (
        <Polygon
          key={`polygon-${index}`}
          coordinates={koordinatlar}
          strokeColor="rgba(0,0,0,0.5)"
          fillColor={dominantRenk}
          tappable={true}
          onPress={() => {
            // Village değeri MERKEZ dışında ise quarter gösterme
            const yerlesimBilgisi = bolge.veri.villageName !== "MERKEZ" 
              ? `${bolge.veri.cityName} / ${bolge.veri.districtName} / ${bolge.veri.villageName}`
              : `${bolge.veri.cityName} / ${bolge.veri.districtName} / ${bolge.veri.villageName} / ${bolge.veri.quarterName}`;
            
            // Polygona tıklandığında bilgi göster
            const bilgi = `${yerlesimBilgisi} - En yaygın: ${
              Object.entries(bolgeDagilimlariniHesapla(bolge.veri).ispTypesDagilimi)
              .sort((a, b) => b[1] - a[1])[0][0]
            }`;
            setYakinlasmaDurumu(bilgi);
            
            // Seçili polygon'u ayarla
            setSeciliPolygon(bolge.veri);
            
            // Bölge dağılım verilerini hesapla
            const dagilimlar = bolgeDagilimlariniHesapla(bolge.veri);
            setBolgeDagilimVerileri(dagilimlar);
            
            // Bilgi kutusunu aç
            setBilgiKutusuAcik(true);
            
            // Tıklanan konuma zoom yap
            const merkez = bolge.veri.coordinates;
            mapRef.current?.animateToRegion({
              latitude: merkez.latitude,
              longitude: merkez.longitude,
              latitudeDelta: 0.05,
              longitudeDelta: 0.05
            }, 1000);
          }}
        />
      );
    });
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.container}>
        <MapView
          ref={mapRef}
          style={styles.harita}
          provider={PROVIDER_DEFAULT}
          initialRegion={{
            latitude: 41.0082,
            longitude: 28.9784,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
        >
          {/* Polygonları render etme bölümü */}
          {!yukleniyor && renderPolygons()}
        </MapView>
        
        {yukleniyor && (
          <View style={styles.yukleniyorKutusu}>
            <ActivityIndicator size="large" color="#0000ff" />
            <Text style={styles.yukleniyorMetni}>Altyapı verileri yükleniyor...</Text>
          </View>
        )}
        
        <View 
          style={[
            styles.bilgiKutusu, 
            bilgiKutusuAcik ? styles.bilgiKutusuAcik : styles.bilgiKutusuKapali
          ]}
          onTouchEnd={bilgiKutusuToggle}
        >
          {!seciliPolygon ? (
            <Text style={styles.bilgiMetni}>
              {yakinlasmaDurumu || 'Harita üzerinde gezinin veya altyapı bölgelerine tıklayın'}
            </Text>
          ) : (
            <>
              <Text style={styles.bilgiBaslik}>
                {seciliPolygon.villageName !== "MERKEZ" 
                  ? `${seciliPolygon.villageName} Bölgesi Altyapı Analizi`
                  : `${seciliPolygon.quarterName} Mahallesi Altyapı Analizi`}
              </Text>
              
              {bilgiKutusuAcik && bolgeDagilimVerileri ? (
                <View style={styles.bilgiDetaylar}>
                  <Text style={styles.bilgiKonum}>
                    {seciliPolygon.villageName !== "MERKEZ"
                      ? `${seciliPolygon.cityName} / ${seciliPolygon.districtName} / ${seciliPolygon.villageName}`
                      : `${seciliPolygon.cityName} / ${seciliPolygon.districtName} / ${seciliPolygon.villageName} / ${seciliPolygon.quarterName}`}
                  </Text>
                  
                  <View style={styles.bilgiSeparator} />
                  
                  <ScrollView style={styles.bilgiScroll} showsVerticalScrollIndicator={false}>
                    <Text style={styles.bilgiAltBaslik}>ISP Dağılımı:</Text>
                    <View style={styles.veriGrup}>
                      {Object.entries(bolgeDagilimVerileri.ispDagilimi)
                        .sort((a, b) => b[1] - a[1])
                        .map(([ispAdi, sayi], idx) => (
                          <View key={`isp-${idx}`} style={styles.veriSatir}>
                            <View style={styles.veriIlerleme}>
                              <View 
                                style={[
                                  styles.veriIlerlemeBar, 
                                  { width: `${Math.round((sayi / bolgeDagilimVerileri.toplamAltyapi) * 100)}%` }
                                ]} 
                              />
                            </View>
                            <Text style={styles.veriMetin}>
                              {ispAdi}: %{Math.round((sayi / bolgeDagilimVerileri.toplamAltyapi) * 100)}
                            </Text>
                          </View>
                      ))}
                    </View>
                    
                    <Text style={styles.bilgiAltBaslik}>Altyapı Tipleri:</Text>
                    <View style={styles.veriGrup}>
                      {Object.entries(bolgeDagilimVerileri.ispTypesDagilimi)
                        .sort((a, b) => b[1] - a[1])
                        .map(([tipAdi, sayi], idx) => (
                          <View key={`tip-${idx}`} style={styles.veriSatir}>
                            <View style={styles.veriIlerleme}>
                              <View 
                                style={[
                                  styles.veriIlerlemeBar, 
                                  { width: `${Math.round((sayi / bolgeDagilimVerileri.toplamAltyapi) * 100)}%` }
                                ]} 
                              />
                            </View>
                            <Text style={styles.veriMetin}>
                              {tipAdi}: %{Math.round((sayi / bolgeDagilimVerileri.toplamAltyapi) * 100)}
                            </Text>
                          </View>
                      ))}
                    </View>
                    
                    <Text style={styles.bilgiAltBaslik}>ISP Altyapı:</Text>
                    <View style={styles.veriGrup}>
                      {Object.entries(bolgeDagilimVerileri.ispStructNameDagilimi)
                        .sort((a, b) => b[1] - a[1])
                        .map(([structName, sayi], structIdx) => (
                          <View key={`isp-struct-${structIdx}`} style={styles.veriSatir}>
                            <View style={styles.veriIlerleme}>
                              <View 
                                style={[
                                  styles.veriIlerlemeBar, 
                                  { width: `${Math.round((sayi / bolgeDagilimVerileri.toplamAltyapi) * 100)}%` }
                                ]} 
                              />
                            </View>
                            <Text style={styles.veriMetin}>
                              {structName}: %{Math.round((sayi / bolgeDagilimVerileri.toplamAltyapi) * 100)}
                            </Text>
                          </View>
                      ))}
                    </View>
                  </ScrollView>
                  
                  <View style={styles.bilgiSeparator} />
                  
                  <Text style={styles.toplamAltYapi}>
                    <Text style={styles.toplamLabel}>Toplam Altyapı Sayısı:</Text> {bolgeDagilimVerileri.toplamAltyapi}
                  </Text>
                  
                  <Text style={styles.bilgiIpucu}>
                    <Text style={{color: '#555', fontWeight: '500'}}>⟲</Text> Bilgi kutusunu kapatmak için dokun
                  </Text>
                </View>
              ) : (
                <Text style={styles.bilgiMetni}>
                  {seciliPolygon.villageName !== "MERKEZ"
                    ? `${seciliPolygon.cityName} / ${seciliPolygon.districtName} / ${seciliPolygon.villageName}`
                    : `${seciliPolygon.cityName} / ${seciliPolygon.districtName} / ${seciliPolygon.villageName} / ${seciliPolygon.quarterName}`}
                  {"\n"}(Detaylı analiz için dokun)
                </Text>
              )}
            </>
          )}
        </View>
        
        <View style={styles.lejantKutusu}>
          <View style={styles.lejantIcerik}>
            <View style={styles.lejantItem}>
              <View style={[styles.lejantRenk, { backgroundColor: 'rgba(255, 0, 0, 0.7)' }]} />
              <Text style={styles.lejantMetin}>ADSL</Text>
            </View>
            <View style={styles.lejantItem}>
              <View style={[styles.lejantRenk, { backgroundColor: 'rgba(255, 165, 0, 0.7)' }]} />
              <Text style={styles.lejantMetin}>VDSL</Text>
            </View>
            <View style={styles.lejantItem}>
              <View style={[styles.lejantRenk, { backgroundColor: 'rgba(0, 255, 0, 0.7)' }]} />
              <Text style={styles.lejantMetin}>Fiber</Text>
            </View>
            <View style={styles.lejantItem}>
              <View style={[styles.lejantRenk, { backgroundColor: 'rgba(0, 0, 255, 0.7)' }]} />
              <Text style={styles.lejantMetin}>Diğer</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.butonKapsayici}>
          <TouchableOpacity 
            style={styles.iconButton}
            onPress={verileriGetir}
            activeOpacity={0.7}
          >
            <RefreshCw size={22} color="#333" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.iconButton}
            onPress={merkezeDon}
            activeOpacity={0.7}
          >
            <MapPin size={22} color="#333" />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  harita: {
    width: '100%',
    height: '100%'
  },
  bilgiKutusu: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    overflow: 'hidden',
  },
  bilgiKutusuKapali: {
    maxHeight: 80,
  },
  bilgiKutusuAcik: {
    maxHeight: 450, // Increase from 400 to 450
  },
  bilgiBaslik: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  bilgiMetni: {
    fontSize: 14,
    color: '#444',
    marginBottom: 5,
  },
  bilgiAltBaslik: {
    fontSize: 14,
    fontWeight: '500',
    color: '#444',
    marginTop: 12,
    marginBottom: 4,
  },
  bilgiDetaylar: {
    marginTop: 8,
  },
  bilgiIpucu: {
    fontSize: 12,
    color: '#777',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 12,
  },
  yukleniyorKutusu: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -100,
    marginTop: -50,
    width: 200,
    height: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 3,
  },
  yukleniyorMetni: {
    marginTop: 10,
    fontSize: 14,
  },
  butonKapsayici: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    flexDirection: 'column',
    alignItems: 'center',
    gap: 12,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
  },
  lejantKutusu: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    borderRadius: 20,
    padding: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 1.5,
  },
  lejantIcerik: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  lejantItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  lejantRenk: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 4,
  },
  lejantMetin: {
    fontSize: 11,
    fontWeight: '500',
    color: '#333',
  },
  ispAltyapiBlok: {
    marginLeft: 5,
    marginBottom: 5,
  },
  bilgiAltMetin: {
    fontWeight: '500',
    fontSize: 13,
  },
  bilgiMetniIceri: {
    fontSize: 12,
    marginLeft: 10,
    marginBottom: 2,
  },
  bilgiKonum: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  bilgiSeparator: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.08)',
    marginVertical: 8,
  },
  veriGrup: {
    marginBottom: 8,
  },
  veriSatir: {
    position: 'relative',
    marginBottom: 4,
    paddingVertical: 2,
  },
  veriIlerleme: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.03)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  veriIlerlemeBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    backgroundColor: 'rgba(33, 150, 243, 0.15)',
    borderRadius: 3,
  },
  veriMetin: {
    fontSize: 13,
    color: '#333',
    paddingVertical: 2,
    paddingHorizontal: 4,
    zIndex: 1,
  },
  toplamAltYapi: {
    fontSize: 13,
    textAlign: 'right',
    color: '#444',
    marginTop: 8,
  },
  toplamLabel: {
    fontWeight: '500',
  },
  bilgiScroll: {
    maxHeight: 230, // Reduced from 250
    marginHorizontal: -4, // Compensate for scrollview padding
    paddingHorizontal: 4,
  },
});