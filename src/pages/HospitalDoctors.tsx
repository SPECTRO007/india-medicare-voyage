import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Search, Star, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Doctor {
  id: string;
  name: string;
  specialization: string;
  years_experience: number;
  rating: number;
  total_reviews: number;
  consultation_fee: number;
  image_url: string;
  education: string;
  bio: string;
  slots: any;
}

interface Hospital {
  id: string;
  name: string;
  city: string;
  specializations: string[];
}

export default function HospitalDoctors() {
  const { hospitalId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [hospital, setHospital] = useState<Hospital | null>(null);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialization, setSelectedSpecialization] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (hospitalId) {
      fetchData();
    }
  }, [hospitalId]);

  useEffect(() => {
    filterDoctors();
  }, [doctors, searchTerm, selectedSpecialization]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch hospital
      const { data: hospitalData, error: hospitalError } = await supabase
        .from('hospitals')
        .select('*')
        .eq('id', hospitalId)
        .single();

      if (hospitalError) throw hospitalError;
      setHospital(hospitalData);

      // Fetch doctors
      const { data: doctorsData, error: doctorsError } = await supabase
        .from('doctors')
        .select('*')
        .eq('hospital_id', hospitalId)
        .eq('verified', true)
        .order('rating', { ascending: false });

      if (doctorsError) throw doctorsError;
      setDoctors(doctorsData || []);
      
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to load doctors. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterDoctors = () => {
    let filtered = doctors;

    if (searchTerm) {
      filtered = filtered.filter(doctor =>
        doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.specialization.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedSpecialization !== 'all') {
      filtered = filtered.filter(doctor =>
        doctor.specialization.toLowerCase().includes(selectedSpecialization.toLowerCase())
      );
    }

    setFilteredDoctors(filtered);
  };

  const specializations = [...new Set(doctors.map(d => d.specialization))];

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  if (!hospital) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Hospital not found</h1>
        <Button onClick={() => navigate('/hospitals')}>Back to Hospitals</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <Button 
        variant="outline" 
        onClick={() => navigate(`/hospital/${hospitalId}`)}
        className="mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Hospital Details
      </Button>

      <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg p-6">
        <h1 className="text-3xl font-bold mb-2">Doctors at {hospital.name}</h1>
        <p className="text-muted-foreground">
          {hospital.city} • {doctors.length} verified doctors available
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Find a Doctor</CardTitle>
          <CardDescription>Filter by specialization or search by name</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search doctors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={selectedSpecialization} onValueChange={setSelectedSpecialization}>
              <SelectTrigger>
                <SelectValue placeholder="All Specializations" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Specializations</SelectItem>
                {specializations.map(spec => (
                  <SelectItem key={spec} value={spec}>{spec}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Doctors Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDoctors.map((doctor) => (
          <Card key={doctor.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <div className="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden bg-muted">
                {doctor.image_url ? (
                  <img 
                    src={doctor.image_url} 
                    alt={doctor.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-muted-foreground">
                    {doctor.name.split(' ').map(n => n[0]).join('')}
                  </div>
                )}
              </div>
              <CardTitle className="text-lg">{doctor.name}</CardTitle>
              <p className="text-sm text-muted-foreground">{doctor.specialization}</p>
            </CardHeader>
            
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span>Experience</span>
                <span className="font-semibold">{doctor.years_experience} years</span>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span>Rating</span>
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 fill-current text-yellow-400" />
                  <span className="font-semibold">{doctor.rating}</span>
                  <span className="text-muted-foreground">({doctor.total_reviews})</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span>Fee</span>
                <span className="font-semibold">${doctor.consultation_fee}</span>
              </div>

              {doctor.slots && Array.isArray(doctor.slots) && doctor.slots.length > 0 && (
                <div className="pt-2 border-t">
                  <p className="text-xs text-muted-foreground mb-2">Available Slots</p>
                  <div className="flex flex-wrap gap-1">
                    {doctor.slots.slice(0, 3).map((slot: any, idx: number) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {typeof slot === 'string' ? slot : slot.time}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="pt-2 space-y-2">
                <Button 
                  className="w-full" 
                  size="sm"
                  onClick={() => navigate(`/doctor/${doctor.id}`)}
                >
                  View Profile
                </Button>
                <Button 
                  className="w-full" 
                  size="sm"
                  variant="outline"
                  onClick={() => navigate(`/doctor/${doctor.id}`, { state: { bookNow: true } })}
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Book Consultation
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredDoctors.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">No doctors found matching your criteria.</p>
            <Button 
              className="mt-4"
              variant="outline"
              onClick={() => {
                setSearchTerm('');
                setSelectedSpecialization('all');
              }}
            >
              Reset Filters
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}