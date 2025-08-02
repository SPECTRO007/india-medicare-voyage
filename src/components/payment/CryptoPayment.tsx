import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Bitcoin, Copy, CheckCircle, Loader2 } from 'lucide-react';

interface CryptoPaymentProps {
  bookingId: string;
  amount: number;
  onSuccess: () => void;
  onCancel: () => void;
}

interface CryptoPaymentData {
  payment_reference: string;
  crypto_currency: string;
  crypto_amount: number;
  wallet_address: string;
  usd_amount: number;
  exchange_rate: number;
  instructions: string;
}

export default function CryptoPayment({ bookingId, amount, onSuccess, onCancel }: CryptoPaymentProps) {
  const [loading, setLoading] = useState(false);
  const [selectedCrypto, setSelectedCrypto] = useState<string>('USDT');
  const [paymentData, setPaymentData] = useState<CryptoPaymentData | null>(null);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const cryptoOptions = [
    { value: 'BTC', label: 'Bitcoin (BTC)', icon: '₿' },
    { value: 'ETH', label: 'Ethereum (ETH)', icon: 'Ξ' },
    { value: 'USDT', label: 'Tether (USDT)', icon: '₮' },
    { value: 'USDC', label: 'USD Coin (USDC)', icon: '$' },
  ];

  const initializeCryptoPayment = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-crypto-payment', {
        body: {
          bookingId,
          amount,
          cryptoCurrency: selectedCrypto
        }
      });

      if (error) throw error;
      setPaymentData(data);
    } catch (error) {
      console.error('Crypto payment error:', error);
      toast({
        title: "Crypto Payment Failed",
        description: "Failed to initialize crypto payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast({
        title: "Copied!",
        description: "Wallet address copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const confirmPayment = async () => {
    try {
      // In a real implementation, you would verify the blockchain transaction
      // For demo purposes, we'll mark as pending verification
      const { error } = await supabase
        .from('bookings')
        .update({ payment_status: 'paid' })
        .eq('id', bookingId);

      if (error) throw error;

      toast({
        title: "Payment Confirmed",
        description: "Your crypto payment has been confirmed!",
      });
      onSuccess();
    } catch (error) {
      console.error('Payment confirmation error:', error);
      toast({
        title: "Confirmation Failed",
        description: "Failed to confirm payment. Please contact support.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bitcoin className="w-5 h-5" />
          Cryptocurrency Payment
        </CardTitle>
        <CardDescription>
          Pay with Bitcoin, Ethereum, or stablecoins
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!paymentData ? (
          <>
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Cryptocurrency</label>
              <Select value={selectedCrypto} onValueChange={setSelectedCrypto}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {cryptoOptions.map((crypto) => (
                    <SelectItem key={crypto.value} value={crypto.value}>
                      <div className="flex items-center gap-2">
                        <span className="font-mono">{crypto.icon}</span>
                        {crypto.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="text-center p-4 bg-accent rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">Amount to pay</p>
              <p className="text-2xl font-bold">${amount.toFixed(2)} USD</p>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={onCancel} className="flex-1">
                Cancel
              </Button>
              <Button 
                onClick={initializeCryptoPayment} 
                disabled={loading}
                className="flex-1"
              >
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Continue
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="space-y-4">
              <div className="text-center p-4 bg-accent rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Send exactly</p>
                <p className="text-xl font-bold">
                  {paymentData.crypto_amount.toFixed(8)} {paymentData.crypto_currency}
                </p>
                <p className="text-xs text-muted-foreground">
                  ≈ ${paymentData.usd_amount.toFixed(2)} USD
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Send to this address:</label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 p-2 bg-muted rounded text-xs break-all">
                    {paymentData.wallet_address}
                  </code>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(paymentData.wallet_address)}
                  >
                    {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Badge variant="outline" className="w-full justify-center p-2">
                  Payment Reference: {paymentData.payment_reference}
                </Badge>
              </div>

              <div className="text-xs text-muted-foreground bg-muted p-3 rounded">
                <p className="font-medium mb-1">Important Instructions:</p>
                <p>{paymentData.instructions}</p>
                <p className="mt-2">⚠️ Send only {paymentData.crypto_currency} to this address. Sending other cryptocurrencies may result in permanent loss.</p>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={onCancel} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={confirmPayment} className="flex-1">
                  I've Sent Payment
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}