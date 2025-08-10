
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-WEBHOOK] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Use service role key for database operations
  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Webhook received");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    if (!signature) {
      throw new Error("Missing stripe-signature header");
    }

    // For webhook endpoint secret, you'll need to add this as a secret
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    if (!webhookSecret) {
      logStep("WARNING: No webhook secret configured, skipping signature verification");
    }

    let event;
    if (webhookSecret) {
      try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
        logStep("Webhook signature verified");
      } catch (err) {
        logStep("Webhook signature verification failed", { error: err.message });
        return new Response("Webhook signature verification failed", { status: 400 });
      }
    } else {
      event = JSON.parse(body);
    }

    logStep("Processing event", { type: event.type, id: event.id });

    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'invoice.payment_succeeded': {
        const subscription = event.type === 'invoice.payment_succeeded' 
          ? await stripe.subscriptions.retrieve(event.data.object.subscription)
          : event.data.object;
        
        const customer = await stripe.customers.retrieve(subscription.customer as string);
        const customerEmail = (customer as any).email;
        
        if (!customerEmail) {
          logStep("No customer email found, skipping");
          break;
        }

        const isActive = subscription.status === 'active';
        const subscriptionEnd = new Date(subscription.current_period_end * 1000).toISOString();
        
        await supabaseClient.from("subscribers").upsert({
          email: customerEmail,
          stripe_customer_id: subscription.customer as string,
          subscribed: isActive,
          subscription_tier: "Premium",
          subscription_end: subscriptionEnd,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'email' });

        logStep("Subscription updated", { email: customerEmail, subscribed: isActive });
        break;
      }

      case 'customer.subscription.deleted':
      case 'invoice.payment_failed': {
        const subscription = event.type === 'invoice.payment_failed'
          ? await stripe.subscriptions.retrieve(event.data.object.subscription)
          : event.data.object;
        
        const customer = await stripe.customers.retrieve(subscription.customer as string);
        const customerEmail = (customer as any).email;
        
        if (!customerEmail) {
          logStep("No customer email found, skipping");
          break;
        }

        await supabaseClient.from("subscribers").upsert({
          email: customerEmail,
          stripe_customer_id: subscription.customer as string,
          subscribed: false,
          subscription_tier: null,
          subscription_end: null,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'email' });

        logStep("Subscription cancelled/failed", { email: customerEmail });
        break;
      }

      default:
        logStep("Unhandled event type", { type: event.type });
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in stripe-webhook", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
