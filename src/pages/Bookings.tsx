import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Calendar, MapPin, CreditCard, Bitcoin, Plane, Package, Hospital } from 'lucide-react';

interface Booking {
  id: string;
  consultation_id?: string;
  tour_package_id?: string;
  passport_number?: string;
  passport_expiry?: string;
  passport_country?: string;
  pickup_address?: string;
  drop_address?: string;
  total_amount: number;
  currency: string;
  payment_status: string;
  payment_method?: string;
  booking_status: string;
  created_at: string;
}

interface TourPackage {
  id: string;
  title: string;
  price: number;
  city: string;
  description: string;
  duration: string;
}

interface Consultation {
  id: string;
  doctor_id: string;
  notes?: string;
  consultation_date?: string;
  doctors: {
    name: string;
    specialization: string;
    consultation_fee: number;
  };
}

export default function Bookings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [tourPackages, setTourPackages] = useState<TourPackage[]>([]);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Booking form state
  const [selectedItem, setSelectedItem] = useState<{ type: 'tour' | 'consultation'; id: string } | null>(null);
  const [passportNumber, setPassportNumber] = useState('');
  const [passportExpiry, setPassportExpiry] = useState('');
  const [passportCountry, setPassportCountry] = useState('');
  const [pickupAddress, setPickupAddress] = useState('');
  const [dropAddress, setDropAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'razorpay' | 'crypto'>('stripe');

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      // Fetch user bookings
      const { data: bookingsData } = await supabase
        .from('bookings')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      setBookings(bookingsData || []);

      // Fetch tour packages
      const { data: packagesData } = await supabase
        .from('tour_packages')
        .select('*');

      setTourPackages(packagesData || []);

      // Fetch user consultations
      const { data: consultationsData } = await supabase
        .from('consultations')
        .select(`
          *,
          doctors (
            name,
            specialization,
            consultation_fee
          )
        `)
        .eq('user_id', user?.id);

      setConsultations(consultationsData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const calculateTotal = () => {
    if (!selectedItem) return 0;
    
    if (selectedItem.type === 'tour') {
      const pkg = tourPackages.find(p => p.id === selectedItem.id);
      return pkg?.price || 0;
    } else {
      const consultation = consultations.find(c => c.id === selectedItem.id);
      return consultation?.doctors.consultation_fee || 0;
    }
  };

  const handleBooking = async () => {
    if (!selectedItem || !user) return;
    
    setLoading(true);
    try {
      const bookingData = {
        user_id: user.id,
        [selectedItem.type === 'tour' ? 'tour_package_id' : 'consultation_id']: selectedItem.id,
        passport_number: passportNumber,
        passport_expiry: passportExpiry || null,
        passport_country: passportCountry,
        pickup_address: pickupAddress,
        drop_address: dropAddress,
        total_amount: calculateTotal(),
        payment_method: paymentMethod,
      };

      const { data, error } = await supabase
        .from('bookings')
        .insert(bookingData)
        .select()
        .single();

      if (error) throw error;

      // Process payment based on method
      if (paymentMethod === 'stripe') {
        await handleStripePayment(data.id);
      } else if (paymentMethod === 'razorpay') {
        await handleRazorpayPayment(data.id);
      } else if (paymentMethod === 'crypto') {
        await handleCryptoPayment(data.id);
      }

      toast({
        title: "Booking Created",
        description: "Your booking has been created successfully!",
      });

      // Reset form
      setSelectedItem(null);
      setPassportNumber('');
      setPassportExpiry('');
      setPassportCountry('');
      setPickupAddress('');
      setDropAddress('');
      
      fetchData();
    } catch (error) {
      console.error('Error creating booking:', error);
      toast({
        title: "Booking Failed",
        description: "Failed to create booking. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStripePayment = async (bookingId: string) => {
    // Placeholder for Stripe integration
    toast({
      title: "Stripe Payment",
      description: "Stripe payment integration needed. Redirecting to payment...",
    });
  };

  const handleRazorpayPayment = async (bookingId: string) => {
    // Placeholder for Razorpay integration
    toast({
      title: "Razorpay Payment",
      description: "Razorpay payment integration needed. Redirecting to payment...",
    });
  };

  const handleCryptoPayment = async (bookingId: string) => {
    // Placeholder for crypto payment
    toast({
      title: "Crypto Payment",
      description: "Crypto payment integration needed. Wallet address will be provided.",
    });
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

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex items-center gap-2">
        <Plane className="w-6 h-6" />
        <h1 className="text-3xl font-bold">Bookings & Travel</h1>
      </div>

      <Tabs defaultValue="create" className="w-full">
        <TabsList>
          <TabsTrigger value="create">Create Booking</TabsTrigger>
          <TabsTrigger value="my-bookings">My Bookings</TabsTrigger>
        </TabsList>

        <TabsContent value="create" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Create New Booking</CardTitle>
              <CardDescription>
                Book tour packages or consultations with passport verification and travel details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Select Service */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-base font-semibold mb-4 block">Tour Packages</Label>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {tourPackages.map((pkg) => (
                      <Card 
                        key={pkg.id} 
                        className={`cursor-pointer transition-colors ${
                          selectedItem?.type === 'tour' && selectedItem?.id === pkg.id 
                            ? 'border-primary bg-primary/5' 
                            : 'hover:bg-accent'
                        }`}
                        onClick={() => setSelectedItem({ type: 'tour', id: pkg.id })}
                      >
                        <CardContent className="p-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-semibold">{pkg.title}</h4>
                              <p className="text-sm text-muted-foreground">{pkg.city} • {pkg.duration}</p>
                            </div>
                            <Badge variant="secondary">${pkg.price}</Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-base font-semibold mb-4 block">Consultations</Label>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {consultations.map((consultation) => (
                      <Card 
                        key={consultation.id} 
                        className={`cursor-pointer transition-colors ${
                          selectedItem?.type === 'consultation' && selectedItem?.id === consultation.id 
                            ? 'border-primary bg-primary/5' 
                            : 'hover:bg-accent'
                        }`}
                        onClick={() => setSelectedItem({ type: 'consultation', id: consultation.id })}
                      >
                        <CardContent className="p-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-semibold">{consultation.doctors.name}</h4>
                              <p className="text-sm text-muted-foreground">{consultation.doctors.specialization}</p>
                            </div>
                            <Badge variant="secondary">${consultation.doctors.consultation_fee}</Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>

              {selectedItem && (
                <>
                  {/* Passport Verification */}
                  <div className="space-y-4">
                    <Label className="text-base font-semibold">Passport Verification</Label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="passport-number">Passport Number</Label>
                        <Input
                          id="passport-number"
                          value={passportNumber}
                          onChange={(e) => setPassportNumber(e.target.value)}
                          placeholder="Enter passport number"
                        />
                      </div>
                      <div>
                        <Label htmlFor="passport-expiry">Expiry Date</Label>
                        <Input
                          id="passport-expiry"
                          type="date"
                          value={passportExpiry}
                          onChange={(e) => setPassportExpiry(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="passport-country">Country of Issue</Label>
                        <Input
                          id="passport-country"
                          value={passportCountry}
                          onChange={(e) => setPassportCountry(e.target.value)}
                          placeholder="e.g., United States"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Address Details */}
                  <div className="space-y-4">
                    <Label className="text-base font-semibold">Travel Details</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="pickup">Pickup Address</Label>
                        <Textarea
                          id="pickup"
                          value={pickupAddress}
                          onChange={(e) => setPickupAddress(e.target.value)}
                          placeholder="Enter pickup address"
                          rows={3}
                        />
                      </div>
                      <div>
                        <Label htmlFor="drop">Drop-off Address</Label>
                        <Textarea
                          id="drop"
                          value={dropAddress}
                          onChange={(e) => setDropAddress(e.target.value)}
                          placeholder="Enter drop-off address"
                          rows={3}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Payment Method */}
                  <div className="space-y-4">
                    <Label className="text-base font-semibold">Payment Method</Label>
                    <Select value={paymentMethod} onValueChange={(value: any) => setPaymentMethod(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="stripe">
                          <div className="flex items-center gap-2">
                            <CreditCard className="w-4 h-4" />
                            Stripe (Credit/Debit Card)
                          </div>
                        </SelectItem>
                        <SelectItem value="razorpay">
                          <div className="flex items-center gap-2">
                            <CreditCard className="w-4 h-4" />
                            Razorpay (Indian Payments)
                          </div>
                        </SelectItem>
                        <SelectItem value="crypto">
                          <div className="flex items-center gap-2">
                            <Bitcoin className="w-4 h-4" />
                            Cryptocurrency
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Total and Book Button */}
                  <div className="flex justify-between items-center pt-4 border-t">
                    <div>
                      <p className="text-2xl font-bold">Total: ${calculateTotal()}</p>
                    </div>
                    <Button 
                      onClick={handleBooking}
                      disabled={loading || !passportNumber || !pickupAddress || !dropAddress}
                      size="lg"
                    >
                      {loading ? 'Creating Booking...' : 'Book Now'}
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="my-bookings">
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">My Bookings</h2>
            {bookings.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Package className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No bookings found. Create your first booking!</p>
                </CardContent>
              </Card>
            ) : (
              bookings.map((booking) => (
                <Card key={booking.id}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-semibold">Booking #{booking.id.slice(0, 8)}</h3>
                        <p className="text-sm text-muted-foreground">
                          Created: {new Date(booking.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Badge className={getStatusColor(booking.booking_status)}>
                          {booking.booking_status}
                        </Badge>
                        <Badge variant="outline">
                          {booking.payment_status}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p><strong>Amount:</strong> {booking.currency} {booking.total_amount}</p>
                        <p><strong>Payment Method:</strong> {booking.payment_method || 'Not set'}</p>
                      </div>
                      <div>
                        <p><strong>Passport:</strong> {booking.passport_number || 'Not provided'}</p>
                        <p><strong>Pickup:</strong> {booking.pickup_address || 'Not provided'}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}