import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { CreditCard, Loader2 } from 'lucide-react';

interface RazorpayPaymentProps {
  bookingId: string;
  amount: number;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function RazorpayPayment({ bookingId, amount, onSuccess, onCancel }: RazorpayPaymentProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleRazorpayPayment = async () => {
    setLoading(true);
    try {
      // Create Razorpay order
      const { data, error } = await supabase.functions.invoke('create-razorpay-order', {
        body: {
          bookingId,
          amount,
          currency: 'INR'
        }
      });

      if (error) throw error;

      // Initialize Razorpay checkout
      const options = {
        key: data.key_id,
        amount: data.amount,
        currency: data.currency,
        name: 'MediTravel',
        description: `Booking #${bookingId.slice(0, 8)}`,
        order_id: data.order_id,
        handler: async function (response: any) {
          try {
            // Update payment status
            const { error: updateError } = await supabase
              .from('bookings')
              .update({ 
                payment_status: 'paid',
                payment_transaction_id: response.razorpay_payment_id
              })
              .eq('id', bookingId);

            if (updateError) throw updateError;

            toast({
              title: "Payment Successful",
              description: "Your payment has been processed successfully!",
            });
            onSuccess();
          } catch (error) {
            console.error('Payment confirmation error:', error);
            toast({
              title: "Payment Confirmation Failed",
              description: "Payment made but confirmation failed. Please contact support.",
              variant: "destructive",
            });
          }
        },
        modal: {
          ondismiss: function () {
            toast({
              title: "Payment Cancelled",
              description: "Payment process was cancelled",
            });
          }
        },
        theme: {
          color: '#3b82f6'
        }
      };

      // Check if Razorpay is loaded
      if (typeof (window as any).Razorpay !== 'undefined') {
        const razorpayInstance = new (window as any).Razorpay(options);
        razorpayInstance.open();
      } else {
        // Load Razorpay script dynamically
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => {
          const razorpayInstance = new (window as any).Razorpay(options);
          razorpayInstance.open();
        };
        document.body.appendChild(script);
      }
    } catch (error) {
      console.error('Razorpay payment error:', error);
      toast({
        title: "Payment Failed",
        description: "Failed to initialize Razorpay payment. Please try again.",
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
          Razorpay Payment
        </CardTitle>
        <CardDescription>
          Pay with UPI, Cards, Net Banking & Wallets
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center p-4 bg-accent rounded-lg">
          <p className="text-sm text-muted-foreground mb-2">You will pay</p>
          <p className="text-2xl font-bold">₹{(amount * 83).toFixed(2)}</p>
          <p className="text-xs text-muted-foreground">
            (~${amount.toFixed(2)} USD at 83 INR/USD)
          </p>
        </div>

        <div className="space-y-2">
          <h4 className="font-semibold">Supported Payment Methods:</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• UPI (Google Pay, PhonePe, Paytm)</li>
            <li>• Credit & Debit Cards</li>
            <li>• Net Banking</li>
            <li>• Digital Wallets</li>
          </ul>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={onCancel} className="flex-1">
            Cancel
          </Button>
          <Button 
            onClick={handleRazorpayPayment} 
            disabled={loading}
            className="flex-1"
          >
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Pay Now
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}