import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Star, MapPin, Calendar, Award, MessageCircle, DollarSign } from 'lucide-react';
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
  certifications: string[];
  languages: string[];
  hospital: {
    id: string;
    name: string;
    city: string;
    state: string;
  };
}

interface Review {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
  user: {
    name: string;
  };
}

const DoctorDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [requestMessage, setRequestMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (id) {
      fetchDoctorDetails();
    }
  }, [id]);

  const fetchDoctorDetails = async () => {
    try {
      setLoading(true);
      
      // Fetch doctor details with hospital info
      const { data: doctorData, error: doctorError } = await supabase
        .from('doctors')
        .select(`
          *,
          hospital:hospitals(id, name, city, state)
        `)
        .eq('id', id)
        .single();

      if (doctorError) throw doctorError;
      setDoctor(doctorData);

      // Fetch reviews
      const { data: reviewsData, error: reviewsError } = await supabase
        .from('doctor_reviews')
        .select(`
          *,
          user:profiles(name)
        `)
        .eq('doctor_id', id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (reviewsError) throw reviewsError;
      setReviews(reviewsData || []);
      
    } catch (error) {
      console.error('Error fetching doctor details:', error);
      toast({
        title: "Error",
        description: "Failed to load doctor details. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRequestCommunication = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to request communication with the doctor.",
        variant: "destructive",
      });
      navigate('/auth');
      return;
    }

    if (!requestMessage.trim()) {
      toast({
        title: "Message Required",
        description: "Please enter a message describing your medical concern.",
        variant: "destructive",
      });
      return;
    }

    try {
      setSubmitting(true);
      
      const { error } = await supabase
        .from('communication_requests')
        .insert({
          user_id: user.id,
          doctor_id: id,
          message: requestMessage.trim(),
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: "Request Sent",
        description: "Your communication request has been sent to the doctor. You will be notified when they respond.",
      });
      
      setRequestMessage('');
      
    } catch (error) {
      console.error('Error sending communication request:', error);
      toast({
        title: "Error",
        description: "Failed to send communication request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
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

  if (!doctor) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Doctor not found</h1>
        <Button onClick={() => navigate('/doctors')}>Back to Doctors</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Button 
        variant="outline" 
        onClick={() => navigate(-1)}
        className="mb-6"
      >
        ← Back
      </Button>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Doctor Profile */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-shrink-0">
                  <div className="w-32 h-32 rounded-full overflow-hidden bg-muted">
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
                </div>
                
                <div className="flex-1">
                  <h1 className="text-2xl font-bold mb-2">{doctor.name}</h1>
                  <p className="text-lg text-primary mb-2">{doctor.specialization}</p>
                  
                  <div className="flex items-center gap-4 mb-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{doctor.years_experience} years experience</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-current text-yellow-400" />
                      <span>{doctor.rating}/5 ({doctor.total_reviews} reviews)</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>{doctor.hospital?.name}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {doctor.languages?.map((lang, index) => (
                      <Badge key={index} variant="outline">{lang}</Badge>
                    ))}
                  </div>

                  <div className="flex items-center gap-1 text-lg font-semibold">
                    <DollarSign className="w-5 h-5" />
                    <span>{doctor.consultation_fee} consultation fee</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Education & Bio */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5" />
                Education & Experience
              </CardTitle>
            </CardHeader>
            <CardContent>
              {doctor.education && (
                <div className="mb-4">
                  <h3 className="font-semibold mb-2">Education</h3>
                  <p className="text-muted-foreground">{doctor.education}</p>
                </div>
              )}
              
              {doctor.bio && (
                <div className="mb-4">
                  <h3 className="font-semibold mb-2">About</h3>
                  <p className="text-muted-foreground">{doctor.bio}</p>
                </div>
              )}

              {doctor.certifications && doctor.certifications.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Certifications</h3>
                  <div className="flex flex-wrap gap-2">
                    {doctor.certifications.map((cert, index) => (
                      <Badge key={index} variant="secondary">{cert}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Reviews */}
          <Card>
            <CardHeader>
              <CardTitle>Patient Reviews</CardTitle>
            </CardHeader>
            <CardContent>
              {reviews.length === 0 ? (
                <p className="text-muted-foreground">No reviews yet.</p>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review.id} className="border-b pb-4 last:border-b-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{review.user?.name || 'Anonymous'}</span>
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i} 
                                className={`w-3 h-3 ${i < review.rating ? 'fill-current text-yellow-400' : 'text-muted-foreground'}`} 
                              />
                            ))}
                          </div>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {new Date(review.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      {review.comment && (
                        <p className="text-sm text-muted-foreground">{review.comment}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Communication Request */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                Request Communication
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Send a message to Dr. {doctor.name} to request a consultation or ask questions about your medical concerns.
              </p>
              
              <Textarea
                placeholder="Describe your medical concern or questions for the doctor..."
                value={requestMessage}
                onChange={(e) => setRequestMessage(e.target.value)}
                rows={4}
              />
              
              <Button 
                onClick={handleRequestCommunication}
                disabled={submitting || !requestMessage.trim()}
                className="w-full"
              >
                {submitting ? 'Sending...' : 'Send Request'}
              </Button>
              
              <p className="text-xs text-muted-foreground">
                The doctor will review your request and may accept it for further communication through our secure platform.
              </p>
            </CardContent>
          </Card>

          {/* Hospital Info */}
          {doctor.hospital && (
            <Card>
              <CardHeader>
                <CardTitle>Hospital</CardTitle>
              </CardHeader>
              <CardContent>
                <h3 className="font-semibold">{doctor.hospital.name}</h3>
                <p className="text-sm text-muted-foreground">{doctor.hospital.city}, {doctor.hospital.state}</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2"
                  onClick={() => navigate(`/hospital/${doctor.hospital.id}`)}
                >
                  View Hospital
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorDetail;