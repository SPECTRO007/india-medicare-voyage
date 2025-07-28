import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calendar,
  Clock,
  User,
  MessageSquare,
  Settings,
  Star,
  TrendingUp,
  Users,
  Stethoscope,
  Phone,
  Mail,
  MapPin,
  Edit,
  Save,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface DoctorProfile {
  id: string;
  name: string;
  specialization: string;
  bio: string;
  rating: number;
  years_experience: number;
  consultation_fee: number;
  verified: boolean;
  hospital: string;
  phone: string;
  languages: string[];
  education: string;
  certifications: string[];
}

interface Consultation {
  id: string;
  user_id: string;
  status: string;
  consultation_date: string;
  notes: string;
  created_at: string;
  patient: {
    name: string;
    email: string;
  };
}

const specializations = [
  'Cardiology', 'Orthopedics', 'Neurology', 'Oncology', 
  'Ophthalmology', 'Gynecology', 'Dermatology', 'Pediatrics',
  'Gastroenterology', 'Urology', 'ENT', 'Emergency Medicine'
];

const languages = [
  'English', 'Hindi', 'Tamil', 'Telugu', 'Kannada', 'Malayalam', 
  'Marathi', 'Bengali', 'Gujarati', 'Punjabi'
];

export default function DoctorDashboard() {
  const [doctorProfile, setDoctorProfile] = useState<DoctorProfile | null>(null);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    if (profile?.role !== 'doctor') {
      navigate('/dashboard');
      return;
    }
    fetchDoctorProfile();
    fetchConsultations();
  }, [user, profile, navigate]);

  const fetchDoctorProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('doctors')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (data) {
        setDoctorProfile(data);
      } else {
        // Create initial doctor profile
        const { data: newProfile, error: createError } = await supabase
          .from('doctors')
          .insert({
            user_id: user.id,
            name: profile?.name || '',
            specialization: 'General Medicine',
            bio: '',
            hospital: '',
            consultation_fee: 50,
            years_experience: 0,
            verified: false
          })
          .select()
          .single();

        if (createError) throw createError;
        setDoctorProfile(newProfile);
      }
    } catch (error) {
      console.error('Error fetching doctor profile:', error);
      toast({
        title: "Error",
        description: "Failed to load doctor profile",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchConsultations = async () => {
    try {
      const { data: doctorData } = await supabase
        .from('doctors')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!doctorData) return;

      // First get consultations
      const { data: consultationsData, error: consultationsError } = await supabase
        .from('consultations')
        .select('*')
        .eq('doctor_id', doctorData.id)
        .order('created_at', { ascending: false });

      if (consultationsError) throw consultationsError;

      // Then get patient profiles for each consultation
      if (consultationsData && consultationsData.length > 0) {
        const userIds = consultationsData.map(c => c.user_id);
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('user_id, name, email')
          .in('user_id', userIds);

        if (profilesError) throw profilesError;

        // Combine the data
        const consultationsWithPatient = consultationsData.map(consultation => {
          const profile = profilesData?.find(p => p.user_id === consultation.user_id);
          return {
            ...consultation,
            patient: {
              name: profile?.name || 'Unknown Patient',
              email: profile?.email || 'No email'
            }
          };
        });

        setConsultations(consultationsWithPatient);
      } else {
        setConsultations([]);
      }
    } catch (error) {
      console.error('Error fetching consultations:', error);
    }
  };

  const updateProfile = async () => {
    if (!doctorProfile) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('doctors')
        .update({
          name: doctorProfile.name,
          specialization: doctorProfile.specialization,
          bio: doctorProfile.bio,
          hospital: doctorProfile.hospital,
          phone: doctorProfile.phone,
          consultation_fee: doctorProfile.consultation_fee,
          years_experience: doctorProfile.years_experience,
          languages: doctorProfile.languages,
          education: doctorProfile.education,
          certifications: doctorProfile.certifications
        })
        .eq('id', doctorProfile.id);

      if (error) throw error;

      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated",
      });
      setEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update profile",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!doctorProfile) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">Doctor Profile Not Found</h2>
        <p className="text-muted-foreground">Unable to load your doctor profile.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Doctor Dashboard</h1>
            <p className="text-muted-foreground">
              Manage your profile, consultations, and patient interactions
            </p>
          </div>
          <div className="flex items-center gap-2">
            {!doctorProfile.verified && (
              <Badge variant="outline" className="gap-2">
                <AlertCircle className="h-4 w-4" />
                Pending Verification
              </Badge>
            )}
            {doctorProfile.verified && (
              <Badge className="gap-2 bg-green-100 text-green-800">
                <CheckCircle className="h-4 w-4" />
                Verified Doctor
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Consultations</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{consultations.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center gap-1">
              {doctorProfile.rating}
              <Star className="h-5 w-5 text-yellow-500 fill-current" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Consultation Fee</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${doctorProfile.consultation_fee}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Experience</CardTitle>
            <Stethoscope className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{doctorProfile.years_experience} years</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="consultations">Consultations</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Doctor Profile</CardTitle>
                  <CardDescription>
                    Manage your professional information and credentials
                  </CardDescription>
                </div>
                <Button
                  variant={editing ? "outline" : "default"}
                  onClick={() => editing ? setEditing(false) : setEditing(true)}
                >
                  {editing ? "Cancel" : <><Edit className="h-4 w-4 mr-2" />Edit Profile</>}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Profile Header */}
              <div className="flex items-center gap-6">
                <Avatar className="h-24 w-24">
                  <AvatarFallback className="bg-primary/20 text-primary text-2xl">
                    {getInitials(doctorProfile.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-2xl font-bold">{doctorProfile.name}</h3>
                  <p className="text-lg text-primary font-medium">{doctorProfile.specialization}</p>
                  <p className="text-muted-foreground">{doctorProfile.hospital}</p>
                </div>
              </div>

              {/* Profile Form */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input
                    value={doctorProfile.name}
                    onChange={(e) => setDoctorProfile({...doctorProfile, name: e.target.value})}
                    disabled={!editing}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Specialization</Label>
                  <Select 
                    value={doctorProfile.specialization} 
                    onValueChange={(value) => setDoctorProfile({...doctorProfile, specialization: value})}
                    disabled={!editing}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {specializations.map(spec => (
                        <SelectItem key={spec} value={spec}>{spec}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Hospital/Clinic</Label>
                  <Input
                    value={doctorProfile.hospital}
                    onChange={(e) => setDoctorProfile({...doctorProfile, hospital: e.target.value})}
                    disabled={!editing}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Phone Number</Label>
                  <Input
                    value={doctorProfile.phone || ''}
                    onChange={(e) => setDoctorProfile({...doctorProfile, phone: e.target.value})}
                    disabled={!editing}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Years of Experience</Label>
                  <Input
                    type="number"
                    value={doctorProfile.years_experience}
                    onChange={(e) => setDoctorProfile({...doctorProfile, years_experience: parseInt(e.target.value)})}
                    disabled={!editing}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Consultation Fee (USD)</Label>
                  <Input
                    type="number"
                    value={doctorProfile.consultation_fee}
                    onChange={(e) => setDoctorProfile({...doctorProfile, consultation_fee: parseInt(e.target.value)})}
                    disabled={!editing}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Bio</Label>
                <Textarea
                  value={doctorProfile.bio || ''}
                  onChange={(e) => setDoctorProfile({...doctorProfile, bio: e.target.value})}
                  disabled={!editing}
                  rows={4}
                  placeholder="Tell patients about your experience and expertise..."
                />
              </div>

              <div className="space-y-2">
                <Label>Education</Label>
                <Textarea
                  value={doctorProfile.education || ''}
                  onChange={(e) => setDoctorProfile({...doctorProfile, education: e.target.value})}
                  disabled={!editing}
                  rows={3}
                  placeholder="Your medical education and qualifications..."
                />
              </div>

              {editing && (
                <div className="flex gap-2">
                  <Button onClick={updateProfile} disabled={saving}>
                    {saving ? 'Saving...' : <><Save className="h-4 w-4 mr-2" />Save Changes</>}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="consultations">
          <Card>
            <CardHeader>
              <CardTitle>Patient Consultations</CardTitle>
              <CardDescription>
                Manage your patient consultations and appointments
              </CardDescription>
            </CardHeader>
            <CardContent>
              {consultations.length > 0 ? (
                <div className="space-y-4">
                  {consultations.map((consultation) => (
                    <div key={consultation.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-secondary">
                              {getInitials(consultation.patient?.name || 'Patient')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h4 className="font-semibold">{consultation.patient?.name}</h4>
                            <p className="text-sm text-muted-foreground">{consultation.patient?.email}</p>
                          </div>
                        </div>
                        <Badge className={getStatusColor(consultation.status)}>
                          {consultation.status}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>
                            {consultation.consultation_date 
                              ? new Date(consultation.consultation_date).toLocaleDateString()
                              : 'Not scheduled'
                            }
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>{new Date(consultation.created_at).toLocaleDateString()}</span>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => navigate(`/chat?consultation=${consultation.id}`)}>
                            <MessageSquare className="h-4 w-4 mr-1" />
                            Chat
                          </Button>
                          <Button size="sm" variant="outline">
                            <Phone className="h-4 w-4 mr-1" />
                            Call
                          </Button>
                        </div>
                      </div>

                      {consultation.notes && (
                        <div className="mt-3 p-3 bg-muted rounded-md">
                          <p className="text-sm">{consultation.notes}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No consultations yet</h3>
                  <p className="text-muted-foreground">
                    Once patients book consultations with you, they'll appear here.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schedule">
          <Card>
            <CardHeader>
              <CardTitle>Schedule Management</CardTitle>
              <CardDescription>
                Manage your availability and appointment slots
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Schedule Management Coming Soon</h3>
                <p className="text-muted-foreground">
                  Advanced scheduling features will be available soon.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}