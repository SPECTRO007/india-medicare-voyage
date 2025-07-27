import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { 
  Search,
  MapPin,
  Star,
  Bed,
  Phone,
  Globe,
  Stethoscope,
  Filter,
  Heart,
  Shield,
  Award
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

interface Hospital {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  latitude: number;
  longitude: number;
  phone: string;
  email: string;
  website: string;
  specializations: string[];
  rating: number;
  total_beds: number;
  icu_beds: number;
  emergency_available: boolean;
  accreditations: string[];
  description: string;
  distance?: number;
}

const cities = [
  { name: 'Bengaluru', coordinates: { lat: 12.9716, lng: 77.5946 } },
  { name: 'Mumbai', coordinates: { lat: 19.0760, lng: 72.8777 } },
  { name: 'Chennai', coordinates: { lat: 13.0827, lng: 80.2707 } },
  { name: 'Delhi', coordinates: { lat: 28.7041, lng: 77.1025 } },
  { name: 'Hyderabad', coordinates: { lat: 17.3850, lng: 78.4867 } },
  { name: 'Kolkata', coordinates: { lat: 22.5726, lng: 88.3639 } },
  { name: 'Pune', coordinates: { lat: 18.5204, lng: 73.8567 } },
  { name: 'Ahmedabad', coordinates: { lat: 23.0225, lng: 72.5714 } }
];

export default function Hospitals() {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [filteredHospitals, setFilteredHospitals] = useState<Hospital[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState('Bengaluru');
  const [radius, setRadius] = useState([50]); // Default 50km radius
  const [selectedSpecialization, setSelectedSpecialization] = useState('all');
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  const specializations = [
    'Cardiology', 'Oncology', 'Orthopedics', 'Neurology', 
    'Ophthalmology', 'Gynecology', 'Dermatology', 'Pediatrics',
    'Gastroenterology', 'Urology', 'ENT', 'Emergency Medicine'
  ];

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchHospitals();
  }, [user, navigate]);

  useEffect(() => {
    filterHospitals();
  }, [hospitals, searchTerm, selectedCity, radius, selectedSpecialization]);

  const fetchHospitals = async () => {
    try {
      const { data, error } = await supabase
        .from('hospitals')
        .select('*')
        .order('rating', { ascending: false });

      if (error) throw error;
      setHospitals(data || []);
    } catch (error) {
      console.error('Error fetching hospitals:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterHospitals = async () => {
    if (!hospitals.length) return;

    const selectedCityData = cities.find(city => city.name === selectedCity);
    if (!selectedCityData) return;

    let filtered = hospitals;

    // Filter by specialization
    if (selectedSpecialization !== 'all') {
      filtered = filtered.filter(hospital => 
        hospital.specializations?.some(spec => 
          spec.toLowerCase().includes(selectedSpecialization.toLowerCase())
        )
      );
    }

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(hospital =>
        hospital.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        hospital.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        hospital.specializations?.some(spec => 
          spec.toLowerCase().includes(searchTerm.toLowerCase())
        ) ||
        hospital.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Calculate distance and filter by radius
    try {
      const hospitalsWithDistance = await Promise.all(
        filtered.map(async (hospital) => {
          const { data } = await supabase.rpc('calculate_distance', {
            lat1: selectedCityData.coordinates.lat,
            lon1: selectedCityData.coordinates.lng,
            lat2: hospital.latitude,
            lon2: hospital.longitude
          });
          
          return {
            ...hospital,
            distance: data || 0
          };
        })
      );

      const filteredByRadius = hospitalsWithDistance.filter(
        hospital => hospital.distance <= radius[0]
      );

      // Sort by distance
      filteredByRadius.sort((a, b) => a.distance - b.distance);
      setFilteredHospitals(filteredByRadius);
    } catch (error) {
      console.error('Error calculating distances:', error);
      setFilteredHospitals(filtered);
    }
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
        <h1 className="text-3xl font-bold mb-2">Find Hospitals</h1>
        <p className="text-muted-foreground">
          Discover top-rated hospitals within your preferred radius and specialization
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Search & Filter Hospitals
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Search & City Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search hospitals, specializations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={selectedCity} onValueChange={setSelectedCity}>
              <SelectTrigger>
                <MapPin className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Select city" />
              </SelectTrigger>
              <SelectContent>
                {cities.map(city => (
                  <SelectItem key={city.name} value={city.name}>{city.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Radius Slider */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Search Radius</label>
              <Badge variant="outline">{radius[0]} km</Badge>
            </div>
            <Slider
              value={radius}
              onValueChange={setRadius}
              max={200}
              min={10}
              step={10}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>10 km</span>
              <span>200 km</span>
            </div>
          </div>

          {/* Specialization Filter */}
          <Select value={selectedSpecialization} onValueChange={setSelectedSpecialization}>
            <SelectTrigger>
              <Stethoscope className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Select specialization" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Specializations</SelectItem>
              {specializations.map(spec => (
                <SelectItem key={spec} value={spec}>{spec}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground">
          {filteredHospitals.length} hospital{filteredHospitals.length !== 1 ? 's' : ''} found within {radius[0]}km of {selectedCity}
        </p>
      </div>

      {/* Hospitals Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredHospitals.map((hospital) => (
          <Card key={hospital.id} className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-primary/20">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Heart className="h-5 w-5 text-red-500" />
                    {hospital.name}
                  </CardTitle>
                  <CardDescription className="text-base mt-1">
                    <MapPin className="h-4 w-4 inline mr-1" />
                    {hospital.address}, {hospital.city}
                    {hospital.distance && (
                      <Badge variant="outline" className="ml-2">
                        {hospital.distance.toFixed(1)} km away
                      </Badge>
                    )}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                  <span className="font-semibold">{hospital.rating}</span>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {hospital.description && (
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {hospital.description}
                </p>
              )}

              {/* Specializations */}
              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Stethoscope className="h-4 w-4" />
                  Specializations
                </h4>
                <div className="flex flex-wrap gap-1">
                  {hospital.specializations?.slice(0, 4).map((spec, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {spec}
                    </Badge>
                  ))}
                  {hospital.specializations?.length > 4 && (
                    <Badge variant="outline" className="text-xs">
                      +{hospital.specializations.length - 4} more
                    </Badge>
                  )}
                </div>
              </div>

              {/* Hospital Info */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Bed className="h-4 w-4 text-muted-foreground" />
                  <span>{hospital.total_beds} beds</span>
                </div>
                <div className="flex items-center gap-2">
                  <Heart className="h-4 w-4 text-red-500" />
                  <span>{hospital.icu_beds} ICU beds</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-green-500" />
                  <span>{hospital.emergency_available ? '24/7 Emergency' : 'No Emergency'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-blue-500" />
                  <span>{hospital.accreditations?.length || 0} accreditations</span>
                </div>
              </div>

              {/* Contact & Action */}
              <div className="flex items-center justify-between pt-2 border-t">
                <div className="space-y-1">
                  {hospital.phone && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Phone className="h-3 w-3" />
                      <span>{hospital.phone}</span>
                    </div>
                  )}
                  {hospital.website && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Globe className="h-3 w-3" />
                      <span className="truncate">Website</span>
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                  <Button size="sm">
                    Contact Hospital
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredHospitals.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No hospitals found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search criteria, increasing the radius, or selecting a different city
            </p>
            <Button onClick={() => {
              setSearchTerm('');
              setSelectedSpecialization('all');
              setRadius([50]);
            }}>
              Reset Filters
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}