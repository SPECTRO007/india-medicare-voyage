import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Plane, 
  Calendar, 
  MapPin, 
  Clock, 
  Users, 
  CreditCard,
  Search,
  ArrowRight,
  CheckCircle,
  User
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface FlightBooking {
  id: string;
  departure_city: string;
  arrival_city: string;
  departure_date: string;
  return_date?: string;
  passenger_count: number;
  flight_class: string;
  total_price?: number;
  booking_status: string;
  booking_reference?: string;
  created_at: string;
}

const indianCities = [
  'Mumbai', 'Delhi', 'Bengaluru', 'Chennai', 'Kolkata', 
  'Hyderabad', 'Pune', 'Ahmedabad', 'Kochi', 'Goa'
];

const internationalCities = [
  'New York', 'London', 'Dubai', 'Singapore', 'Toronto',
  'Frankfurt', 'Paris', 'Amsterdam', 'Sydney', 'Los Angeles'
];

export default function Flights() {
  const [bookings, setBookings] = useState<FlightBooking[]>([]);
  const [departureCity, setDepartureCity] = useState('');
  const [arrivalCity, setArrivalCity] = useState('');
  const [departureDate, setDepartureDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [passengerCount, setPassengerCount] = useState(1);
  const [flightClass, setFlightClass] = useState('economy');
  const [tripType, setTripType] = useState('round-trip');
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchBookings();
  }, [user, navigate]);

  const fetchBookings = async () => {
    try {
      const { data, error } = await supabase
        .from('flight_bookings')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBookings(data || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = async () => {
    if (!departureCity || !arrivalCity || !departureDate) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setBookingLoading(true);
    try {
      // Simulate price calculation (in real app, this would come from airline APIs)
      const basePrice = flightClass === 'economy' ? 800 : flightClass === 'business' ? 2500 : 5000;
      const totalPrice = basePrice * passengerCount;

      const { error } = await supabase
        .from('flight_bookings')
        .insert({
          user_id: user.id,
          departure_city: departureCity,
          arrival_city: arrivalCity,
          departure_date: departureDate,
          return_date: tripType === 'round-trip' ? returnDate : null,
          passenger_count: passengerCount,
          flight_class: flightClass,
          total_price: totalPrice,
          booking_status: 'pending',
          booking_reference: `FL${Date.now().toString().slice(-6)}`
        });

      if (error) throw error;

      toast({
        title: "Booking Request Submitted",
        description: "Your flight booking request has been submitted. We'll contact you with options.",
      });

      // Reset form
      setDepartureCity('');
      setArrivalCity('');
      setDepartureDate('');
      setReturnDate('');
      setPassengerCount(1);
      setFlightClass('economy');
      
      fetchBookings();
    } catch (error) {
      console.error('Error creating booking:', error);
      toast({
        title: "Booking Failed",
        description: "There was an error submitting your booking request",
        variant: "destructive"
      });
    } finally {
      setBookingLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg p-6">
        <h1 className="text-3xl font-bold mb-2">Flight Booking</h1>
        <p className="text-muted-foreground">Find the best flights to India for your medical journey</p>
      </div>

      {/* Flight Search Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plane className="h-5 w-5" />
            Search & Book Flights
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Trip Type */}
          <div className="flex gap-4">
            <Button
              variant={tripType === 'round-trip' ? 'default' : 'outline'}
              onClick={() => setTripType('round-trip')}
              size="sm"
            >
              Round Trip
            </Button>
            <Button
              variant={tripType === 'one-way' ? 'default' : 'outline'}
              onClick={() => setTripType('one-way')}
              size="sm"
            >
              One Way
            </Button>
          </div>

          {/* Cities */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>From</Label>
              <Select value={departureCity} onValueChange={setDepartureCity}>
                <SelectTrigger>
                  <SelectValue placeholder="Departure city" />
                </SelectTrigger>
                <SelectContent>
                  <div className="p-2 font-semibold text-sm text-muted-foreground">International Cities</div>
                  {internationalCities.map(city => (
                    <SelectItem key={city} value={city}>{city}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>To</Label>
              <Select value={arrivalCity} onValueChange={setArrivalCity}>
                <SelectTrigger>
                  <SelectValue placeholder="Arrival city" />
                </SelectTrigger>
                <SelectContent>
                  <div className="p-2 font-semibold text-sm text-muted-foreground">Indian Cities</div>
                  {indianCities.map(city => (
                    <SelectItem key={city} value={city}>{city}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Departure Date</Label>
              <Input
                type="date"
                value={departureDate}
                onChange={(e) => setDepartureDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            {tripType === 'round-trip' && (
              <div className="space-y-2">
                <Label>Return Date</Label>
                <Input
                  type="date"
                  value={returnDate}
                  onChange={(e) => setReturnDate(e.target.value)}
                  min={departureDate || new Date().toISOString().split('T')[0]}
                />
              </div>
            )}
          </div>

          {/* Passengers & Class */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Passengers</Label>
              <Select value={passengerCount.toString()} onValueChange={(value) => setPassengerCount(parseInt(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6].map(num => (
                    <SelectItem key={num} value={num.toString()}>
                      {num} {num === 1 ? 'Passenger' : 'Passengers'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Class</Label>
              <Select value={flightClass} onValueChange={setFlightClass}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="economy">Economy</SelectItem>
                  <SelectItem value="business">Business</SelectItem>
                  <SelectItem value="first">First Class</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button 
            onClick={handleBooking} 
            className="w-full" 
            disabled={bookingLoading}
            size="lg"
          >
            {bookingLoading ? 'Submitting Request...' : 'Submit Booking Request'}
          </Button>

          <div className="text-sm text-muted-foreground text-center">
            <p>* This will submit a booking request. Our travel team will contact you with flight options and pricing.</p>
          </div>
        </CardContent>
      </Card>

      {/* Booking History */}
      {bookings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Your Flight Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {bookings.map((booking) => (
                <div key={booking.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(booking.booking_status)}>
                        {booking.booking_status.charAt(0).toUpperCase() + booking.booking_status.slice(1)}
                      </Badge>
                      {booking.booking_reference && (
                        <span className="text-sm text-muted-foreground">
                          Ref: {booking.booking_reference}
                        </span>
                      )}
                    </div>
                    {booking.total_price && (
                      <span className="font-semibold text-lg">
                        {formatPrice(booking.total_price)}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{booking.departure_city}</span>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{booking.arrival_city}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{new Date(booking.departure_date).toLocaleDateString()}</span>
                      {booking.return_date && (
                        <>
                          <ArrowRight className="h-4 w-4 text-muted-foreground" />
                          <span>{new Date(booking.return_date).toLocaleDateString()}</span>
                        </>
                      )}
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{booking.passenger_count}</span>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {booking.flight_class}
                      </Badge>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Requested on {new Date(booking.created_at).toLocaleDateString()}
                    </span>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                      {booking.booking_status === 'pending' && (
                        <Button variant="outline" size="sm">
                          Cancel Request
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}