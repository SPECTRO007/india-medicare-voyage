import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { CreditCard, Loader2 } from 'lucide-react';

interface StripePaymentProps {
  bookingId: string;
  amount: number;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function StripePayment({ bookingId, amount, onSuccess, onCancel }: StripePaymentProps) {
  const [loading, setLoading] = useState(false);
  const [cardDetails, setCardDetails] = useState({
    number: '',
    expiry: '',
    cvc: '',
    name: '',
  });
  const { toast } = useToast();

  const handlePayment = async () => {
    if (!cardDetails.number || !cardDetails.expiry || !cardDetails.cvc || !cardDetails.name) {
      toast({
        title: "Missing Details",
        description: "Please fill in all card details",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Create payment intent with Stripe
      const { data, error } = await supabase.functions.invoke('create-stripe-payment', {
        body: {
          bookingId,
          amount,
          currency: 'usd'
        }
      });

      if (error) throw error;

      // In a real implementation, you would use Stripe Elements
      // For demo purposes, we'll simulate payment processing
      toast({
        title: "Payment Processing",
        description: "Processing your payment with Stripe...",
      });

      // Simulate payment delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Update payment status to completed
      const { error: updateError } = await supabase
        .from('bookings')
        .update({ payment_status: 'paid' })
        .eq('id', bookingId);

      if (updateError) throw updateError;

      toast({
        title: "Payment Successful",
        description: "Your payment has been processed successfully!",
      });

      onSuccess();
    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: "Payment Failed",
        description: "Failed to process payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="w-5 h-5" />
          Stripe Payment
        </CardTitle>
        <CardDescription>
          Pay securely with your credit or debit card
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="card-name">Cardholder Name</Label>
          <Input
            id="card-name"
            placeholder="John Doe"
            value={cardDetails.name}
            onChange={(e) => setCardDetails(prev => ({ ...prev, name: e.target.value }))}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="card-number">Card Number</Label>
          <Input
            id="card-number"
            placeholder="1234 5678 9012 3456"
            value={cardDetails.number}
            onChange={(e) => setCardDetails(prev => ({ ...prev, number: e.target.value }))}
            maxLength={19}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="expiry">Expiry Date</Label>
            <Input
              id="expiry"
              placeholder="MM/YY"
              value={cardDetails.expiry}
              onChange={(e) => setCardDetails(prev => ({ ...prev, expiry: e.target.value }))}
              maxLength={5}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cvc">CVC</Label>
            <Input
              id="cvc"
              placeholder="123"
              value={cardDetails.cvc}
              onChange={(e) => setCardDetails(prev => ({ ...prev, cvc: e.target.value }))}
              maxLength={4}
            />
          </div>
        </div>

        <div className="border-t pt-4">
          <div className="flex justify-between text-lg font-semibold">
            <span>Total Amount:</span>
            <span>${amount.toFixed(2)}</span>
          </div>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={onCancel} className="flex-1">
            Cancel
          </Button>
          <Button 
            onClick={handlePayment} 
            disabled={loading}
            className="flex-1"
          >
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Pay ${amount.toFixed(2)}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}