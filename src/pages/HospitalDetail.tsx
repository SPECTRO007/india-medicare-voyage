import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, MapPin, Phone, Mail, Globe, Bed, Activity } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Hospital {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  phone: string;
  email: string;
  website: string;
  specializations: string[];
  accreditations: string[];
  image_url: string;
  description: string;
  rating: number;
  total_beds: number;
  icu_beds: number;
  emergency_available: boolean;
}

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
}

const HospitalDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [hospital, setHospital] = useState<Hospital | null>(null);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchHospitalDetails();
    }
  }, [id]);

  const fetchHospitalDetails = async () => {
    try {
      setLoading(true);
      
      // Fetch hospital details
      const { data: hospitalData, error: hospitalError } = await supabase
        .from('hospitals')
        .select('*')
        .eq('id', id)
        .single();

      if (hospitalError) throw hospitalError;
      setHospital(hospitalData);

      // Fetch doctors for this hospital
      const { data: doctorsData, error: doctorsError } = await supabase
        .from('doctors')
        .select('*')
        .eq('hospital_id', id)
        .eq('verified', true);

      if (doctorsError) throw doctorsError;
      setDoctors(doctorsData || []);
      
    } catch (error) {
      console.error('Error fetching hospital details:', error);
      toast({
        title: "Error",
        description: "Failed to load hospital details. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-64 bg-muted rounded-lg"></div>
          <div className="h-4 bg-muted rounded w-3/4"></div>
          <div className="h-4 bg-muted rounded w-1/2"></div>
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
    <div className="container mx-auto px-4 py-8">
      {/* Hospital Header */}
      <div className="mb-8">
        <Button 
          variant="outline" 
          onClick={() => navigate('/hospitals')}
          className="mb-4"
        >
          ← Back to Hospitals
        </Button>
        
        <Card className="overflow-hidden">
          <div className="relative h-64 bg-gradient-to-r from-primary to-primary-light">
            {hospital.image_url && (
              <img 
                src={hospital.image_url} 
                alt={hospital.name}
                className="w-full h-full object-cover"
              />
            )}
            <div className="absolute inset-0 bg-black/50 flex items-end">
              <div className="p-6 text-white">
                <h1 className="text-3xl font-bold mb-2">{hospital.name}</h1>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>{hospital.city}, {hospital.state}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-current text-yellow-400" />
                    <span>{hospital.rating}/5</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <CardContent className="p-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2">About</h3>
                <p className="text-muted-foreground mb-4">{hospital.description}</p>
                
                <h3 className="font-semibold mb-2">Specializations</h3>
                <div className="flex flex-wrap gap-2 mb-4">
                  {hospital.specializations?.map((spec, index) => (
                    <Badge key={index} variant="secondary">{spec}</Badge>
                  ))}
                </div>

                <h3 className="font-semibold mb-2">Accreditations</h3>
                <div className="flex flex-wrap gap-2">
                  {hospital.accreditations?.map((acc, index) => (
                    <Badge key={index} variant="outline">{acc}</Badge>
                  ))}
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span>{hospital.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span>{hospital.email}</span>
                </div>
                {hospital.website && (
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-muted-foreground" />
                    <a href={hospital.website} target="_blank" rel="noopener noreferrer" 
                       className="text-primary hover:underline">
                      {hospital.website}
                    </a>
                  </div>
                )}
                
                <div className="pt-4 border-t space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bed className="w-4 h-4 text-muted-foreground" />
                      <span>Total Beds</span>
                    </div>
                    <span className="font-semibold">{hospital.total_beds}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Activity className="w-4 h-4 text-muted-foreground" />
                      <span>ICU Beds</span>
                    </div>
                    <span className="font-semibold">{hospital.icu_beds}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Doctors Section */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Our Doctors ({doctors.length})</h2>
        
        {doctors.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">No doctors available at this hospital yet.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {doctors.map((doctor) => (
              <Card key={doctor.id} className="hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => navigate(`/doctor/${doctor.id}`)}>
                <CardHeader className="text-center">
                  <div className="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden bg-muted">
                    {doctor.image_url ? (
                      <img 
                        src={doctor.image_url} 
                        alt={doctor.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        {doctor.name.split(' ').map(n => n[0]).join('')}
                      </div>
                    )}
                  </div>
                  <CardTitle className="text-lg">{doctor.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{doctor.specialization}</p>
                </CardHeader>
                
                <CardContent className="pt-0 space-y-2">
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
                    <span>Consultation Fee</span>
                    <span className="font-semibold">${doctor.consultation_fee}</span>
                  </div>
                  
                  <Button className="w-full mt-4" size="sm">
                    View Profile
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HospitalDetail;