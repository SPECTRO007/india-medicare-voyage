import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { ArrowLeft, CreditCard, Shield, CheckCircle, AlertCircle } from 'lucide-react';

interface PaymentProps {
  consultation?: any;
  amount?: number;
  description?: string;
}

const Payment = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<string | null>(null);
  const [consultation, setConsultation] = useState<any>(null);

  const { verificationId, consultation: consultationData, amount = 299, description = 'Medical Consultation' } = location.state || {};

  useEffect(() => {
    const checkVerificationStatus = async () => {
      if (!verificationId) {
        toast.error('Passport verification required before payment');
        navigate('/passport-verification');
        return;
      }

      try {
        const { data, error } = await supabase
          .from('passport_verifications')
          .select('verification_status')
          .eq('id', verificationId)
          .single();

        if (error) throw error;
        setVerificationStatus(data.verification_status);
      } catch (error) {
        console.error('Error checking verification:', error);
        toast.error('Unable to verify passport status');
      }
    };

    if (consultationData) {
      setConsultation(consultationData);
    }

    checkVerificationStatus();
  }, [verificationId, consultationData, navigate]);

  const handlePayment = async () => {
    if (verificationStatus !== 'approved') {
      toast.error('Passport verification must be approved before payment');
      return;
    }

    setLoading(true);
    try {
      // Mock payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update consultation status if provided
      if (consultation?.id) {
        await supabase
          .from('consultations')
          .update({ status: 'confirmed' })
          .eq('id', consultation.id);
      }

      toast.success('Payment processed successfully!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: AlertCircle },
      approved: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      rejected: { color: 'bg-red-100 text-red-800', icon: AlertCircle },
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    const Icon = config?.icon || AlertCircle;

    return (
      <Badge className={config?.color || 'bg-gray-100 text-gray-800'}>
        <Icon className="h-3 w-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="max-w-2xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
            Secure Payment
          </h1>
          <p className="text-muted-foreground">
            Complete your payment to confirm your medical consultation
          </p>
        </div>

        <div className="space-y-6">
          {/* Verification Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                Verification Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Passport Verification</span>
                {verificationStatus && getStatusBadge(verificationStatus)}
              </div>
              {verificationStatus === 'pending' && (
                <p className="text-sm text-muted-foreground mt-2">
                  Your passport verification is under review. Payment will be available once approved.
                </p>
              )}
              {verificationStatus === 'rejected' && (
                <p className="text-sm text-destructive mt-2">
                  Your passport verification was rejected. Please contact support or resubmit.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Payment Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Summary</CardTitle>
              <CardDescription>Review your order details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="font-medium">{description}</span>
                <span className="font-medium">${amount}</span>
              </div>
              
              {consultation && (
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Doctor:</span>
                    <span>{consultation.doctor?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Specialization:</span>
                    <span>{consultation.doctor?.specialization}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Date:</span>
                    <span>{new Date(consultation.consultation_date).toLocaleDateString()}</span>
                  </div>
                </div>
              )}

              <Separator />
              
              <div className="flex justify-between items-center text-lg font-semibold">
                <span>Total Amount</span>
                <span>${amount}</span>
              </div>

              <div className="bg-accent p-4 rounded-lg space-y-2">
                <h4 className="font-medium text-sm">What's included:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Video consultation with specialist</li>
                  <li>• Medical record review</li>
                  <li>• Treatment recommendations</li>
                  <li>• Follow-up support</li>
                  <li>• Travel assistance if needed</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Payment Method */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="h-5 w-5 mr-2" />
                Payment Method
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border rounded-lg p-4 bg-accent">
                  <div className="flex items-center space-x-3">
                    <CreditCard className="h-8 w-8 text-primary" />
                    <div>
                      <p className="font-medium">Secure Card Payment</p>
                      <p className="text-sm text-muted-foreground">
                        Powered by Stripe • SSL Encrypted
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Shield className="h-4 w-4" />
                  <span>Your payment information is secure and encrypted</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Button */}
          <Button
            onClick={handlePayment}
            disabled={loading || verificationStatus !== 'approved'}
            className="w-full h-12 text-lg"
            size="lg"
          >
            {loading ? (
              'Processing Payment...'
            ) : verificationStatus === 'approved' ? (
              `Pay $${amount}`
            ) : (
              'Awaiting Verification Approval'
            )}
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            By proceeding with payment, you agree to our Terms of Service and Privacy Policy.
            All payments are processed securely through our certified payment partners.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Payment;