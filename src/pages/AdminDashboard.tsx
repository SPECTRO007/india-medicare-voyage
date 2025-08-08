import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import {
  Users,
  DollarSign,
  TrendingUp,
  Package,
  Hospital,
  Eye,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { Navigate } from 'react-router-dom';

interface Analytics {
  total_revenue: number;
  total_cost: number;
  total_profit: number;
  total_bookings: number;
  total_users: number;
  total_consultations: number;
}

interface Booking {
  id: string;
  user_id: string;
  total_amount: number;
  currency: string;
  booking_status: string;
  payment_status: string;
  payment_method: string;
  created_at: string;
  profiles: {
    name: string;
    email: string;
  };
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  country: string;
  created_at: string;
}

export default function AdminDashboard() {
  const { user, profile, loading } = useAuth();
  const { toast } = useToast();
  const [analytics, setAnalytics] = useState<Analytics>({
    total_revenue: 0,
    total_cost: 0,
    total_profit: 0,
    total_bookings: 0,
    total_users: 0,
    total_consultations: 0,
  });
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // Handle loading state from auth
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (profile && profile.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg text-gray-500">Profile not found. Please contact support or create one.</p>
      </div>
    );
  }

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoadingData(true);

      const { data: analyticsData } = await supabase
        .from('analytics')
        .select('revenue, cost, profit');

      const totalRevenue = analyticsData?.reduce((sum, row) => sum + (row.revenue || 0), 0) || 0;
      const totalCost = analyticsData?.reduce((sum, row) => sum + (row.cost || 0), 0) || 0;
      const totalProfit = analyticsData?.reduce((sum, row) => sum + (row.profit || 0), 0) || 0;

      const { count: bookingsCount } = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true });

      const { count: usersCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      const { count: consultationsCount } = await supabase
        .from('consultations')
        .select('*', { count: 'exact', head: true });

      setAnalytics({
        total_revenue: totalRevenue,
        total_cost: totalCost,
        total_profit: totalProfit,
        total_bookings: bookingsCount || 0,
        total_users: usersCount || 0,
        total_consultations: consultationsCount || 0,
      });

      const { data: bookingsData } = await supabase
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      const bookingsWithProfiles = await Promise.all(
        (bookingsData || []).map(async (booking) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('name, email')
            .eq('user_id', booking.user_id)
            .single();

          return {
            ...booking,
            profiles: profile || { name: 'Unknown', email: 'Unknown' }
          };
        })
      );

      setBookings(bookingsWithProfiles);

      const { data: usersData } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      setUsers(usersData || []);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch dashboard data",
        variant: "destructive",
      });
    } finally {
      setLoadingData(false);
    }
  };

  const updateBookingStatus = async (bookingId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ booking_status: status })
        .eq('id', bookingId);

      if (error) throw error;

      toast({
        title: "Status Updated",
        description: "Booking status has been updated successfully",
      });

      fetchDashboardData();
    } catch (error) {
      console.error('Error updating booking status:', error);
      toast({
        title: "Error",
        description: "Failed to update booking status",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-500';
      case 'pending': return 'bg-yellow-500';
      case 'cancelled': return 'bg-red-500';
      case 'completed': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-500';
      case 'doctor': return 'bg-blue-500';
      case 'patient': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  if (loadingData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage your MediTravel platform</p>
        </div>
        <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-200">
          Admin Access
        </Badge>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${analytics.total_revenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">From all bookings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Profit</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${analytics.total_profit.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Revenue minus costs</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.total_users}</div>
            <p className="text-xs text-muted-foreground">Registered users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.total_bookings}</div>
            <p className="text-xs text-muted-foreground">All time bookings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Consultations</CardTitle>
            <Hospital className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.total_consultations}</div>
            <p className="text-xs text-muted-foreground">Total consultations</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Costs</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${analytics.total_cost.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Operational costs</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="bookings" className="w-full">
        <TabsList>
          <TabsTrigger value="bookings">Manage Bookings</TabsTrigger>
          <TabsTrigger value="users">Manage Users</TabsTrigger>
        </TabsList>

        <TabsContent value="bookings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Bookings</CardTitle>
              <CardDescription>
                Manage and track all platform bookings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {bookings.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No bookings found</p>
                ) : (
                  bookings.map((booking) => (
                    <div key={booking.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold">#{booking.id.slice(0, 8)}</h4>
                          <Badge className={getStatusColor(booking.booking_status)}>
                            {booking.booking_status}
                          </Badge>
                          <Badge variant="outline">
                            {booking.payment_status}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-muted-foreground">
                          <p><strong>User:</strong> {booking.profiles?.name || 'Unknown'}</p>
                          <p><strong>Amount:</strong> {booking.currency} {booking.total_amount}</p>
                          <p><strong>Date:</strong> {new Date(booking.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateBookingStatus(booking.id, 'confirmed')}
                          disabled={booking.booking_status === 'confirmed'}
                        >
                          <CheckCircle className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                          disabled={booking.booking_status === 'cancelled'}
                        >
                          <XCircle className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Users</CardTitle>
              <CardDescription>
                View and manage platform users
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {users.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No users found</p>
                ) : (
                  users.map((userData) => (
                    <div key={userData.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold">{userData.name || 'No name'}</h4>
                          <Badge className={getRoleColor(userData.role)}>
                            {userData.role}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-muted-foreground">
                          <p><strong>Email:</strong> {userData.email}</p>
                          <p><strong>Country:</strong> {userData.country || 'Not set'}</p>
                          <p><strong>Joined:</strong> {new Date(userData.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <Button size="sm" variant="outline">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
