import { supabase } from '@/integrations/supabase/client';

export interface FlightSearchParams {
  from: string;
  to: string;
  departureDate: string;
  returnDate?: string;
  passengers: number;
  flightClass: 'economy' | 'premium_economy' | 'business' | 'first';
  tripType: 'one-way' | 'round-trip';
}

export interface Flight {
  id: string;
  airline: string;
  flightNumber: string;
  aircraft: string;
  from: string;
  to: string;
  departure: {
    time: string;
    airport: string;
    terminal: string;
  };
  arrival: {
    time: string;
    airport: string;
    terminal: string;
  };
  duration: string;
  stops: number;
  prices: {
    economy: number;
    premium_economy: number;
    business: number;
    first: number;
  };
  availability: {
    economy: number;
    premium_economy: number;
    business: number;
    first: number;
  };
  baggage: {
    cabin: string;
    checked: string;
  };
  amenities: string[];
  cancellation: string;
  rating: number;
}

export interface Seat {
  number: string;
  row: number;
  letter: string;
  class: string;
  type: 'window' | 'aisle' | 'middle';
  available: boolean;
  extraFee: number;
  features: string[];
}

export interface MealOption {
  id: string;
  name: string;
  description: string;
  price: number;
  dietary: string[];
  image: string;
}

export interface ServiceOption {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
}

export interface FlightBookingData {
  flight: Flight;
  selectedSeats: Seat[];
  selectedMeals: MealOption[];
  selectedServices: ServiceOption[];
  passengers: Array<{
    name: string;
    age: number;
    gender: string;
    seatNumber?: string;
    mealPreference?: string;
  }>;
  totalPrice: number;
}

class FlightService {
  // Search flights - easily replaceable with real API
  async searchFlights(params: FlightSearchParams): Promise<{ flights: Flight[], totalResults: number }> {
    try {
      console.log('Searching flights with params:', params);
      
      // Call dummy API - replace this URL with real API endpoint
      const { data, error } = await supabase.functions.invoke('flight-search', {
        body: {
          action: 'search',
          ...params
        }
      });

      if (error) throw error;

      if (!data.success) {
        throw new Error(data.error || 'Failed to search flights');
      }

      return {
        flights: data.data.flights,
        totalResults: data.data.totalResults
      };
    } catch (error) {
      console.error('Error searching flights:', error);
      throw error;
    }
  }

  // Get seat map for a flight
  async getSeatMap(flightId: string, aircraft: string): Promise<{ seats: Seat[], seatMapLayout: any }> {
    try {
      const { data, error } = await supabase.functions.invoke('flight-search', {
        body: {
          action: 'get-seats',
          flightId,
          aircraft
        }
      });

      if (error) throw error;

      if (!data.success) {
        throw new Error(data.error || 'Failed to get seat map');
      }

      return {
        seats: data.data.seats,
        seatMapLayout: data.data.seatMapLayout
      };
    } catch (error) {
      console.error('Error getting seat map:', error);
      throw error;
    }
  }

  // Get meal options
  async getMealOptions(): Promise<MealOption[]> {
    try {
      const { data, error } = await supabase.functions.invoke('flight-search', {
        body: {
          action: 'get-meals'
        }
      });

      if (error) throw error;

      if (!data.success) {
        throw new Error(data.error || 'Failed to get meal options');
      }

      return data.data;
    } catch (error) {
      console.error('Error getting meal options:', error);
      throw error;
    }
  }

  // Get service options
  async getServiceOptions(): Promise<ServiceOption[]> {
    try {
      const { data, error } = await supabase.functions.invoke('flight-search', {
        body: {
          action: 'get-services'
        }
      });

      if (error) throw error;

      if (!data.success) {
        throw new Error(data.error || 'Failed to get service options');
      }

      return data.data;
    } catch (error) {
      console.error('Error getting service options:', error);
      throw error;
    }
  }

  // Book flight with all details
  async bookFlight(bookingData: FlightBookingData, userId: string): Promise<string> {
    try {
      console.log('Booking flight:', bookingData);

      // Calculate total price
      const basePrice = bookingData.flight.prices.economy; // Use selected class price
      const seatFees = bookingData.selectedSeats.reduce((sum, seat) => sum + seat.extraFee, 0);
      const mealFees = bookingData.selectedMeals.reduce((sum, meal) => sum + meal.price, 0);
      const serviceFees = bookingData.selectedServices.reduce((sum, service) => sum + service.price, 0);
      const totalPrice = basePrice + seatFees + mealFees + serviceFees;

      // Save to database
      const { data, error } = await supabase
        .from('flight_bookings')
        .insert({
          user_id: userId,
          departure_city: bookingData.flight.from,
          arrival_city: bookingData.flight.to,
          departure_date: new Date(bookingData.flight.departure.time).toISOString().split('T')[0],
          return_date: null, // Handle return flights separately
          passenger_count: bookingData.passengers.length,
          flight_class: 'economy', // Use selected class
          total_price: totalPrice,
          booking_status: 'confirmed',
          booking_reference: `MT${Date.now()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`
        })
        .select('id')
        .single();

      if (error) throw error;

      // In a real implementation, you would also save:
      // - Selected seats to a flight_seats table
      // - Selected meals to a flight_meals table  
      // - Selected services to a flight_services table
      // - Passenger details to a flight_passengers table

      return data.id;
    } catch (error) {
      console.error('Error booking flight:', error);
      throw error;
    }
  }

  // Get user's flight bookings
  async getUserBookings(userId: string) {
    try {
      const { data, error } = await supabase
        .from('flight_bookings')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting user bookings:', error);
      throw error;
    }
  }
}

export const flightService = new FlightService();