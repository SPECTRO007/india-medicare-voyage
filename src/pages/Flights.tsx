import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  User,
  Star,
  Wifi,
  Coffee,
  Utensils,
  Shield
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { flightService, type Flight, type FlightSearchParams, type Seat, type MealOption, type ServiceOption } from '@/services/FlightService';
import { SeatSelector } from '@/components/flight/SeatSelector';
import { MealSelector } from '@/components/flight/MealSelector';
import { ServiceSelector } from '@/components/flight/ServiceSelector';

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

type BookingStep = 'search' | 'select-flight' | 'seats' | 'meals' | 'services' | 'passengers' | 'payment' | 'confirmation';

export default function Flights() {
  const [bookings, setBookings] = useState<FlightBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<BookingStep>('search');
  
  // Search form state
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [departureDate, setDepartureDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [passengers, setPassengers] = useState(1);
  const [flightClass, setFlightClass] = useState<'economy' | 'premium_economy' | 'business' | 'first'>('economy');
  const [tripType, setTripType] = useState<'one-way' | 'round-trip'>('one-way');
  
  // Search results and booking state
  const [searchResults, setSearchResults] = useState<Flight[]>([]);
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);
  const [selectedSeats, setSelectedSeats] = useState<Seat[]>([]);
  const [selectedMeals, setSelectedMeals] = useState<MealOption[]>([]);
  const [selectedServices, setSelectedServices] = useState<ServiceOption[]>([]);
  const [passengerDetails, setPassengerDetails] = useState<Array<{
    name: string;
    age: number;
    gender: string;
  }>>([]);
  
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

  // Initialize passenger details when passenger count changes
  useEffect(() => {
    if (passengers > passengerDetails.length) {
      const newPassengers = Array.from(
        { length: passengers - passengerDetails.length },
        () => ({ name: '', age: 0, gender: '' })
      );
      setPassengerDetails([...passengerDetails, ...newPassengers]);
    } else if (passengers < passengerDetails.length) {
      setPassengerDetails(passengerDetails.slice(0, passengers));
    }
  }, [passengers]);

  const fetchBookings = async () => {
    try {
      if (!user) return;
      
      const userBookings = await flightService.getUserBookings(user.id);
      setBookings(userBookings);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast({
        title: "Error",
        description: "Failed to fetch your bookings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!from || !to || !departureDate) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      setSearchLoading(true);
      const searchParams: FlightSearchParams = {
        from,
        to,
        departureDate,
        returnDate: tripType === 'round-trip' ? returnDate : undefined,
        passengers,
        flightClass,
        tripType
      };

      const { flights } = await flightService.searchFlights(searchParams);
      setSearchResults(flights);
      setCurrentStep('select-flight');
      
      toast({
        title: "Search Complete",
        description: `Found ${flights.length} flights`,
      });
    } catch (error) {
      console.error('Error searching flights:', error);
      toast({
        title: "Search Failed",
        description: "Failed to search flights. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSearchLoading(false);
    }
  };

  const handleFlightSelect = (flight: Flight) => {
    setSelectedFlight(flight);
    setCurrentStep('seats');
  };

  const handleBooking = async () => {
    if (!selectedFlight || !user) return;

    try {
      const bookingData = {
        flight: selectedFlight,
        selectedSeats,
        selectedMeals,
        selectedServices,
        passengers: passengerDetails,
        totalPrice: calculateTotalPrice()
      };

      const bookingId = await flightService.bookFlight(bookingData, user.id);
      
      toast({
        title: "Booking Confirmed!",
        description: `Your flight has been booked successfully. Booking ID: ${bookingId}`,
      });
      
      // Reset form and refresh bookings
      resetBookingForm();
      fetchBookings();
      setCurrentStep('confirmation');
    } catch (error) {
      console.error('Error booking flight:', error);
      toast({
        title: "Booking Failed",
        description: "Failed to book flight. Please try again.",
        variant: "destructive",
      });
    }
  };

  const resetBookingForm = () => {
    setSelectedFlight(null);
    setSelectedSeats([]);
    setSelectedMeals([]);
    setSelectedServices([]);
    setPassengerDetails([]);
    setSearchResults([]);
    setCurrentStep('search');
  };

  const calculateTotalPrice = () => {
    if (!selectedFlight) return 0;
    
    const basePrice = selectedFlight.prices[flightClass] * passengers;
    const seatFees = selectedSeats.reduce((sum, seat) => sum + seat.extraFee, 0);
    const mealFees = selectedMeals.reduce((sum, meal) => sum + meal.price, 0);
    const serviceFees = selectedServices.reduce((sum, service) => sum + service.price, 0);
    
    return basePrice + seatFees + mealFees + serviceFees;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDuration = (departure: string, arrival: string) => {
    const dept = new Date(departure);
    const arr = new Date(arrival);
    const diff = arr.getTime() - dept.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const renderStepIndicator = () => {
    const steps = [
      { key: 'search', label: 'Search' },
      { key: 'select-flight', label: 'Select Flight' },
      { key: 'seats', label: 'Seats' },
      { key: 'meals', label: 'Meals' },
      { key: 'services', label: 'Services' },
      { key: 'passengers', label: 'Passengers' },
      { key: 'payment', label: 'Payment' }
    ];

    const currentIndex = steps.findIndex(step => step.key === currentStep);

    return (
      <div className="flex items-center justify-center mb-6">
        {steps.map((step, index) => (
          <div key={step.key} className="flex items-center">
            <div className={`
              w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
              ${index <= currentIndex ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}
            `}>
              {index + 1}
            </div>
            <span className={`ml-2 text-sm ${index <= currentIndex ? 'text-foreground' : 'text-muted-foreground'}`}>
              {step.label}
            </span>
            {index < steps.length - 1 && (
              <ArrowRight className="w-4 h-4 mx-4 text-muted-foreground" />
            )}
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Plane className="w-8 h-8" />
          Flight Booking
        </h1>
        <p className="text-muted-foreground mt-2">
          Search and book flights for your medical travel journey
        </p>
      </div>

      <Tabs defaultValue="search" value={currentStep === 'search' ? 'search' : 'booking'}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="search">Search & Book</TabsTrigger>
          <TabsTrigger value="bookings">My Bookings</TabsTrigger>
        </TabsList>

        <TabsContent value="search" className="space-y-6">
          {currentStep !== 'search' && renderStepIndicator()}
          
          {/* Search Form */}
          {currentStep === 'search' && (
            <Card>
              <CardHeader>
                <CardTitle>Search Flights</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSearch} className="space-y-6">
                  {/* Trip Type */}
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        value="one-way"
                        checked={tripType === 'one-way'}
                        onChange={(e) => setTripType(e.target.value as 'one-way')}
                      />
                      One Way
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        value="round-trip"
                        checked={tripType === 'round-trip'}
                        onChange={(e) => setTripType(e.target.value as 'round-trip')}
                      />
                      Round Trip
                    </label>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* From */}
                    <div className="space-y-2">
                      <Label htmlFor="from">From</Label>
                      <Select value={from} onValueChange={setFrom}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select departure city" />
                        </SelectTrigger>
                        <SelectContent>
                          <div className="px-2 py-1 text-sm font-medium text-muted-foreground">Indian Cities</div>
                          {indianCities.map((city) => (
                            <SelectItem key={city} value={city}>{city}</SelectItem>
                          ))}
                          <div className="px-2 py-1 text-sm font-medium text-muted-foreground border-t mt-2">International Cities</div>
                          {internationalCities.map((city) => (
                            <SelectItem key={city} value={city}>{city}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* To */}
                    <div className="space-y-2">
                      <Label htmlFor="to">To</Label>
                      <Select value={to} onValueChange={setTo}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select destination city" />
                        </SelectTrigger>
                        <SelectContent>
                          <div className="px-2 py-1 text-sm font-medium text-muted-foreground">Indian Cities</div>
                          {indianCities.map((city) => (
                            <SelectItem key={city} value={city}>{city}</SelectItem>
                          ))}
                          <div className="px-2 py-1 text-sm font-medium text-muted-foreground border-t mt-2">International Cities</div>
                          {internationalCities.map((city) => (
                            <SelectItem key={city} value={city}>{city}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Departure Date */}
                    <div className="space-y-2">
                      <Label htmlFor="departureDate">Departure Date</Label>
                      <Input
                        id="departureDate"
                        type="date"
                        value={departureDate}
                        onChange={(e) => setDepartureDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>

                    {/* Return Date */}
                    {tripType === 'round-trip' && (
                      <div className="space-y-2">
                        <Label htmlFor="returnDate">Return Date</Label>
                        <Input
                          id="returnDate"
                          type="date"
                          value={returnDate}
                          onChange={(e) => setReturnDate(e.target.value)}
                          min={departureDate || new Date().toISOString().split('T')[0]}
                        />
                      </div>
                    )}

                    {/* Passengers */}
                    <div className="space-y-2">
                      <Label htmlFor="passengers">Passengers</Label>
                      <Select value={passengers.toString()} onValueChange={(value) => setPassengers(parseInt(value))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                            <SelectItem key={num} value={num.toString()}>
                              {num} {num === 1 ? 'Passenger' : 'Passengers'}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Flight Class */}
                    <div className="space-y-2">
                      <Label htmlFor="class">Class</Label>
                      <Select value={flightClass} onValueChange={(value) => setFlightClass(value as any)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="economy">Economy</SelectItem>
                          <SelectItem value="premium_economy">Premium Economy</SelectItem>
                          <SelectItem value="business">Business</SelectItem>
                          <SelectItem value="first">First Class</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={searchLoading}>
                    <Search className="w-4 h-4 mr-2" />
                    {searchLoading ? 'Searching...' : 'Search Flights'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Flight Selection */}
          {currentStep === 'select-flight' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Available Flights</h2>
                <Button variant="outline" onClick={() => setCurrentStep('search')}>
                  <Search className="w-4 h-4 mr-2" />
                  New Search
                </Button>
              </div>
              
              {searchResults.map((flight) => (
                <Card key={flight.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="text-center">
                            <div className="font-bold text-lg">
                              {new Date(flight.departure.time).toLocaleTimeString('en-IN', { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </div>
                            <div className="text-sm text-muted-foreground">{flight.from}</div>
                            <div className="text-xs text-muted-foreground">{flight.departure.terminal}</div>
                          </div>
                          
                          <div className="flex-1 text-center">
                            <div className="text-sm text-muted-foreground">{flight.duration}</div>
                            <div className="relative my-2">
                              <div className="border-t border-dashed border-gray-300"></div>
                              <Plane className="w-4 h-4 absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-background" />
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {flight.stops === 0 ? 'Non-stop' : `${flight.stops} stop(s)`}
                            </div>
                          </div>
                          
                          <div className="text-center">
                            <div className="font-bold text-lg">
                              {new Date(flight.arrival.time).toLocaleTimeString('en-IN', { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </div>
                            <div className="text-sm text-muted-foreground">{flight.to}</div>
                            <div className="text-xs text-muted-foreground">{flight.arrival.terminal}</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="font-medium">{flight.airline} {flight.flightNumber}</span>
                          <span>{flight.aircraft}</span>
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            <span>{flight.rating.toFixed(1)}</span>
                          </div>
                        </div>
                        
                        <div className="flex gap-2 mt-2">
                          {flight.amenities.map((amenity) => (
                            <Badge key={amenity} variant="outline" className="text-xs">
                              {amenity === 'WiFi' && <Wifi className="w-3 h-3 mr-1" />}
                              {amenity === 'Meals' && <Utensils className="w-3 h-3 mr-1" />}
                              {amenity}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div className="text-right ml-6">
                        <div className="text-2xl font-bold">
                          {formatPrice(flight.prices[flightClass])}
                        </div>
                        <div className="text-sm text-muted-foreground">per person</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {flight.availability[flightClass]} seats left
                        </div>
                        
                        <Button 
                          className="mt-3"
                          onClick={() => handleFlightSelect(flight)}
                          disabled={flight.availability[flightClass] < passengers}
                        >
                          Select Flight
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Seat Selection */}
          {currentStep === 'seats' && selectedFlight && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Select Seats</h2>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setCurrentStep('select-flight')}>
                    Back
                  </Button>
                  <Button 
                    onClick={() => setCurrentStep('meals')}
                    disabled={selectedSeats.length < passengers}
                  >
                    Continue
                  </Button>
                </div>
              </div>
              
              <SeatSelector
                flight={selectedFlight}
                passengers={passengers}
                onSeatsSelected={setSelectedSeats}
                selectedSeats={selectedSeats}
              />
            </div>
          )}

          {/* Meal Selection */}
          {currentStep === 'meals' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Select Meals</h2>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setCurrentStep('seats')}>
                    Back
                  </Button>
                  <Button onClick={() => setCurrentStep('services')}>
                    Continue
                  </Button>
                </div>
              </div>
              
              <MealSelector
                passengers={passengers}
                onMealsSelected={setSelectedMeals}
                selectedMeals={selectedMeals}
              />
            </div>
          )}

          {/* Service Selection */}
          {currentStep === 'services' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Additional Services</h2>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setCurrentStep('meals')}>
                    Back
                  </Button>
                  <Button onClick={() => setCurrentStep('passengers')}>
                    Continue
                  </Button>
                </div>
              </div>
              
              <ServiceSelector
                onServicesSelected={setSelectedServices}
                selectedServices={selectedServices}
              />
            </div>
          )}

          {/* Passenger Details */}
          {currentStep === 'passengers' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Passenger Details</h2>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setCurrentStep('services')}>
                    Back
                  </Button>
                  <Button onClick={() => setCurrentStep('payment')}>
                    Continue to Payment
                  </Button>
                </div>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle>Enter Passenger Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {passengerDetails.map((passenger, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <h4 className="font-medium mb-4">Passenger {index + 1}</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label>Full Name</Label>
                            <Input
                              value={passenger.name}
                              onChange={(e) => {
                                const updated = [...passengerDetails];
                                updated[index].name = e.target.value;
                                setPassengerDetails(updated);
                              }}
                              placeholder="Enter full name"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Age</Label>
                            <Input
                              type="number"
                              value={passenger.age || ''}
                              onChange={(e) => {
                                const updated = [...passengerDetails];
                                updated[index].age = parseInt(e.target.value) || 0;
                                setPassengerDetails(updated);
                              }}
                              placeholder="Age"
                              min="1"
                              max="120"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Gender</Label>
                            <Select
                              value={passenger.gender}
                              onValueChange={(value) => {
                                const updated = [...passengerDetails];
                                updated[index].gender = value;
                                setPassengerDetails(updated);
                              }}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select gender" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="male">Male</SelectItem>
                                <SelectItem value="female">Female</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Payment & Confirmation */}
          {currentStep === 'payment' && selectedFlight && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Payment & Confirmation</h2>
                <Button variant="outline" onClick={() => setCurrentStep('passengers')}>
                  Back
                </Button>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Booking Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle>Booking Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Flight:</span>
                        <span className="font-medium">{selectedFlight.airline} {selectedFlight.flightNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Route:</span>
                        <span>{selectedFlight.from} → {selectedFlight.to}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Date:</span>
                        <span>{new Date(selectedFlight.departure.time).toLocaleDateString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Passengers:</span>
                        <span>{passengers}</span>
                      </div>
                    </div>
                    
                    <div className="border-t pt-4 space-y-2">
                      <div className="flex justify-between">
                        <span>Base Fare ({passengers} × {formatPrice(selectedFlight.prices[flightClass])}):</span>
                        <span>{formatPrice(selectedFlight.prices[flightClass] * passengers)}</span>
                      </div>
                      
                      {selectedSeats.length > 0 && (
                        <div className="flex justify-between">
                          <span>Seat Selection:</span>
                          <span>{formatPrice(selectedSeats.reduce((sum, seat) => sum + seat.extraFee, 0))}</span>
                        </div>
                      )}
                      
                      {selectedMeals.length > 0 && (
                        <div className="flex justify-between">
                          <span>Meals:</span>
                          <span>{formatPrice(selectedMeals.reduce((sum, meal) => sum + meal.price, 0))}</span>
                        </div>
                      )}
                      
                      {selectedServices.length > 0 && (
                        <div className="flex justify-between">
                          <span>Services:</span>
                          <span>{formatPrice(selectedServices.reduce((sum, service) => sum + service.price, 0))}</span>
                        </div>
                      )}
                      
                      <div className="border-t pt-2 flex justify-between font-bold text-lg">
                        <span>Total:</span>
                        <span>{formatPrice(calculateTotalPrice())}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Payment Form */}
                <Card>
                  <CardHeader>
                    <CardTitle>Payment Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-4 bg-blue-50 rounded-lg text-center">
                        <Shield className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                        <p className="text-sm text-blue-800">
                          This is a demo booking system. No actual payment will be processed.
                        </p>
                      </div>
                      
                      <Button 
                        className="w-full" 
                        size="lg"
                        onClick={handleBooking}
                      >
                        <CreditCard className="w-4 h-4 mr-2" />
                        Confirm Booking
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Confirmation */}
          {currentStep === 'confirmation' && (
            <Card>
              <CardContent className="text-center py-8">
                <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-2">Booking Confirmed!</h2>
                <p className="text-muted-foreground mb-6">
                  Your flight has been successfully booked. You will receive a confirmation email shortly.
                </p>
                <Button onClick={resetBookingForm}>
                  Book Another Flight
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="bookings">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plane className="w-5 h-5" />
                My Flight Bookings
              </CardTitle>
            </CardHeader>
            <CardContent>
              {bookings.length === 0 ? (
                <div className="text-center py-8">
                  <Plane className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No flight bookings found.</p>
                  <p className="text-sm text-muted-foreground">Book your first flight to get started!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {bookings.map((booking) => (
                    <div key={booking.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
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
                          <div className="text-lg font-bold">
                            {formatPrice(booking.total_price)}
                          </div>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-muted-foreground" />
                          <span>{booking.departure_city} → {booking.arrival_city}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span>{new Date(booking.departure_date).toLocaleDateString('en-IN')}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-muted-foreground" />
                          <span>{booking.passenger_count} {booking.passenger_count === 1 ? 'Passenger' : 'Passengers'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CreditCard className="w-4 h-4 text-muted-foreground" />
                          <span className="capitalize">{booking.flight_class.replace('_', ' ')}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}