import { StyleSheet, View, Text, ActivityIndicator, Platform, ScrollView, Button, Alert, Dimensions, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState, useEffect } from 'react';
import { Dropdown } from 'react-native-element-dropdown';
import AntDesign from '@expo/vector-icons/AntDesign';
import { 
  fetchSehirler, fetchIlceler, fetchKoyler, fetchMahalleler, fetchSokaklar, fetchIsp, fetchIspStruct, fetchIspStructType,
  Sehir, Ilce, Koy, Mahalle, Sokak, Isp, IspStruct, IspStructType,
  saveIspStructData, IspStructDataPayload 
} from '../../api/locationService';

export default function IspAddScreen() {
  // API'den çekilen verileri tutacak state'ler
  const [sehirler, setSehirler] = useState<Sehir[]>([]);
  const [ilceler, setIlceler] = useState<Ilce[]>([]);
  const [koyler, setKoyler] = useState<Koy[]>([]);
  const [mahalleler, setMahalleler] = useState<Mahalle[]>([]);
  const [sokaklar, setSokaklar] = useState<Sokak[]>([]);
  const [isp, setIsp] = useState<Isp[]>([]);
  const [ispStruct, setIspStruct] = useState<IspStruct[]>([]);
  const [ispStructType, setIspStructType] = useState<IspStructType[]>([]);
  
  // Seçilen değerleri tutacak state'ler
  const [sehirId, setSehirId] = useState<string | null>(null);
  const [ilceId, setIlceId] = useState<string | null>(null);
  const [koyId, setKoyId] = useState<string | null>(null);
  const [mahalleId, setMahalleId] = useState<string | null>(null);
  const [sokakId, setSokakId] = useState<string | null>(null);
  const [ispId, setIspId] = useState<string | null>(null);
  const [ispStructId, setIspStructId] = useState<string | null>(null);
  const [ispStructTypeId, setIspStructTypeId] = useState<string | null>(null);
  
  // Dropdown focus state'leri
  const [isFocus, setIsFocus] = useState({
    sehir: false,
    ilce: false,
    koy: false,
    mahalle: false,
    sokak: false,
    isp: false,
    ispStruct: false,
    ispStructType: false
  });
  
  // Yükleniyor durumlarını tutan state'ler
  const [loading, setLoading] = useState({
    sehirler: false,
    ilceler: false,
    koyler: false,
    mahalleler: false,
    sokaklar: false,
    isp: false,
    ispStruct: false,
    ispStructType: false,
    saving: false
  });

  // Add refreshing state for pull-to-refresh
  const [refreshing, setRefreshing] = useState(false);
  
  // Pull-to-refresh handler
  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    
    // Reset all selections
    setSehirId(null);
    setIlceId(null);
    setKoyId(null);
    setMahalleId(null);
    setSokakId(null);
    setIspId(null);
    setIspStructId(null);
    setIspStructTypeId(null);
    
    // Clear dropdown data except cities
    setIlceler([]);
    setKoyler([]);
    setMahalleler([]);
    setSokaklar([]);
    setIsp([]);
    setIspStruct([]);
    setIspStructType([]);
    
    // Reload cities
    const loadSehirler = async () => {
      const data = await fetchSehirler();
      setSehirler(data);
      setRefreshing(false);
    };
    
    loadSehirler();
  }, []);

  // İlleri yükle (sayfa açıldığında)
  useEffect(() => {
    const loadSehirler = async () => {
      setLoading(prev => ({ ...prev, sehirler: true }));
      const data = await fetchSehirler();
      setSehirler(data);
      setLoading(prev => ({ ...prev, sehirler: false }));
    };
    
    loadSehirler();
  }, []);

  // İlçeleri yükle (il seçildiğinde)
  useEffect(() => {
    if (sehirId !== null) {
      const loadIlceler = async () => {
        setLoading(prev => ({ ...prev, ilceler: true }));
        // Alt seviye seçimleri sıfırla
        setIlceId(null);
        setKoyId(null);
        setMahalleId(null);
        setSokakId(null);
        setIspId(null);
        setIspStructId(null);
        setIspStructTypeId(null);
        
        setIlceler([]);
        setKoyler([]);
        setMahalleler([]);
        setSokaklar([]);
        setIsp([]);
        setIspStruct([]);
        setIspStructType([]);
        
        const data = await fetchIlceler(sehirId);
        setIlceler(data);
        setLoading(prev => ({ ...prev, ilceler: false }));
      };
      
      loadIlceler();
    }
  }, [sehirId]);

  // Köyleri yükle (ilçe seçildiğinde)
  useEffect(() => {
    if (ilceId !== null) {
      const loadKoyler = async () => {
        setLoading(prev => ({ ...prev, koyler: true }));
        // Alt seviye seçimleri sıfırla
        setKoyId(null);
        setMahalleId(null);
        setSokakId(null);
        
        setKoyler([]);
        setMahalleler([]);
        setSokaklar([]);
        
        const data = await fetchKoyler(ilceId);
        setKoyler(data);
        setLoading(prev => ({ ...prev, koyler: false }));
      };
      
      loadKoyler();
    }
  }, [ilceId]);
  
  // Mahalleleri yükle (köy seçildiğinde)
  useEffect(() => {
    if (koyId !== null) {
      const loadMahalleler = async () => {
        setLoading(prev => ({ ...prev, mahalleler: true }));
        // Alt seviye seçimleri sıfırla
        setMahalleId(null);
        setSokakId(null);
        
        setMahalleler([]);
        setSokaklar([]);
        
        const data = await fetchMahalleler(koyId);
        setMahalleler(data);
        setLoading(prev => ({ ...prev, mahalleler: false }));
      };
      
      loadMahalleler();
    }
  }, [koyId]);

  // Sokakları yükle (mahalle seçildiğinde)
  useEffect(() => {
    if (mahalleId !== null) {
      const loadSokaklar = async () => {
        setLoading(prev => ({ ...prev, sokaklar: true }));
        // Sokak seçimini sıfırla
        setSokakId(null);
        setSokaklar([]);
        
        const data = await fetchSokaklar(mahalleId);
        setSokaklar(data);
        setLoading(prev => ({ ...prev, sokaklar: false }));
      };
      
      loadSokaklar();
    }
  }, [mahalleId]);

  // ISP yükleme useEffect'ini güncelleyin - Hem sokak hem de köy seçimine tepki verecek şekilde
  useEffect(() => {
    // Sokak seçildiğinde veya mahalle verisi olmayan köy seçildiğinde
    if (sokakId !== null || (koyId !== null && mahalleler.length === 0 && mahalleId === null)) {
      const loadIsp = async () => {
        setLoading(prev => ({ ...prev, isp: true }));
        // ISP seçimini sıfırla
        setIspId(null);
        setIspStructId(null);
        setIspStructTypeId(null);
        setIsp([]);
        setIspStruct([]);
        setIspStructType([]);
        
        let data = [];
        // Eğer sokak seçilmişse sokağa göre, değilse köye göre ISP verilerini çek
        if (sokakId !== null) {
          data = await fetchIsp(sokakId);
        } else if (koyId !== null) {
          // Köy ID'sine göre ISP verilerini çek
          data = await fetchIsp(koyId); // API'niz buna uygun olmalı veya yeni bir fonksiyon eklenebilir
        }
        
        setIsp(data);
        setLoading(prev => ({ ...prev, isp: false }));
      };
      
      loadIsp();
    }
  }, [sokakId, koyId, mahalleler.length]);

  // ISP Struct yükle (ISP seçildiğinde)
  useEffect(() => {
    if (ispId !== null) {
      const loadIspStruct = async () => {
        setLoading(prev => ({ ...prev, ispStruct: true }));
        // Sokak seçimini sıfırla
        setIspStructId(null);
        setIspStruct([]);
        
        const data = await fetchIspStruct(ispId);
        setIspStruct(data);
        setLoading(prev => ({ ...prev, ispStruct: false }));
      };
      
      loadIspStruct();
    }
  }, [ispId]);

  // ISP Struct Type yükle (ISP Struct seçildiğinde)
  useEffect(() => {
    if (ispStructId !== null) {
      const loadIspStructType = async () => {
        setLoading(prev => ({ ...prev, ispStructType: true }));
        // Sokak seçimini sıfırla
        setIspStructTypeId(null);
        setIspStructType([]);
        
        const data = await fetchIspStructType(ispStructId);
        setIspStructType(data);
        setLoading(prev => ({ ...prev, ispStructType: false }));
      };
      
      loadIspStructType();
    }
  }, [ispStructId]);

  const [errors, setErrors] = useState({
    sehir: false,
    ilce: false,
    koy: false,
    isp: false,
    ispStruct: false,
    ispStructType: false
  });

  // Validate function to check if all required selections are made
  const validateForm = () => {
    const newErrors = {
      sehir: sehirId === null,
      ilce: ilceId === null,
      koy: koyId === null,
      isp: ispId === null,
      ispStruct: ispStructId === null,
      ispStructType: ispStructTypeId === null
    };
    
    setErrors(newErrors);
    
    // Check if any required field is empty
    return !Object.values(newErrors).includes(true);
  };

  // Dropdown öğelerini render eden fonksiyon
  const renderItem = (item: any) => {
    return (
      <View style={styles.item}>
        <Text style={styles.textItem}>{item.Name || ''}</Text>
      </View>
    );
  };

  // Get screen width for button sizing
  const screenWidth = Dimensions.get('window').width;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={true}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#0096FF']}
            tintColor="#0096FF"
          />
        }>
        
        <Text style={styles.title}>Konum Altyapı Seçimi</Text>
        
        {/* İL SEÇİMİ */}
        <View style={styles.dropdownContainer}>
          <Text style={styles.label}>Şehir seçiniz</Text>
          {loading.sehirler ? (
            <ActivityIndicator style={styles.loading} size="small" color="#0000ff" />
          ) : (
            <Dropdown
              style={[
                styles.dropdown, 
                isFocus.sehir && styles.focusedDropdown,
                errors.sehir && styles.errorDropdown
              ]}
              placeholderStyle={styles.placeholderStyle}
              selectedTextStyle={styles.selectedTextStyle}
              inputSearchStyle={styles.inputSearchStyle}
              iconStyle={styles.iconStyle}
              data={sehirler}
              search
              maxHeight={300}
              labelField="Name"
              valueField="Id"
              placeholder="Şehir seçiniz"
              searchPlaceholder="Ara..."
              value={sehirId}
              onFocus={() => setIsFocus(prev => ({ ...prev, sehir: true }))}
              onBlur={() => setIsFocus(prev => ({ ...prev, sehir: false }))}
              onChange={item => {
                setSehirId(item.Id);
                setIsFocus(prev => ({ ...prev, sehir: false }));
              }}
              renderLeftIcon={() => (
                <AntDesign style={styles.icon} color="black" name="home" size={20} />
              )}
              renderItem={renderItem}
              searchable={true}
              activeColor="#e6f7ff"
            />
          )}
          {errors.sehir && <Text style={styles.errorText}>Bu alan zorunludur</Text>}
        </View>

        {/* İLÇE SEÇİMİ */}
        {sehirId !== null && (
          <View style={styles.dropdownContainer}>
            <Text style={styles.label}>İlçe seçiniz</Text>
            {loading.ilceler ? (
              <ActivityIndicator style={styles.loading} size="small" color="#0000ff" />
            ) : (
              <Dropdown
                style={[
                  styles.dropdown, 
                  isFocus.ilce && styles.focusedDropdown,
                  errors.ilce && styles.errorDropdown
                ]}
                placeholderStyle={styles.placeholderStyle}
                selectedTextStyle={styles.selectedTextStyle}
                inputSearchStyle={styles.inputSearchStyle}
                iconStyle={styles.iconStyle}
                data={ilceler}
                search
                maxHeight={300}
                labelField="Name"
                valueField="Id"
                placeholder="İlçe seçiniz"
                searchPlaceholder="Ara..."
                value={ilceId}
                onFocus={() => setIsFocus(prev => ({ ...prev, ilce: true }))}
                onBlur={() => setIsFocus(prev => ({ ...prev, ilce: false }))}
                onChange={item => {
                  setIlceId(item.Id);
                  setIsFocus(prev => ({ ...prev, ilce: false }));
                }}
                renderLeftIcon={() => (
                  <AntDesign style={styles.icon} color="black" name="enviromento" size={20} />
                )}
                renderItem={renderItem}
                searchable={true}
                activeColor="#e6f7ff"
              />
            )}
            {errors.ilce && <Text style={styles.errorText}>Bu alan zorunludur</Text>}
          </View>
        )}

        {/* KÖY SEÇİMİ */}
        {ilceId !== null && (
          <View style={styles.dropdownContainer}>
            <Text style={styles.label}>Köy seçiniz</Text>
            {loading.koyler ? (
              <ActivityIndicator style={styles.loading} size="small" color="#0000ff" />
            ) : (
              <Dropdown
                style={[
                  styles.dropdown, 
                  isFocus.koy && styles.focusedDropdown,
                  errors.koy && styles.errorDropdown
                ]}
                placeholderStyle={styles.placeholderStyle}
                selectedTextStyle={styles.selectedTextStyle}
                inputSearchStyle={styles.inputSearchStyle}
                iconStyle={styles.iconStyle}
                data={koyler}
                search
                maxHeight={300}
                labelField="Name"
                valueField="Id"
                placeholder="Köy seçiniz"
                searchPlaceholder="Ara..."
                value={koyId}
                onFocus={() => setIsFocus(prev => ({ ...prev, koy: true }))}
                onBlur={() => setIsFocus(prev => ({ ...prev, koy: false }))}
                onChange={item => {
                  setKoyId(item.Id);
                  setIsFocus(prev => ({ ...prev, koy: false }));
                  
                  // Köy seçimi sonrası alt seçimleri sıfırla
                  setMahalleId(null);
                  setSokakId(null);
                  setIspId(null);
                  setIspStructId(null);
                  setIspStructTypeId(null);
                  
                  // ISP bilgilerini de sıfırla
                  setIsp([]);
                  setIspStruct([]);
                  setIspStructType([]);
                }}
                renderLeftIcon={() => (
                  <AntDesign style={styles.icon} color="black" name="home" size={20} />
                )}
                renderItem={renderItem}
                searchable={true}
                activeColor="#e6f7ff"
              />
            )}
            {errors.koy && <Text style={styles.errorText}>Bu alan zorunludur</Text>}
          </View>
        )}

        {/* MAHALLE SEÇİMİ - Artık sadece "Merkez" için değil, tüm köyler için göster */}
        {koyId !== null && (
          <View style={styles.dropdownContainer}>
            <Text style={styles.label}>Mahalle seçiniz</Text>
            {loading.mahalleler ? (
              <ActivityIndicator style={styles.loading} size="small" color="#0000ff" />
            ) : (
              mahalleler.length > 0 ? (
                // Mahalle verisi varsa dropdown göster
                <Dropdown
                  style={[
                    styles.dropdown, 
                    isFocus.mahalle && styles.focusedDropdown,
                    errors.mahalle && styles.errorDropdown
                  ]}
                  placeholderStyle={styles.placeholderStyle}
                  selectedTextStyle={styles.selectedTextStyle}
                  inputSearchStyle={styles.inputSearchStyle}
                  iconStyle={styles.iconStyle}
                  data={mahalleler}
                  search
                  maxHeight={300}
                  labelField="Name"
                  valueField="Id"
                  placeholder="Mahalle seçiniz"
                  searchPlaceholder="Ara..."
                  value={mahalleId}
                  onFocus={() => setIsFocus(prev => ({ ...prev, mahalle: true }))}
                  onBlur={() => setIsFocus(prev => ({ ...prev, mahalle: false }))}
                  onChange={item => {
                    setMahalleId(item.Id);
                    setIsFocus(prev => ({ ...prev, mahalle: false }));
                  }}
                  renderLeftIcon={() => (
                    <AntDesign style={styles.icon} color="black" name="appstore-o" size={20} />
                  )}
                  renderItem={renderItem}
                  searchable={true}
                  activeColor="#e6f7ff"
                  // Add these properties to fix keyboard issues
                  keyboardAvoiding={Platform.OS === 'ios'}
                  disableLocalSearch={false}
                  onChangeText={() => {}}
                  mode={Platform.OS === 'android' ? 'modal' : 'default'}
                  // Control dropdown position
                  dropdownPosition="auto"
                  // Ensure dropdown properly adjusts with keyboard
                  keyboardShouldPersistTaps="handled"
                />
              ) : (
                // Mahalle verisi yoksa bilgi mesajı göster
                <Text style={styles.noDataText}>Bu köy için mahalle bulunamadı. Direkt olarak altyapı bilgilerini seçebilirsiniz.</Text>
              )
            )}
            {errors.mahalle && <Text style={styles.errorText}>Bu alan zorunludur</Text>}
          </View>
        )}

        {/* SOKAK SEÇİMİ */}
        {mahalleId !== null && (
          <View style={styles.dropdownContainer}>
            <Text style={styles.label}>Sokak seçiniz</Text>
            {loading.sokaklar ? (
              <ActivityIndicator style={styles.loading} size="small" color="#0000ff" />
            ) : (
              <Dropdown
                style={[
                  styles.dropdown, 
                  isFocus.sokak && styles.focusedDropdown,
                  errors.sokak && styles.errorDropdown
                ]}
                placeholderStyle={styles.placeholderStyle}
                selectedTextStyle={styles.selectedTextStyle}
                inputSearchStyle={styles.inputSearchStyle}
                iconStyle={styles.iconStyle}
                data={sokaklar}
                search
                maxHeight={300}
                labelField="Name"
                valueField="Id"
                placeholder="Sokak seçiniz"
                searchPlaceholder="Ara..."
                value={sokakId}
                onFocus={() => setIsFocus(prev => ({ ...prev, sokak: true }))}
                onBlur={() => setIsFocus(prev => ({ ...prev, sokak: false }))}
                onChange={item => {
                  setSokakId(item.Id);
                  setIsFocus(prev => ({ ...prev, sokak: false }));
                }}
                renderLeftIcon={() => (
                  <AntDesign style={styles.icon} color="black" name="arrowsalt" size={20} />
                )}
                renderItem={renderItem}
                searchable={true}
                activeColor="#e6f7ff"
                // Fix for keyboard issue on Android
                keyboardAvoiding={Platform.OS === 'ios'}
                disableLocalSearch={false}
                // The following two props can help with keyboard issues
                onChangeText={() => {}}
                mode={Platform.OS === 'android' ? 'modal' : 'default'}
              />
            )}
            {errors.sokak && <Text style={styles.errorText}>Bu alan zorunludur</Text>}
          </View>
        )}

        {/* ISP SEÇİMİ - Sokak seçildiğinde VEYA mahalle verisi yoksa köy seçiminden sonra göster */}
        {(sokakId !== null || (koyId !== null && mahalleler.length === 0)) && (
          <View style={styles.dropdownContainer}>
            <Text style={styles.label}>İnternet servis sağlayıcı seçiniz</Text>
            {loading.isp ? (
              <ActivityIndicator style={styles.loading} size="small" color="#0000ff" />
            ) : (
              <Dropdown
                style={[
                  styles.dropdown, 
                  isFocus.isp && styles.focusedDropdown,
                  errors.isp && styles.errorDropdown
                ]}
                placeholderStyle={styles.placeholderStyle}
                selectedTextStyle={styles.selectedTextStyle}
                inputSearchStyle={styles.inputSearchStyle}
                iconStyle={styles.iconStyle}
                data={isp}
                search
                maxHeight={300}
                labelField="Name"
                valueField="Id"
                placeholder="İnternet servis sağlayıcı seçiniz"
                searchPlaceholder="Ara..."
                value={ispId}
                onFocus={() => setIsFocus(prev => ({ ...prev, isp: true }))}
                onBlur={() => setIsFocus(prev => ({ ...prev, isp: false }))}
                onChange={item => {
                  setIspId(item.Id);
                  setIsFocus(prev => ({ ...prev, isp: false }));
                }}
                renderLeftIcon={() => (
                  <AntDesign style={styles.icon} color="black" name="wifi" size={20} />
                )}
                renderItem={renderItem}
                searchable={true}
                activeColor="#e6f7ff"
                keyboardAvoiding={Platform.OS === 'ios'}
                disableLocalSearch={false}
                onChangeText={() => {}}
                mode={Platform.OS === 'android' ? 'modal' : 'default'}
              />
            )}
            {errors.isp && <Text style={styles.errorText}>Bu alan zorunludur</Text>}
          </View>
        )}

        {/* ISP Structure SEÇİMİ */}
        {ispId !== null && (
          <View style={styles.dropdownContainer}>
            <Text style={styles.label}>İnternet sağlayıcı altyapısı seçiniz</Text>
            {loading.ispStruct ? (
              <ActivityIndicator style={styles.loading} size="small" color="#0000ff" />
            ) : (
              <Dropdown
                style={[
                  styles.dropdown, 
                  isFocus.ispStruct && styles.focusedDropdown,
                  errors.ispStruct && styles.errorDropdown
                ]}
                placeholderStyle={styles.placeholderStyle}
                selectedTextStyle={styles.selectedTextStyle}
                inputSearchStyle={styles.inputSearchStyle}
                iconStyle={styles.iconStyle}
                data={ispStruct}
                search
                maxHeight={300}
                labelField="Name"
                valueField="Id"
                placeholder="İnternet sağlayıcı altyapısı seçiniz"
                searchPlaceholder="Ara..."
                value={ispStructId}
                onFocus={() => setIsFocus(prev => ({ ...prev, ispStruct: true }))}
                onBlur={() => setIsFocus(prev => ({ ...prev, ispStruct: false }))}
                onChange={item => {
                  setIspStructId(item.Id);
                  setIsFocus(prev => ({ ...prev, ispStruct: false }));
                }}
                renderLeftIcon={() => (
                  <AntDesign style={styles.icon} color="black" name="wifi" size={20} />
                )}
                renderItem={renderItem}
                searchable={true}
                activeColor="#e6f7ff"
                keyboardAvoiding={Platform.OS === 'ios'}
                disableLocalSearch={false}
                onChangeText={() => {}}
                mode={Platform.OS === 'android' ? 'modal' : 'default'}
              />
            )}
            {errors.ispStruct && <Text style={styles.errorText}>Bu alan zorunludur</Text>}
          </View>
        )}

        {/* ISP Structure Type SEÇİMİ */}
        {ispStructId !== null && (
          <View style={styles.dropdownContainer}>
            <Text style={styles.label}>İnternet altyapı türü seçiniz</Text>
            {loading.ispStructType ? (
              <ActivityIndicator style={styles.loading} size="small" color="#0000ff" />
            ) : (
              <Dropdown
                style={[
                  styles.dropdown, 
                  isFocus.ispStructType && styles.focusedDropdown,
                  errors.ispStructType && styles.errorDropdown
                ]}
                placeholderStyle={styles.placeholderStyle}
                selectedTextStyle={styles.selectedTextStyle}
                inputSearchStyle={styles.inputSearchStyle}
                iconStyle={styles.iconStyle}
                data={ispStructType}
                search
                maxHeight={300}
                labelField="Name"
                valueField="Id"
                placeholder="İnternet altyapı türü seçiniz"
                searchPlaceholder="Ara..."
                value={ispStructTypeId}
                onFocus={() => setIsFocus(prev => ({ ...prev, ispStructType: true }))}
                onBlur={() => setIsFocus(prev => ({ ...prev, ispStructType: false }))}
                onChange={item => {
                  setIspStructTypeId(item.Id);
                  setIsFocus(prev => ({ ...prev, ispStructType: false }));
                }}
                renderLeftIcon={() => (
                  <AntDesign style={styles.icon} color="black" name="bars" size={20} />
                )}
                renderItem={renderItem}
                searchable={true}
                activeColor="#e6f7ff"
                keyboardAvoiding={Platform.OS === 'ios'}
                disableLocalSearch={false}
                onChangeText={() => {}}
                mode={Platform.OS === 'android' ? 'modal' : 'default'}
              />
            )}
            {errors.ispStructType && <Text style={styles.errorText}>Bu alan zorunludur</Text>}
          </View>
        )}

        {/* Seçilen konum bilgisini göster - Sokak seçildiğinde VEYA mahalle yoksa köy seçildiğinde */}
        {(sokakId !== null || (koyId !== null && mahalleler.length === 0 && ispId !== null)) && (
          <View style={styles.selectedLocation}>
            <Text style={styles.selectedLocationTitle}>Seçilen Konumun Bilgileri:</Text>
            <Text style={styles.selectedLocationText}>
              {sehirler.find(sehir => sehir.Id === sehirId)?.Name || ''} / 
              {ilceler.find(ilce => ilce.Id === ilceId)?.Name || ''} / 
              {koyler.find(koy => koy.Id === koyId)?.Name || ''}
              {mahalleId !== null && ` / ${mahalleler.find(mahalle => mahalle.Id === mahalleId)?.Name || ''}`}
              {sokakId !== null && ` / ${sokaklar.find(sokak => sokak.Id === sokakId)?.Name || ''}`}
            </Text>

            <Text style={styles.selectedLocationTitle}>Seçilen Konumun Altyapı Bilgileri:</Text>
            <Text style={styles.selectedLocationText}>
              {ispId !== null && ` / ${isp.find(isp => isp.Id === ispId)?.Name || ''}`}
              {ispStructId !== null && ` / ${ispStruct.find(ispStruct => ispStruct.Id === ispStructId)?.Name || ''}`}
              {ispStructTypeId !== null && ` / ${ispStructType.find(ispStructType => ispStructType.Id === ispStructTypeId)?.Name || ''}`}
            </Text>
          </View>
        )}

        <View style={styles.buttonContainer}>
          <Button
            title="Kaydet"
            onPress={() => {
              if (validateForm()) {
                Alert.alert(
                  'Seçiminizi kaydetmek istiyor musunuz?',
                  '',
                  [
                    {
                      text: 'İptal',
                      style: 'cancel',
                    },
                    {
                      text: 'Tamam',
                      onPress: async () => {
                        try {
                          // Seçilen tüm bilgileri topla
                          const selectedCity = sehirler.find(sehir => sehir.Id === sehirId);
                          const selectedDistrict = ilceler.find(ilce => ilce.Id === ilceId);
                          const selectedVillage = koyler.find(koy => koy.Id === koyId);
                          const selectedQuarter = mahalleler.find(mahalle => mahalle.Id === mahalleId);
                          const selectedStreet = sokaklar.find(sokak => sokak.Id === sokakId);
                          const selectedIsp = isp.find(i => i.Id === ispId);
                          const selectedIspStruct = ispStruct.find(i => i.Id === ispStructId);
                          const selectedIspStructType = ispStructType.find(i => i.Id === ispStructTypeId);
                          
                          // Veri yapısını oluştur
                          const ispData: IspStructDataPayload = {
                            cityId: selectedCity?.Id || '',
                            cityName: selectedCity?.Name || '',
                            districtId: selectedDistrict?.Id || '',
                            districtName: selectedDistrict?.Name || '',
                            villageId: selectedVillage?.Id || '',
                            villageName: selectedVillage?.Name || '',
                            quarterId: selectedQuarter?.Id,
                            quarterName: selectedQuarter?.Name,
                            streetId: selectedStreet?.Id,
                            streetName: selectedStreet?.Name,
                            ispId: selectedIsp?.Id || '',
                            ispName: selectedIsp?.Name || '',
                            ispStructId: selectedIspStruct?.Id || '',
                            ispStructName: selectedIspStruct?.Name || '',
                            ispStructTypeId: selectedIspStructType?.Id || '',
                            ispStructTypeName: selectedIspStructType?.Name || '',
                          };
                          
                          // API'ye gönder
                          setLoading(prev => ({ ...prev, saving: true }));
                          const response = await saveIspStructData(ispData);
                          setLoading(prev => ({ ...prev, saving: false }));
                          
                          // Başarılı mesajı göster ve formu sıfırla
                          Alert.alert(
                            'Başarılı',
                            'Altyapı bilgileri başarıyla kaydedildi!',
                            [{ 
                              text: 'Tamam', 
                              onPress: () => {
                                // Tüm seçimleri sıfırla
                                setSehirId(null);
                                setIlceId(null);
                                setKoyId(null);
                                setMahalleId(null);
                                setSokakId(null);
                                setIspId(null);
                                setIspStructId(null);
                                setIspStructTypeId(null);
                                
                                // Alt seviye dropdown verilerini temizle (şehirler hariç)
                                setIlceler([]);
                                setKoyler([]);
                                setMahalleler([]);
                                setSokaklar([]);
                                setIsp([]);
                                setIspStruct([]);
                                setIspStructType([]);
                                
                                // Hata göstergelerini sıfırla
                                setErrors({
                                  sehir: false,
                                  ilce: false,
                                  koy: false,
                                  isp: false,
                                  ispStruct: false,
                                  ispStructType: false
                                });
                              } 
                            }]
                          );
                          
                          // Form sıfırla veya başka bir sayfaya yönlendir
                          // Örneğin: navigation.navigate('Home');
                        } catch (error) {
                          setLoading(prev => ({ ...prev, saving: false }));
                          Alert.alert(
                            'Hata',
                            'Kayıt sırasında bir hata oluştu. Lütfen tekrar deneyin.',
                            [{ text: 'Tamam' }]
                          );
                          console.error('Kayıt hatası:', error);
                        }
                      }
                    }
                  ]
                );
              } else {
                Alert.alert(
                  'Hata',
                  'Zorunlu alanları doldurunuz!',
                  [{ text: 'Tamam' }]
                );
              }
            }}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  container: {
    padding: 16,
    paddingBottom: 30, // Alt kısımda ekstra boşluk
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  dropdownContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '500',
  },
  loading: {
    padding: 15,
  },
  dropdown: {
    height: 50,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  focusedDropdown: {
    borderColor: '#0096FF',
    borderWidth: 1,
  },
  icon: {
    marginRight: 5,
  },
  item: {
    padding: 17,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  textItem: {
    flex: 1,
    fontSize: 16,
  },
  placeholderStyle: {
    fontSize: 16,
  },
  selectedTextStyle: {
    fontSize: 16,
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
    padding: 10,
  },
  selectedLocation: {
    backgroundColor: '#e6f7ff',
    padding: 16,
    borderRadius: 8,
    marginTop: 20,
  },
  selectedLocationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  selectedLocationText: {
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 15,
    width: '100%',
    // Set width to 1/3 of the screen using 33.3%
    alignItems: 'flex-end',
  },
  noDataText: {
    fontSize: 16,
    fontStyle: 'italic',
    color: '#666',
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 8,
    textAlign: 'center',
  },
  errorDropdown: {
    borderColor: 'red',
    borderWidth: 1,
  },
  errorText: {
    color: 'red',
    fontSize: 14,
    marginTop: 5,
  },
});