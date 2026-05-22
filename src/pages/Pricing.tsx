import React from 'react';
import { STRIPE_PRODUCTS } from '../stripe-config';
import { SubscriptionCard } from '../components/SubscriptionCard';
import { useAuth } from '../hooks/useAuth';

export function Pricing() {
  const { user } = useAuth();

  const handleSubscribe = async (priceId: string) => {
    if (!user) {
      // Redirect to login
      window.location.href = '/login';
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-checkout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId,
          successUrl: `${window.location.origin}/success`,
          cancelUrl: `${window.location.origin}/pricing`,
        }),
      });

      const { url } = await response.json();
      
      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
    }
  };

  const subscriptionProducts = STRIPE_PRODUCTS.filter(product => 
    product.name.includes('Subscription')
  );
  
  const promoteProduct = STRIPE_PRODUCTS.find(product => 
    product.name === 'Promote Rewards'
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Join thousands of families discovering amazing outdoor activities for their kids
          </p>
        </div>

        {/* Subscription Plans */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
            OutdoorKids Subscriptions
          </h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {subscriptionProducts.map((product, index) => (
              <SubscriptionCard
                key={product.id}
                product={product}
                isPopular={index === 0}
                onSubscribe={handleSubscribe}
              />
            ))}
          </div>
        </div>

        {/* Business Plan */}
        {promoteProduct && (
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
              For Businesses
            </h2>
            <SubscriptionCard
              product={promoteProduct}
              onSubscribe={handleSubscribe}
            />
          </div>
        )}
      </div>
    </div>
  );
}