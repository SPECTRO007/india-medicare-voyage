import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search,
  Filter,
  MapPin,
  Star,
  Calendar,
  Award,
  Clock,
  Users
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export default function Doctors() {
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialization, setSelectedSpecialization] = useState('all');
  const [selectedCity, setSelectedCity] = useState('all');
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  const specializations = [
    'Cardiology', 'Orthopedics', 'Neurology', 'Oncology', 
    'Ophthalmology', 'Gynecology', 'Dermatology', 'Pediatrics'
  ];
  
  const cities = ['Chennai', 'Mumbai', 'Bengaluru', 'Hyderabad', 'Delhi', 'Kolkata'];

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchDoctors();
  }, [user, navigate]);

  useEffect(() => {
    filterDoctors();
  }, [doctors, searchTerm, selectedSpecialization, selectedCity]);

  const fetchDoctors = async () => {
    try {
      const { data, error } = await supabase
        .from('doctors')
        .select('*')
        .eq('verified', true)
        .order('rating', { ascending: false });

      if (error) throw error;
      setDoctors(data || []);
    } catch (error) {
      console.error('Error fetching doctors:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterDoctors = () => {
    let filtered = doctors;

    if (searchTerm) {
      filtered = filtered.filter(doctor =>
        doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.specialization.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.hospital.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedSpecialization !== 'all') {
      filtered = filtered.filter(doctor => 
        doctor.specialization.toLowerCase().includes(selectedSpecialization.toLowerCase())
      );
    }

    if (selectedCity !== 'all') {
      filtered = filtered.filter(doctor => 
        doctor.hospital.toLowerCase().includes(selectedCity.toLowerCase())
      );
    }

    setFilteredDoctors(filtered);
  };

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const formatFee = (fee) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(fee);
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
        <h1 className="text-3xl font-bold mb-2">Find Doctors</h1>
        <p className="text-muted-foreground">
          Connect with verified, internationally trained medical professionals
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filter Doctors
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search doctors, specialization, hospital..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={selectedSpecialization} onValueChange={setSelectedSpecialization}>
              <SelectTrigger>
                <SelectValue placeholder="Select specialization" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Specializations</SelectItem>
                {specializations.map(spec => (
                  <SelectItem key={spec} value={spec}>{spec}</SelectItem>
                ))}
              </SelectContent>
            </Select>

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
          </div>
        </CardContent>
      </Card>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground">
          {filteredDoctors.length} doctor{filteredDoctors.length !== 1 ? 's' : ''} found
        </p>
      </div>

      {/* Doctors Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredDoctors.map((doctor) => (
          <Card key={doctor.id} className="hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <div className="flex items-start gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={`/placeholder-doctor.jpg`} alt={doctor.name} />
                  <AvatarFallback className="bg-primary/10 text-primary text-lg font-semibold">
                    {getInitials(doctor.name)}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl">{doctor.name}</CardTitle>
                      <CardDescription className="text-base font-medium text-primary">
                        {doctor.specialization}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      <span className="font-semibold">{doctor.rating}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1 mt-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{doctor.hospital}</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {doctor.bio && (
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {doctor.bio}
                </p>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {doctor.years_experience} years exp.
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Consultation Fee</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t">
                <div>
                  <span className="text-lg font-bold text-primary">
                    {formatFee(doctor.consultation_fee)}
                  </span>
                  <span className="text-sm text-muted-foreground ml-1">per session</span>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    View Profile
                  </Button>
                  <Button size="sm" className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Book Now
                  </Button>
                </div>
              </div>

              {/* Available Slots Preview */}
              <div className="bg-muted/50 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Next Available</span>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Badge variant="outline" className="text-xs">Today 2:00 PM</Badge>
                  <Badge variant="outline" className="text-xs">Tomorrow 10:00 AM</Badge>
                  <Badge variant="outline" className="text-xs">+5 more</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredDoctors.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No doctors found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search criteria or browse all doctors
            </p>
            <Button onClick={() => {
              setSearchTerm('');
              setSelectedSpecialization('all');
              setSelectedCity('all');
            }}>
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}