import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Crypto wallets for different currencies
const CRYPTO_WALLETS = {
  BTC: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
  ETH: "0x742d35Cc6634C0532925a3b8D0c9b82B48e1E8A2",
  USDT: "0x742d35Cc6634C0532925a3b8D0c9b82B48e1E8A2", // Same as ETH for ERC-20
  USDC: "0x742d35Cc6634C0532925a3b8D0c9b82B48e1E8A2",
};

// Exchange rates (USD to crypto) - In production, fetch from API
const EXCHANGE_RATES = {
  BTC: 45000, // 1 BTC = $45,000
  ETH: 2500,  // 1 ETH = $2,500
  USDT: 1,    // 1 USDT = $1
  USDC: 1,    // 1 USDC = $1
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { bookingId, amount, cryptoCurrency = "USDT" } = await req.json();

    if (!CRYPTO_WALLETS[cryptoCurrency]) {
      throw new Error(`Unsupported cryptocurrency: ${cryptoCurrency}`);
    }

    const exchangeRate = EXCHANGE_RATES[cryptoCurrency];
    const cryptoAmount = amount / exchangeRate;

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Generate a unique payment reference
    const paymentRef = `crypto_${bookingId}_${Date.now()}`;

    // Update booking with crypto payment details
    await supabase
      .from('bookings')
      .update({
        payment_transaction_id: paymentRef,
        payment_status: 'pending_crypto',
        crypto_currency: cryptoCurrency,
        crypto_amount: cryptoAmount,
        crypto_address: CRYPTO_WALLETS[cryptoCurrency]
      })
      .eq('id', bookingId);

    return new Response(
      JSON.stringify({
        payment_reference: paymentRef,
        crypto_currency: cryptoCurrency,
        crypto_amount: cryptoAmount,
        wallet_address: CRYPTO_WALLETS[cryptoCurrency],
        usd_amount: amount,
        exchange_rate: exchangeRate,
        instructions: `Send exactly ${cryptoAmount.toFixed(8)} ${cryptoCurrency} to the provided wallet address. Payment will be confirmed within 1-6 confirmations.`,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error creating crypto payment:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});