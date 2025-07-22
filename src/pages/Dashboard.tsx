import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Users, Stethoscope, TrendingUp, Clock, MapPin } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    consultations: 0,
    treatments: 0,
    doctors: 0
  });
  const [recentConsultations, setRecentConsultations] = useState([]);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    
    fetchDashboardData();
  }, [user, navigate]);

  const fetchDashboardData = async () => {
    try {
      // Fetch consultation count
      const { count: consultationCount } = await supabase
        .from('consultations')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user?.id);

      // Fetch treatment count
      const { count: treatmentCount } = await supabase
        .from('treatments')
        .select('*', { count: 'exact', head: true });

      // Fetch doctor count
      const { count: doctorCount } = await supabase
        .from('doctors')
        .select('*', { count: 'exact', head: true })
        .eq('verified', true);

      // Fetch recent consultations
      const { data: consultations } = await supabase
        .from('consultations')
        .select(`
          *,
          doctors (name, specialization, hospital),
          treatments (title)
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(5);

      setStats({
        consultations: consultationCount || 0,
        treatments: treatmentCount || 0,
        doctors: doctorCount || 0
      });

      setRecentConsultations(consultations || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg p-6">
        <h1 className="text-3xl font-bold mb-2">
          Welcome back, {profile?.name || 'there'}!
        </h1>
        <p className="text-muted-foreground">
          Manage your medical journey and explore treatment options in India
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Consultations</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.consultations}</div>
            <p className="text-xs text-muted-foreground">
              Active and completed consultations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Treatments</CardTitle>
            <Stethoscope className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.treatments}</div>
            <p className="text-xs text-muted-foreground">
              Medical procedures available
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verified Doctors</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.doctors}</div>
            <p className="text-xs text-muted-foreground">
              Expert medical professionals
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Get started with your medical journey</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              onClick={() => navigate('/treatments')} 
              className="h-16 flex flex-col gap-2"
            >
              <Stethoscope className="h-5 w-5" />
              Find Treatment
            </Button>
            <Button 
              onClick={() => navigate('/doctors')} 
              variant="outline" 
              className="h-16 flex flex-col gap-2"
            >
              <Users className="h-5 w-5" />
              Book Doctor
            </Button>
            <Button 
              onClick={() => navigate('/consultations')} 
              variant="outline" 
              className="h-16 flex flex-col gap-2"
            >
              <Calendar className="h-5 w-5" />
              Upload Report
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Consultations */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Consultations</CardTitle>
          <CardDescription>Your latest medical consultations</CardDescription>
        </CardHeader>
        <CardContent>
          {recentConsultations.length > 0 ? (
            <div className="space-y-4">
              {recentConsultations.map((consultation: any) => (
                <div key={consultation.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-medium">{consultation.doctors?.name}</h3>
                      <Badge className={getStatusColor(consultation.status)}>
                        {consultation.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">
                      {consultation.doctors?.specialization} • {consultation.doctors?.hospital}
                    </p>
                    {consultation.treatments && (
                      <p className="text-sm text-muted-foreground">
                        Treatment: {consultation.treatments.title}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      {consultation.consultation_date 
                        ? new Date(consultation.consultation_date).toLocaleDateString()
                        : 'Not scheduled'
                      }
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No consultations yet</p>
              <Button onClick={() => navigate('/doctors')}>
                Book Your First Consultation
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}