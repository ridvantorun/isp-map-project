// MongoDB modellerine uygun tipler
export interface Sehir {
  _id: string;
  Id: string;
  Name: string;
}

export interface Ilce {
  _id: string;
  Id: string;
  Name: string;
  CityId: string;
}

export interface Koy {
  _id: string;
  Id: string;
  Name: string;
  DistrictId: string;
}

export interface Mahalle {
  _id: string;
  Id: string;
  Name: string;
  VillageId: string;
}

export interface Sokak {
  _id: string;
  Id: string;
  Name: string;
  QuarterId: string;
}

export interface Isp {
  _id: string;
  Id: string;
  Name: string;
}

export interface IspStruct {
  _id: string;
  Id: string;
  Name: string;
}

export interface IspStructType {
  _id: string;
  Id: string;
  Name: string;
}

export interface IspStructDataPayload {
  cityId: string;
  cityName: string;
  districtId: string;
  districtName: string;
  villageId: string;
  villageName: string;
  quarterId?: string;
  quarterName?: string;
  streetId?: string;
  streetName?: string;
  ispId: string;
  ispName: string;
  ispStructId: string;
  ispStructName: string;
  ispStructTypeId: string;
  ispStructTypeName: string;
}

export interface IspStructDataResponse extends IspStructDataPayload {
  _id: string;
  // Koordinat tanımını ekliyoruz
  coordinates: {
    latitude: number | null;
    longitude: number | null;
  };
  // Polygon verileri için yeni alan
  boundary: Array<{
    latitude: number;
    longitude: number;
  }>;
  createdAt: string;
  updatedAt: string;
}

import Constants from 'expo-constants';

// API URL'i - Her zaman HTTPS kullan
const API_BASE_URL = (() => {
  // Üretim ortamında doğrudan Render URL'sini kullan
  if (!__DEV__) {
    return 'https://<your-project-name>.onrender.com/api';
  }
  
  // Geliştirme ortamında bile Render API'yi kullan
  return 'https://<your-project-name>.onrender.com/api';
})();

// API çağrıları
export const fetchSehirler = async (): Promise<Sehir[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/sehirler`);
    return await response.json();
  } catch (error) {
    console.error('Şehirleri getirirken hata oluştu:', error);
    return [];
  }
};

export const fetchIlceler = async (cityId: string): Promise<Ilce[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/ilceler?cityId=${cityId}`);
    return await response.json();
  } catch (error) {
    console.error('İlçeleri getirirken hata oluştu:', error);
    return [];
  }
};

export const fetchKoyler = async (districtId: string): Promise<Koy[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/koyler?districtId=${districtId}`);
    return await response.json();
  } catch (error) {
    console.error('Köyleri getirirken hata oluştu:', error);
    return [];
  }
};

export const fetchMahalleler = async (villageId: string): Promise<Mahalle[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/mahalleler?villageId=${villageId}`);
    return await response.json();
  } catch (error) {
    console.error('Mahalleleri getirirken hata oluştu:', error);
    return [];
  }
};

export const fetchSokaklar = async (quarterId: string): Promise<Sokak[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/sokaklar?quarterId=${quarterId}`);
    return await response.json();
  } catch (error) {
    console.error('Sokakları getirirken hata oluştu:', error);
    return [];
  }
};

export const fetchIsp = async (): Promise<Isp[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/isp`);
    return await response.json();
  } catch (error) {
    console.error('Şehirleri getirirken hata oluştu:', error);
    return [];
  }
};

export const fetchIspStruct = async (): Promise<IspStruct[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/isp_struct`);
    return await response.json();
  } catch (error) {
    console.error('Şehirleri getirirken hata oluştu:', error);
    return [];
  }
};

export const fetchIspStructType = async (): Promise<IspStructType[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/isp_struct_type`);
    return await response.json();
  } catch (error) {
    console.error('Şehirleri getirirken hata oluştu:', error);
    return [];
  }
};

// ISP Structure Data'yı kaydet
export const saveIspStructData = async (data: IspStructDataPayload): Promise<IspStructDataResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/isp-struct-data`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error('Server error: ' + response.status);
    }
    
    return await response.json();
  } catch (error) {
    console.error('ISP Struct Data kaydederken hata oluştu:', error);
    throw error;
  }
};

// ISP Structure Data'yı getir
export const getIspStructData = async (): Promise<IspStructDataResponse[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/isp-struct-data`);
    
    if (!response.ok) {
      throw new Error('Server error: ' + response.status);
    }
    
    return await response.json();
  } catch (error) {
    console.error('ISP Struct Data alırken hata oluştu:', error);
    return [];
  }
};

