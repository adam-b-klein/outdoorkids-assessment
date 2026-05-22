import React, { useEffect, useState } from 'react';
import { SubscriptionCard } from '../components/SubscriptionCard';
import { STRIPE_PRODUCTS } from '../stripe-config';
import { supabase } from '../lib/supabase';

export const PricingPage: React.FC = () => {
  const [currentPlan, setCurrentPlan] = useState<string | null>(null);

  useEffect(() => {
    const fetchCurrentPlan = async () => {
      try {
        const { data } = await supabase
          .from('stripe_user_subscriptions')
          .select('price_id, subscription_status')
          .single();

        if (data && data.subscription_status === 'active') {
          setCurrentPlan(data.price_id);
        }
      } catch (error) {
        // User might not have a subscription
      }
    };

    fetchCurrentPlan();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your OutdoorKids Plan
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Get unlimited access to outdoor activities and adventures for your family. 
            Cancel anytime, no questions asked.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {STRIPE_PRODUCTS.map((product, index) => (
            <SubscriptionCard
              key={product.priceId}
              product={product}
              isPopular={index === 0} // Make yearly plan popular
              currentPlan={currentPlan}
            />
          ))}
        </div>

        <div className="mt-16 text-center">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              What's Included
            </h3>
            <div className="grid md:grid-cols-2 gap-4 text-left">
              <div className="space-y-3">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  <span>Ad-free experience</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  <span>Unlimited activity access</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  <span>Premium content</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  <span>Priority support</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  <span>Early access to new features</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  <span>Cancel anytime</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};