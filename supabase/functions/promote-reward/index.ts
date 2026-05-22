import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import Stripe from "npm:stripe@14";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const PROMOTION_PRICE_ID = "price_1TZzUp3e1Ggc2bQ8nifHjaoY";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, { apiVersion: "2024-04-10" });

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const url = new URL(req.url);
    const path = url.pathname.replace(/^\/promote-reward/, "");

    // POST /promote-reward/create-session
    // Body: { rewardId, days, successUrl, cancelUrl }
    if (req.method === "POST" && path === "/create-session") {
      const { rewardId, days, successUrl, cancelUrl } = await req.json();

      if (!rewardId || !days || days < 1) {
        return new Response(JSON.stringify({ error: "Invalid request: rewardId and days are required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Verify the reward belongs to this user's business
      const { data: business } = await supabase
        .from("businesses")
        .select("id")
        .eq("profile_id", user.id)
        .maybeSingle();

      if (!business) {
        return new Response(JSON.stringify({ error: "No business found for this user" }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data: reward } = await supabase
        .from("rewards")
        .select("id, title, business_id")
        .eq("id", rewardId)
        .eq("business_id", business.id)
        .maybeSingle();

      if (!reward) {
        return new Response(JSON.stringify({ error: "Reward not found or not owned by this business" }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Get or create Stripe customer using subscriptions table
      const { data: sub } = await supabase
        .from("subscriptions")
        .select("stripe_customer_id")
        .eq("profile_id", user.id)
        .maybeSingle();

      const { data: profile } = await supabase
        .from("profiles")
        .select("email, full_name")
        .eq("id", user.id)
        .maybeSingle();

      let customerId = sub?.stripe_customer_id;
      if (!customerId) {
        const customer = await stripe.customers.create({
          email: profile?.email ?? user.email,
          name: profile?.full_name ?? undefined,
          metadata: { supabase_user_id: user.id },
        });
        customerId = customer.id;
        if (sub) {
          await supabase
            .from("subscriptions")
            .update({ stripe_customer_id: customerId })
            .eq("profile_id", user.id);
        }
      }

      const amountCents = days * 1000; // $10/day = 1000 cents

      // Create a pending promotion record first so we have its ID for metadata
      const { data: promotion } = await supabase
        .from("reward_promotions")
        .insert({
          reward_id: rewardId,
          business_id: business.id,
          days_purchased: days,
          amount_cents: amountCents,
          status: "pending",
        })
        .select()
        .single();

      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        mode: "payment",
        line_items: [
          {
            price: PROMOTION_PRICE_ID,
            quantity: days,
          },
        ],
        success_url: `${successUrl}?promotion_id=${promotion.id}&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: cancelUrl,
        metadata: {
          supabase_user_id: user.id,
          reward_id: rewardId,
          business_id: business.id,
          promotion_id: promotion.id,
          days_purchased: String(days),
        },
      });

      // Store the session ID on the promotion record
      await supabase
        .from("reward_promotions")
        .update({ stripe_session_id: session.id })
        .eq("id", promotion.id);

      return new Response(JSON.stringify({ url: session.url, promotionId: promotion.id }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // POST /promote-reward/confirm
    // Body: { promotionId, sessionId }
    // Called after redirect back from Stripe to activate the promotion
    if (req.method === "POST" && path === "/confirm") {
      const { promotionId, sessionId } = await req.json();

      if (!promotionId || !sessionId) {
        return new Response(JSON.stringify({ error: "promotionId and sessionId required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Verify ownership
      const { data: business } = await supabase
        .from("businesses")
        .select("id")
        .eq("profile_id", user.id)
        .maybeSingle();

      if (!business) {
        return new Response(JSON.stringify({ error: "No business found" }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data: promotion } = await supabase
        .from("reward_promotions")
        .select("*")
        .eq("id", promotionId)
        .eq("business_id", business.id)
        .maybeSingle();

      if (!promotion) {
        return new Response(JSON.stringify({ error: "Promotion not found" }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Check Stripe session payment status
      const session = await stripe.checkout.sessions.retrieve(sessionId);

      if (session.payment_status !== "paid") {
        return new Response(JSON.stringify({ error: "Payment not completed", status: session.payment_status }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const now = new Date();
      const endsAt = new Date(now);
      endsAt.setDate(endsAt.getDate() + promotion.days_purchased);

      // Activate promotion
      await supabase
        .from("reward_promotions")
        .update({
          status: "active",
          stripe_payment_intent_id: typeof session.payment_intent === "string"
            ? session.payment_intent
            : session.payment_intent?.id ?? "",
          starts_at: now.toISOString(),
          ends_at: endsAt.toISOString(),
        })
        .eq("id", promotionId);

      // Set is_sponsored on the reward
      await supabase
        .from("rewards")
        .update({ is_sponsored: true })
        .eq("id", promotion.reward_id);

      return new Response(JSON.stringify({ success: true, endsAt: endsAt.toISOString() }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Not found" }), {
      status: 404,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
