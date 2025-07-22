import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  MapPin, 
  Star, 
  Wifi, 
  Car, 
  Utensils,
  Search,
  Filter,
  Bed,
  Bath,
  Coffee,
  Tv,
  AirVent,
  Users
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export default function Stays() {
  const [stays, setStays] = useState([]);
  const [filteredStays, setFilteredStays] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState('all');
  const [priceRange, setPriceRange] = useState('all');
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  const cities = ['Chennai', 'Mumbai', 'Bengaluru', 'Hyderabad', 'Delhi', 'Kolkata'];
  const priceRanges = [
    { value: 'budget', label: 'Budget ($20-50)', min: 20, max: 50 },
    { value: 'mid', label: 'Mid-range ($51-100)', min: 51, max: 100 },
    { value: 'luxury', label: 'Luxury ($101+)', min: 101, max: 999 }
  ];

  const amenityIcons = {
    'WiFi': Wifi,
    'Parking': Car,
    'Restaurant': Utensils,
    'AC': AirVent,
    'TV': Tv,
    'Coffee': Coffee,
    'Breakfast': Coffee
  };

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchStays();
  }, [user, navigate]);

  useEffect(() => {
    filterStays();
  }, [stays, searchTerm, selectedCity, priceRange]);

  const fetchStays = async () => {
    try {
      const { data, error } = await supabase
        .from('stays')
        .select('*')
        .order('rating', { ascending: false });

      if (error) throw error;
      setStays(data || []);
    } catch (error) {
      console.error('Error fetching stays:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterStays = () => {
    let filtered = stays;

    if (searchTerm) {
      filtered = filtered.filter(stay =>
        stay.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        stay.city.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCity !== 'all') {
      filtered = filtered.filter(stay => stay.city === selectedCity);
    }

    if (priceRange !== 'all') {
      const range = priceRanges.find(r => r.value === priceRange);
      if (range) {
        filtered = filtered.filter(stay => 
          stay.price_per_night >= range.min && stay.price_per_night <= range.max
        );
      }
    }

    setFilteredStays(filtered);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  const getProximityBadge = (distance) => {
    if (distance <= 2) return { color: 'bg-green-100 text-green-800', text: 'Very Close' };
    if (distance <= 5) return { color: 'bg-yellow-100 text-yellow-800', text: 'Nearby' };
    return { color: 'bg-gray-100 text-gray-800', text: 'Moderate Distance' };
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
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg p-6">
        <h1 className="text-3xl font-bold mb-2">Accommodation</h1>
        <p className="text-muted-foreground">
          Find comfortable stays near top hospitals and medical centers
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filter Accommodations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search accommodations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={selectedCity} onValueChange={setSelectedCity}>
              <SelectTrigger>
                <SelectValue placeholder="Select city" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Cities</SelectItem>
                {cities.map(city => (
                  <SelectItem key={city} value={city}>{city}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={priceRange} onValueChange={setPriceRange}>
              <SelectTrigger>
                <SelectValue placeholder="Price range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Price Ranges</SelectItem>
                {priceRanges.map(range => (
                  <SelectItem key={range.value} value={range.value}>{range.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Quick Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4 text-center">
            <Bed className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <h3 className="font-semibold text-blue-900">Patient-Friendly</h3>
            <p className="text-sm text-blue-700">All accommodations are verified for medical tourists</p>
          </CardContent>
        </Card>
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4 text-center">
            <MapPin className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <h3 className="font-semibold text-green-900">Hospital Proximity</h3>
            <p className="text-sm text-green-700">Strategic locations near major medical centers</p>
          </CardContent>
        </Card>
        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="p-4 text-center">
            <Users className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <h3 className="font-semibold text-purple-900">Family Friendly</h3>
            <p className="text-sm text-purple-700">Suitable for patients and accompanying family</p>
          </CardContent>
        </Card>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground">
          {filteredStays.length} accommodation{filteredStays.length !== 1 ? 's' : ''} found
        </p>
      </div>

      {/* Stays Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredStays.map((stay) => {
          const proximityBadge = getProximityBadge(stay.hospital_proximity_km);
          
          return (
            <Card key={stay.id} className="hover:shadow-lg transition-all duration-300">
              <div className="relative">
                <div className="h-48 bg-gradient-to-r from-gray-100 to-gray-200 rounded-t-lg flex items-center justify-center">
                  <Bed className="h-16 w-16 text-gray-400" />
                </div>
                <div className="absolute top-2 left-2">
                  <Badge className={proximityBadge.color}>
                    {proximityBadge.text}
                  </Badge>
                </div>
                <div className="absolute top-2 right-2 bg-white/90 px-2 py-1 rounded flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                  <span className="text-sm font-medium">{stay.rating}</span>
                </div>
              </div>
              
              <CardHeader>
                <CardTitle className="text-xl">{stay.name}</CardTitle>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{stay.city}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {stay.hospital_proximity_km}km from hospitals
                  </span>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {stay.description && (
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {stay.description}
                  </p>
                )}

                {stay.amenities && stay.amenities.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2 text-sm">Amenities:</h4>
                    <div className="flex flex-wrap gap-2">
                      {stay.amenities.slice(0, 6).map((amenity, index) => {
                        const IconComponent = amenityIcons[amenity] || Coffee;
                        return (
                          <div key={index} className="flex items-center gap-1 bg-muted/50 px-2 py-1 rounded-full">
                            <IconComponent className="h-3 w-3" />
                            <span className="text-xs">{amenity}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="border-t pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <span className="text-2xl font-bold text-primary">
                        {formatPrice(stay.price_per_night)}
                      </span>
                      <span className="text-sm text-muted-foreground ml-1">per night</span>
                    </div>
                    <Button variant="outline" size="sm">
                      View Photos
                    </Button>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button className="flex-1">
                      Book Now
                    </Button>
                    <Button variant="outline" className="flex-1">
                      Add to Itinerary
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredStays.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No accommodations found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search criteria or browse all accommodations
            </p>
            <Button onClick={() => {
              setSearchTerm('');
              setSelectedCity('all');
              setPriceRange('all');
            }}>
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Special Services */}
      <Card className="bg-gradient-to-r from-primary/5 to-secondary/5">
        <CardContent className="p-8">
          <h3 className="text-2xl font-bold mb-6 text-center">Special Services for Medical Tourists</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Car className="h-6 w-6 text-primary" />
              </div>
              <h4 className="font-semibold mb-2">Hospital Transfers</h4>
              <p className="text-sm text-muted-foreground">
                Complimentary transfers to and from medical appointments
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h4 className="font-semibold mb-2">Caregiver Support</h4>
              <p className="text-sm text-muted-foreground">
                Special arrangements for accompanying family members
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Utensils className="h-6 w-6 text-primary" />
              </div>
              <h4 className="font-semibold mb-2">Dietary Assistance</h4>
              <p className="text-sm text-muted-foreground">
                Special meals and dietary requirements for recovery
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}