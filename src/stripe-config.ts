export interface StripeProduct {
  id: string;
  priceId: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  mode: 'subscription' | 'payment';
}

export const STRIPE_PRODUCTS: StripeProduct[] = [
  {
    id: 'prod_UZ9N7Dgr5IPWzm',
    priceId: 'price_1Ta14cQMc40EfY0mVBZ7ccCY',
    name: 'Promote Rewards',
    description: 'Promote your rewards to reach more families',
    price: 10.00,
    currency: 'usd',
    mode: 'subscription'
  },
  {
    id: 'prod_UZ6WyOf3EI7uJj',
    priceId: 'price_1TZyJUQMc40EfY0mITx2e15M',
    name: 'Yearly OutdoorKids Subscription',
    description: 'Subscribe to OutdoorKids ad-free on a yearly basis.',
    price: 10.00,
    currency: 'usd',
    mode: 'subscription'
  },
  {
    id: 'prod_UZ6UHjnu08JUHe',
    priceId: 'price_1TZyHrQMc40EfY0mQHn3hylF',
    name: 'Monthly OutdoorKids Subscription',
    description: 'Subscribe to Outdoor Kids without ads on a monthly basis',
    price: 1.00,
    currency: 'usd',
    mode: 'subscription'
  }
];

export const getProductByPriceId = (priceId: string): StripeProduct | undefined => {
  return STRIPE_PRODUCTS.find(product => product.priceId === priceId);
};

export const getProductById = (id: string): StripeProduct | undefined => {
  return STRIPE_PRODUCTS.find(product => product.id === id);
};