import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';

interface SubscriptionData {
  subscription_status: string | null;
  price_id: string | null;
  current_period_end: number | null;
  cancel_at_period_end: boolean | null;
}

export function useSubscription() {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setSubscription(null);
      setLoading(false);
      return;
    }

    const fetchSubscription = async () => {
      try {
        const { data, error } = await supabase
          .from('stripe_user_subscriptions')
          .select('*')
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching subscription:', error);
        } else {
          setSubscription(data);
        }
      } catch (error) {
        console.error('Error fetching subscription:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscription();
  }, [user]);

  const getSubscriptionPlanName = () => {
    if (!subscription?.price_id) return 'Free Plan';
    
    switch (subscription.price_id) {
      case 'price_1TZyJUQMc40EfY0mITx2e15M':
        return 'Yearly OutdoorKids';
      case 'price_1TZyHrQMc40EfY0mQHn3hylF':
        return 'Monthly OutdoorKids';
      case 'price_1Ta14cQMc40EfY0mVBZ7ccCY':
        return 'Promote Rewards';
      default:
        return 'Premium Plan';
    }
  };

  const isActive = subscription?.subscription_status === 'active';

  return {
    subscription,
    loading,
    isActive,
    planName: getSubscriptionPlanName(),
  };
}