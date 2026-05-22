import { useState } from 'react';
import { TreePine, Users, Building2, Plus, Trash2, ChevronRight, ChevronLeft, Sparkles, CheckCircle2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

const AGE_RANGES = ['infant', 'toddler', 'preschool', 'school-age', 'tween'];
const MARKETS = [
  { value: 'portland', label: 'Portland, OR', desc: 'Greater Portland metro area' },
  { value: 'san_francisco', label: 'San Francisco, CA', desc: 'SF Bay Area' },
];
const BUSINESS_CATEGORIES = ['restaurant', 'retail', 'education', 'entertainment', 'outdoor', 'fitness', 'arts', 'other'];

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;
const PRICE_MONTHLY = import.meta.env.VITE_STRIPE_PRICE_MONTHLY as string;
const PRICE_ANNUAL = import.meta.env.VITE_STRIPE_PRICE_ANNUAL as string;

type Plan = 'free' | 'paid_monthly' | 'paid_annual';

export default function OnboardingPage() {
  const { user, refreshProfile } = useAuth();
  // households: steps 1-4, businesses: steps 1-2
  const [step, setStep] = useState(1);
  const [role, setRole] = useState<'household' | 'business' | ''>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Household fields
  const [householdName, setHouseholdName] = useState('');
  const [market, setMarket] = useState('portland');
  const [children, setChildren] = useState([{ name: '', age_range: 'school-age' }]);
  const [selectedPlan, setSelectedPlan] = useState<Plan>('free');

  // Business fields
  const [businessName, setBusinessName] = useState('');
  const [businessCategory, setBusinessCategory] = useState('other');
  const [businessDesc, setBusinessDesc] = useState('');
  const [businessCity, setBusinessCity] = useState('Portland');
  const [businessState, setBusinessState] = useState('OR');

  function addChild() {
    setChildren([...children, { name: '', age_range: 'school-age' }]);
  }
  function removeChild(i: number) {
    setChildren(children.filter((_, idx) => idx !== i));
  }
  function updateChild(i: number, field: string, value: string) {
    setChildren(children.map((c, idx) => idx === i ? { ...c, [field]: value } : c));
  }

  const totalSteps = role === 'household' ? 4 : 2;

  async function createHouseholdRecords(): Promise<string> {
    if (!user) throw new Error('Not authenticated');

    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        role: 'household',
        email: user.email ?? '',
        full_name: householdName,
        onboarding_completed: true,
        updated_at: new Date().toISOString(),
      });
    if (profileError) throw profileError;

    const { data: hh, error: hhError } = await supabase
      .from('households')
      .insert({
        profile_id: user.id,
        household_name: householdName,
        city: market === 'portland' ? 'Portland' : 'San Francisco',
        state: market === 'portland' ? 'OR' : 'CA',
      })
      .select()
      .single();
    if (hhError) throw hhError;

    const validChildren = children.filter((c) => c.name.trim());
    if (validChildren.length > 0) {
      const { error: childError } = await supabase
        .from('children')
        .insert(validChildren.map((c) => ({ household_id: hh.id, first_name: c.name, age_range: c.age_range })));
      if (childError) throw childError;
    }

    await supabase.from('subscriptions').insert({ profile_id: user.id, plan: 'free', status: 'active' });
    return hh.id;
  }

  async function handleComplete() {
    if (!user) return;
    setError('');
    setLoading(true);

    try {
      if (role === 'household') {
        await createHouseholdRecords();

        if (selectedPlan !== 'free') {
          // Redirect to Stripe Checkout
          const priceId = selectedPlan === 'paid_monthly' ? PRICE_MONTHLY : PRICE_ANNUAL;
          const origin = window.location.origin;
          const res = await fetch(`${SUPABASE_URL}/functions/v1/stripe-checkout`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
              'Apikey': SUPABASE_ANON_KEY,
            },
            body: JSON.stringify({
              price_id: priceId,
              success_url: `${origin}/?checkout=success`,
              cancel_url: `${origin}/?checkout=cancel`,
              mode: 'subscription',
            }),
          });
          const { url, error: stripeError } = await res.json();
          if (stripeError) throw new Error(stripeError);
          window.location.href = url;
          return;
        }
      } else {
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: user.id,
            role: 'business',
            email: user.email ?? '',
            full_name: businessName,
            onboarding_completed: true,
            updated_at: new Date().toISOString(),
          });
        if (profileError) throw profileError;

        const { error: bizError } = await supabase
          .from('businesses')
          .insert({
            profile_id: user.id,
            business_name: businessName,
            category: businessCategory,
            description: businessDesc,
            city: businessCity,
            state: businessState,
          });
        if (bizError) throw bizError;

        await supabase.from('subscriptions').insert({ profile_id: user.id, plan: 'free', status: 'active' });
      }

      await refreshProfile();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-lg">
        {/* Logo + progress */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center mx-auto mb-3">
            <TreePine className="w-7 h-7 text-white" />
          </div>
          <div className="flex items-center justify-center gap-1 mb-2">
            {Array.from({ length: totalSteps || 2 }).map((_, i) => (
              <div key={i} className={`h-1.5 rounded-full transition-all ${i + 1 <= step ? 'bg-emerald-600 w-8' : 'bg-gray-200 w-4'}`} />
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
          {error && (
            <div className="mb-5 p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-700">{error}</div>
          )}

          {/* Step 1: Role selection */}
          {step === 1 && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">Welcome to OutdoorKids</h2>
              <p className="text-gray-500 text-sm mb-6">How will you use the app?</p>
              <div className="space-y-3">
                <button
                  onClick={() => setRole('household')}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                    role === 'household' ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${role === 'household' ? 'bg-emerald-100' : 'bg-gray-100'}`}>
                      <Users className={`w-5 h-5 ${role === 'household' ? 'text-emerald-700' : 'text-gray-500'}`} />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 text-sm">Parent or Caretaker</div>
                      <div className="text-xs text-gray-500 mt-0.5">Track activities, earn points, redeem rewards for your family</div>
                    </div>
                  </div>
                </button>
                <button
                  onClick={() => setRole('business')}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                    role === 'business' ? 'border-sky-500 bg-sky-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${role === 'business' ? 'bg-sky-100' : 'bg-gray-100'}`}>
                      <Building2 className={`w-5 h-5 ${role === 'business' ? 'text-sky-700' : 'text-gray-500'}`} />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 text-sm">Business or Organization</div>
                      <div className="text-xs text-gray-500 mt-0.5">Offer rewards and reach families with kids in your area</div>
                    </div>
                  </div>
                </button>
              </div>
              <button
                onClick={() => role && setStep(2)}
                disabled={!role}
                className="mt-6 w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-200 disabled:text-gray-400 text-white py-3 rounded-xl font-semibold transition-all text-sm flex items-center justify-center gap-2"
              >
                Continue
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Step 2: Household details */}
          {step === 2 && role === 'household' && (
            <div>
              <button onClick={() => setStep(1)} className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 mb-4 transition-colors">
                <ChevronLeft className="w-3 h-3" /> Back
              </button>
              <h2 className="text-xl font-bold text-gray-900 mb-1">Tell us about your family</h2>
              <p className="text-gray-500 text-sm mb-6">We'll use this to personalize your activity suggestions.</p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Family name</label>
                  <input
                    type="text"
                    value={householdName}
                    onChange={(e) => setHouseholdName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition-all text-sm"
                    placeholder="The Johnson Family"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Your metro area</label>
                  <div className="grid grid-cols-2 gap-3">
                    {MARKETS.map((m) => (
                      <button
                        key={m.value}
                        onClick={() => setMarket(m.value)}
                        className={`p-3 rounded-xl border-2 text-left transition-all ${market === m.value ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 hover:border-gray-300'}`}
                      >
                        <div className="font-semibold text-gray-900 text-xs">{m.label}</div>
                        <div className="text-xs text-gray-500 mt-0.5">{m.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <button
                onClick={() => householdName.trim() && setStep(3)}
                disabled={!householdName.trim()}
                className="mt-6 w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-200 disabled:text-gray-400 text-white py-3 rounded-xl font-semibold transition-all text-sm flex items-center justify-center gap-2"
              >
                Continue
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Step 2: Business details */}
          {step === 2 && role === 'business' && (
            <div>
              <button onClick={() => setStep(1)} className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 mb-4 transition-colors">
                <ChevronLeft className="w-3 h-3" /> Back
              </button>
              <h2 className="text-xl font-bold text-gray-900 mb-1">Tell us about your business</h2>
              <p className="text-gray-500 text-sm mb-6">We'll use this to set up your rewards profile.</p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Business name</label>
                  <input
                    type="text"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none transition-all text-sm"
                    placeholder="Acme Kids Books"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Category</label>
                  <select
                    value={businessCategory}
                    onChange={(e) => setBusinessCategory(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-sky-500 outline-none transition-all text-sm capitalize"
                  >
                    {BUSINESS_CATEGORIES.map((c) => (
                      <option key={c} value={c} className="capitalize">{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Brief description</label>
                  <textarea
                    value={businessDesc}
                    onChange={(e) => setBusinessDesc(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none transition-all text-sm resize-none"
                    placeholder="What makes your business great for families?"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">City</label>
                    <input
                      type="text"
                      value={businessCity}
                      onChange={(e) => setBusinessCity(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-sky-500 outline-none transition-all text-sm"
                      placeholder="Portland"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">State</label>
                    <input
                      type="text"
                      value={businessState}
                      onChange={(e) => setBusinessState(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-sky-500 outline-none transition-all text-sm"
                      placeholder="OR"
                    />
                  </div>
                </div>
              </div>
              <button
                onClick={handleComplete}
                disabled={!businessName.trim() || loading}
                className="mt-6 w-full bg-sky-600 hover:bg-sky-700 disabled:bg-gray-200 disabled:text-gray-400 text-white py-3 rounded-xl font-semibold transition-all text-sm"
              >
                {loading ? 'Setting up...' : 'Complete Setup'}
              </button>
            </div>
          )}

          {/* Step 3: Children */}
          {step === 3 && role === 'household' && (
            <div>
              <button onClick={() => setStep(2)} className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 mb-4 transition-colors">
                <ChevronLeft className="w-3 h-3" /> Back
              </button>
              <h2 className="text-xl font-bold text-gray-900 mb-1">Add your children</h2>
              <p className="text-gray-500 text-sm mb-6">Optional — helps us tailor activity recommendations by age.</p>
              <div className="space-y-3">
                {children.map((child, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <div className="flex-1 grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={child.name}
                        onChange={(e) => updateChild(i, 'name', e.target.value)}
                        className="px-3 py-2 rounded-lg border border-gray-200 focus:border-emerald-500 outline-none text-sm"
                        placeholder="Child's name"
                      />
                      <select
                        value={child.age_range}
                        onChange={(e) => updateChild(i, 'age_range', e.target.value)}
                        className="px-3 py-2 rounded-lg border border-gray-200 focus:border-emerald-500 outline-none text-sm capitalize"
                      >
                        {AGE_RANGES.map((r) => (
                          <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
                        ))}
                      </select>
                    </div>
                    {children.length > 1 && (
                      <button onClick={() => removeChild(i)} className="text-gray-400 hover:text-red-500 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button
                onClick={addChild}
                className="mt-3 flex items-center gap-2 text-sm text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add another child
              </button>
              <button
                onClick={() => setStep(4)}
                className="mt-6 w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-semibold transition-all text-sm flex items-center justify-center gap-2"
              >
                Continue
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => setStep(4)}
                className="mt-2 w-full text-gray-400 hover:text-gray-600 py-2 text-sm transition-colors"
              >
                Skip for now
              </button>
            </div>
          )}

          {/* Step 4: Plan selection */}
          {step === 4 && role === 'household' && (
            <div>
              <button onClick={() => setStep(3)} className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 mb-4 transition-colors">
                <ChevronLeft className="w-3 h-3" /> Back
              </button>
              <h2 className="text-xl font-bold text-gray-900 mb-1">Choose your plan</h2>
              <p className="text-gray-500 text-sm mb-6">Start free or go ad-free with Premium.</p>

              <div className="space-y-3">
                {/* Free plan */}
                <button
                  onClick={() => setSelectedPlan('free')}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                    selectedPlan === 'free' ? 'border-gray-400 bg-gray-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${selectedPlan === 'free' ? 'border-gray-500' : 'border-gray-300'}`}>
                        {selectedPlan === 'free' && <div className="w-2.5 h-2.5 rounded-full bg-gray-500" />}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 text-sm">Free</div>
                        <div className="text-xs text-gray-500 mt-0.5">Includes ads — full access to all features</div>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-gray-500">$0</span>
                  </div>
                </button>

                {/* Monthly Premium */}
                <button
                  onClick={() => setSelectedPlan('paid_monthly')}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                    selectedPlan === 'paid_monthly' ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${selectedPlan === 'paid_monthly' ? 'border-emerald-500' : 'border-gray-300'}`}>
                        {selectedPlan === 'paid_monthly' && <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 text-sm flex items-center gap-2">
                          Premium Monthly
                          <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5">Ad-free experience, cancel anytime</div>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-emerald-600">$1<span className="text-xs font-normal text-gray-400">/mo</span></span>
                  </div>
                </button>

                {/* Annual Premium */}
                <button
                  onClick={() => setSelectedPlan('paid_annual')}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-all relative ${
                    selectedPlan === 'paid_annual' ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="absolute -top-2.5 right-3">
                    <span className="bg-emerald-600 text-white text-xs font-semibold px-2 py-0.5 rounded-full">Best value</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${selectedPlan === 'paid_annual' ? 'border-emerald-500' : 'border-gray-300'}`}>
                        {selectedPlan === 'paid_annual' && <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 text-sm flex items-center gap-2">
                          Premium Annual
                          <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5">Ad-free · save 17% vs monthly</div>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-emerald-600">$10<span className="text-xs font-normal text-gray-400">/yr</span></span>
                  </div>
                </button>
              </div>

              {/* Benefits list */}
              {selectedPlan !== 'free' && (
                <div className="mt-4 p-3 bg-emerald-50 border border-emerald-100 rounded-xl space-y-1.5">
                  {['No ads, ever', 'Support independent outdoor families', 'Full access to all features'].map((b) => (
                    <div key={b} className="flex items-center gap-2 text-xs text-emerald-700">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      {b}
                    </div>
                  ))}
                </div>
              )}

              <button
                onClick={handleComplete}
                disabled={loading}
                className="mt-6 w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white py-3 rounded-xl font-semibold transition-all text-sm"
              >
                {loading
                  ? 'Setting up...'
                  : selectedPlan === 'free'
                  ? 'Start for Free'
                  : 'Continue to Payment'}
              </button>
              {selectedPlan !== 'free' && (
                <p className="text-center text-xs text-gray-400 mt-2">You'll be taken to Stripe to complete payment</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
