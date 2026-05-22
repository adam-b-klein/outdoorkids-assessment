import React, { useEffect, useState } from 'react';
import { Crown, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { STRIPE_PRODUCTS } from '../stripe-config';

interface SubscriptionData {
  subscription_status: string;
  price_id: string;
}

export const SubscriptionStatus: React.FC = () => {
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const { data, error } = await supabase
          .from('stripe_user_subscriptions')
          .select('subscription_status, price_id')
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching subscription:', error);
        } else if (data) {
          setSubscription(data);
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscription();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center space-x-2 text-gray-600">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span className="text-sm">Loading...</span>
      </div>
    );
  }

  if (!subscription || subscription.subscription_status !== 'active') {
    return (
      <div className="flex items-center space-x-2 text-gray-600">
        <span className="text-sm">Free Plan</span>
      </div>
    );
  }

  const currentProduct = STRIPE_PRODUCTS.find(p => p.priceId === subscription.price_id);
  const planName = currentProduct?.name || 'Premium Plan';

  return (
    <div className="flex items-center space-x-2 text-green-600">
      <Crown className="w-4 h-4" />
      <span className="text-sm font-medium">{planName}</span>
    </div>
  );
};