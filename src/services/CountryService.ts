import { supabase } from '@/integrations/supabase/client';

export interface CountryData {
  name: string;
  code: string;
  phoneCode: string;
  currency: string;
  language: string;
  timezone: string;
  hospitals: {
    total: number;
    multiSpecialty: number;
    government: number;
    private: number;
    specialties: string[];
    topHospitals: Array<{
      name: string;
      type: string;
      specialties: string[];
      beds: number;
      rating: number;
    }>;
  };
  hotels: {
    total: number;
    luxury: number;
    budget: number;
    midRange: number;
    averageRates: {
      luxury: number;
      midRange: number;
      budget: number;
    };
    popularChains: string[];
  };
  cities: Array<{
    name: string;
    hospitals: number;
    hotels: number;
    medicalTourism: boolean;
    airportCode: string;
  }>;
}

class CountryService {
  // Get all available countries - easily replaceable with real API
  async getAllCountries(): Promise<CountryData[]> {
    try {
      console.log('Fetching all countries data');
      
      // This URL can be easily replaced with a real API endpoint
      const response = await fetch(
        `https://brecacsjupkqnxodjkuc.supabase.co/functions/v1/country-data?action=get-all-countries`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch countries');
      }

      return result.data;
    } catch (error) {
      console.error('Error fetching countries:', error);
      throw error;
    }
  }

  // Get specific country data
  async getCountryData(countryCode: string): Promise<CountryData> {
    try {
      console.log('Fetching country data for:', countryCode);
      
      const response = await fetch(
        `https://brecacsjupkqnxodjkuc.supabase.co/functions/v1/country-data?action=get-country&country=${countryCode}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch country data');
      }

      return result.data;
    } catch (error) {
      console.error('Error fetching country data:', error);
      throw error;
    }
  }

  // Get hospital data for a country
  async getHospitalData(countryCode: string, city?: string) {
    try {
      console.log('Fetching hospital data for:', countryCode, city);
      
      let url = `https://brecacsjupkqnxodjkuc.supabase.co/functions/v1/country-data?action=get-hospitals&country=${countryCode}`;
      if (city) {
        url += `&city=${encodeURIComponent(city)}`;
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch hospital data');
      }

      return result.data;
    } catch (error) {
      console.error('Error fetching hospital data:', error);
      throw error;
    }
  }

  // Get hotel data for a country
  async getHotelData(countryCode: string) {
    try {
      console.log('Fetching hotel data for:', countryCode);
      
      const response = await fetch(
        `https://brecacsjupkqnxodjkuc.supabase.co/functions/v1/country-data?action=get-hotels&country=${countryCode}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch hotel data');
      }

      return result.data;
    } catch (error) {
      console.error('Error fetching hotel data:', error);
      throw error;
    }
  }

  // Search cities by country for medical tourism
  async searchMedicalTourismCities(countryCode: string) {
    try {
      const countryData = await this.getCountryData(countryCode);
      return countryData.cities.filter(city => city.medicalTourism);
    } catch (error) {
      console.error('Error searching medical tourism cities:', error);
      throw error;
    }
  }
}

export const countryService = new CountryService();