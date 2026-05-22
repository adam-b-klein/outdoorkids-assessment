import { useEffect, useState } from 'react';
import { Building2, Save, CreditCard, AlertTriangle, Star, Zap, ArrowUpCircle, ArrowDownCircle, Check } from 'lucide-react';
import { supabase, Business, Subscription } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;
const PRICE_MONTHLY = import.meta.env.VITE_STRIPE_PRICE_MONTHLY as string;
const PRICE_ANNUAL = import.meta.env.VITE_STRIPE_PRICE_ANNUAL as string;

const CATEGORIES = ['restaurant', 'retail', 'education', 'entertainment', 'outdoor', 'fitness', 'arts', 'other'];

export default function BizProfilePage() {
  const { user, profile, refreshProfile } = useAuth();
  const [business, setBusiness] = useState<Business | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const [fullName, setFullName] = useState('');
  const [bizName, setBizName] = useState('');
  const [category, setCategory] = useState('other');
  const [description, setDescription] = useState('');
  const [website, setWebsite] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');

  useEffect(() => {
    if (!user) return;
    async function load() {
      const { data: biz } = await supabase.from('businesses').select('*').eq('profile_id', user!.id).maybeSingle();
      const { data: sub } = await supabase.from('subscriptions').select('*').eq('profile_id', user!.id).maybeSingle();
      setBusiness(biz);
      setSubscription(sub);
      setBizName(biz?.business_name ?? '');
      setCategory(biz?.category ?? 'other');
      setDescription(biz?.description ?? '');
      setWebsite(biz?.website_url ?? '');
      setPhone(biz?.phone ?? '');
      setAddress(biz?.address ?? '');
      setCity(biz?.city ?? '');
      setState(biz?.state ?? '');
      setFullName(profile?.full_name ?? '');
      setLoading(false);
    }
    load();
  }, [user, profile]);

  async function handleUpgrade(plan: 'paid_monthly' | 'paid_annual') {
    setCheckoutLoading(plan);
    try {
      const priceId = plan === 'paid_monthly' ? PRICE_MONTHLY : PRICE_ANNUAL;
      const origin = window.location.origin;
      const session = (await supabase.auth.getSession()).data.session;
      const res = await fetch(`${SUPABASE_URL}/functions/v1/stripe-checkout/create-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
          'Apikey': SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({
          priceId,
          successUrl: `${origin}/biz/profile?checkout=success`,
          cancelUrl: `${origin}/biz/profile?checkout=cancel`,
        }),
      });
      const { url, error } = await res.json();
      if (error) throw new Error(error);
      window.location.href = url;
    } catch {
      setCheckoutLoading(null);
    }
  }

  async function handleManageBilling() {
    setPortalLoading(true);
    try {
      const origin = window.location.origin;
      const session = (await supabase.auth.getSession()).data.session;
      const res = await fetch(`${SUPABASE_URL}/functions/v1/stripe-checkout/create-portal`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
          'Apikey': SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({ returnUrl: `${origin}/biz/profile` }),
      });
      const { url, error } = await res.json();
      if (error) throw new Error(error);
      window.location.href = url;
    } catch {
      setPortalLoading(false);
    }
  }

  async function handleDeleteAccount() {
    setDeleteLoading(true);
    setDeleteError('');
    try {
      const session = (await supabase.auth.getSession()).data.session;
      const res = await fetch(`${SUPABASE_URL}/functions/v1/delete-account`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session?.access_token}`,
          'Apikey': SUPABASE_ANON_KEY,
        },
      });
      const { error } = await res.json();
      if (error) throw new Error(error);
      await supabase.auth.signOut();
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Failed to delete account');
      setDeleteLoading(false);
    }
  }

  async function handleSave() {
    if (!user || !business) return;
    setSaving(true);

    await supabase.from('profiles').update({ full_name: fullName, updated_at: new Date().toISOString() }).eq('id', user.id);
    await supabase.from('businesses').update({
      business_name: bizName,
      category,
      description,
      website_url: website,
      phone,
      address,
      city,
      state,
      updated_at: new Date().toISOString(),
    }).eq('id', business.id);

    await refreshProfile();
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  if (loading) {
    return (
      <div className="p-6 md:p-8 max-w-2xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-40" />
          <div className="h-48 bg-gray-200 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Business Profile</h1>
        <p className="text-gray-500 text-sm mt-0.5">Manage your business information and settings</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
            <Building2 className="w-4 h-4 text-gray-600" />
          </div>
          <h2 className="font-bold text-gray-900">Business Information</h2>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Contact name</label>
            <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none text-sm transition-all" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Business name</label>
            <input type="text" value={bizName} onChange={(e) => setBizName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none text-sm transition-all" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-sky-500 outline-none text-sm capitalize">
              {CATEGORIES.map((c) => (
                <option key={c} value={c} className="capitalize">{c.charAt(0).toUpperCase() + c.slice(1)}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-sky-500 outline-none text-sm resize-none"
              placeholder="Tell families about your business" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Website</label>
              <input type="url" value={website} onChange={(e) => setWebsite(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-sky-500 outline-none text-sm" placeholder="https://" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone</label>
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-sky-500 outline-none text-sm" placeholder="(503) 555-0100" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Address</label>
            <input type="text" value={address} onChange={(e) => setAddress(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-sky-500 outline-none text-sm" placeholder="123 Main St" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">City</label>
              <input type="text" value={city} onChange={(e) => setCity(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-sky-500 outline-none text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">State</label>
              <input type="text" value={state} onChange={(e) => setState(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-sky-500 outline-none text-sm" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
            <input type="email" value={user?.email ?? ''} disabled
              className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 text-gray-400 text-sm cursor-not-allowed" />
          </div>
        </div>
      </div>

      {/* Subscription */}
      <div id="upgrade" className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
            <CreditCard className="w-4 h-4 text-gray-600" />
          </div>
          <div>
            <h2 className="font-bold text-gray-900">Subscription</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Currently on <span className="font-semibold capitalize">{subscription?.plan === 'free' ? 'Free' : 'Premium'}</span>
            </p>
          </div>
        </div>

        {/* Plan cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          {/* Free plan */}
          <div className={`rounded-2xl border-2 p-4 transition-all ${subscription?.plan === 'free' ? 'border-gray-300 bg-gray-50' : 'border-gray-100 bg-white'}`}>
            <div className="flex items-center justify-between mb-3">
              <span className="font-bold text-gray-900 text-sm">Free</span>
              {subscription?.plan === 'free' && (
                <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full font-medium">Current</span>
              )}
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-3">$0<span className="text-sm font-normal text-gray-400"> / mo</span></div>
            <ul className="space-y-1.5 text-xs text-gray-500">
              <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" /> Unlimited rewards</li>
              <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" /> Redemption tracking</li>
              <li className="flex items-center gap-2 opacity-40 line-through"><Star className="w-3.5 h-3.5 flex-shrink-0" /> Featured placement</li>
              <li className="flex items-center gap-2 opacity-40 line-through"><Zap className="w-3.5 h-3.5 flex-shrink-0" /> Promoted / sponsored</li>
            </ul>
          </div>

          {/* Premium plan */}
          <div className={`rounded-2xl border-2 p-4 transition-all ${subscription?.plan !== 'free' ? 'border-sky-400 bg-sky-50' : 'border-sky-200 bg-white'}`}>
            <div className="flex items-center justify-between mb-3">
              <span className="font-bold text-sky-900 text-sm">Premium</span>
              {subscription?.plan !== 'free' ? (
                <span className="text-xs bg-sky-600 text-white px-2 py-0.5 rounded-full font-medium">Current</span>
              ) : (
                <span className="text-xs bg-sky-100 text-sky-700 px-2 py-0.5 rounded-full font-semibold">Recommended</span>
              )}
            </div>
            <div className="text-2xl font-bold text-sky-900 mb-3">$1<span className="text-sm font-normal text-sky-600"> / mo</span></div>
            <ul className="space-y-1.5 text-xs text-sky-800">
              <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-sky-500 flex-shrink-0" /> Unlimited rewards</li>
              <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-sky-500 flex-shrink-0" /> Redemption tracking</li>
              <li className="flex items-center gap-2 font-semibold"><Star className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" /> Featured placement</li>
              <li className="flex items-center gap-2 font-semibold"><Zap className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" /> Promoted / sponsored</li>
            </ul>
          </div>
        </div>

        {/* Free → upgrade CTAs */}
        {subscription?.plan === 'free' && (
          <div className="space-y-2">
            <p className="text-xs text-gray-500 mb-2">Upgrade to unlock Featured and Promoted reward placements.</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleUpgrade('paid_monthly')}
                disabled={checkoutLoading !== null}
                className="flex items-center justify-center gap-1.5 bg-sky-600 hover:bg-sky-700 disabled:bg-sky-300 text-white text-xs font-bold py-2.5 rounded-xl transition-all"
              >
                <ArrowUpCircle className="w-3.5 h-3.5" />
                {checkoutLoading === 'paid_monthly' ? 'Loading...' : '$1 / month'}
              </button>
              <button
                onClick={() => handleUpgrade('paid_annual')}
                disabled={checkoutLoading !== null}
                className="relative flex items-center justify-center gap-1.5 bg-sky-600 hover:bg-sky-700 disabled:bg-sky-300 text-white text-xs font-bold py-2.5 rounded-xl transition-all"
              >
                <ArrowUpCircle className="w-3.5 h-3.5" />
                {checkoutLoading === 'paid_annual' ? 'Loading...' : '$10 / year'}
                <span className="absolute -top-2 -right-1 bg-amber-400 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full leading-none">SAVE 17%</span>
              </button>
            </div>
          </div>
        )}

        {/* Premium → manage billing */}
        {subscription?.plan !== 'free' && (
          <div className="space-y-2">
            <button
              onClick={handleManageBilling}
              disabled={portalLoading}
              className="w-full flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 text-gray-700 text-sm font-semibold py-2.5 rounded-xl transition-all"
            >
              <CreditCard className="w-4 h-4" />
              {portalLoading ? 'Loading...' : 'Manage Billing'}
            </button>
            <button
              onClick={handleManageBilling}
              disabled={portalLoading}
              className="w-full flex items-center justify-center gap-2 text-gray-400 hover:text-gray-600 text-xs py-2 transition-colors"
            >
              <ArrowDownCircle className="w-3.5 h-3.5" />
              Downgrade to Free (removes Featured &amp; Promoted)
            </button>
          </div>
        )}
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className={`w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all ${
          saved ? 'bg-emerald-100 text-emerald-700' : 'bg-sky-600 hover:bg-sky-700 text-white'
        }`}
      >
        <Save className="w-4 h-4" />
        {saved ? 'Saved!' : saving ? 'Saving...' : 'Save Changes'}
      </button>

      {/* Danger zone */}
      <div className="mt-8 border border-red-100 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-1">
          <AlertTriangle className="w-4 h-4 text-red-500" />
          <h2 className="font-bold text-red-600 text-sm">Danger Zone</h2>
        </div>
        <p className="text-xs text-gray-500 mb-4">Permanently delete your business account and all associated data. This cannot be undone.</p>
        <button
          onClick={() => { setShowDeleteModal(true); setDeleteConfirmText(''); setDeleteError(''); }}
          className="text-sm font-semibold text-red-600 hover:text-red-700 border border-red-200 hover:border-red-300 hover:bg-red-50 px-4 py-2 rounded-xl transition-all"
        >
          Delete Account
        </button>
      </div>

      {/* Delete confirmation modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => !deleteLoading && setShowDeleteModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Delete Business Account</h3>
                <p className="text-xs text-gray-500 mt-0.5">This action is permanent and cannot be undone</p>
              </div>
            </div>

            <ul className="text-xs text-gray-600 space-y-1 mb-5 bg-gray-50 rounded-xl p-3">
              <li>Your business profile will be permanently removed</li>
              <li>All rewards and redemption history will be erased</li>
              <li>Active promotions will not be automatically refunded</li>
              <li>Active subscriptions will not be automatically cancelled</li>
            </ul>

            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Type <span className="font-bold text-red-600">DELETE</span> to confirm
            </label>
            <input
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              disabled={deleteLoading}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-red-400 focus:ring-2 focus:ring-red-100 outline-none text-sm transition-all mb-4"
              placeholder="DELETE"
            />

            {deleteError && (
              <p className="text-xs text-red-600 mb-3">{deleteError}</p>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={deleteLoading}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteConfirmText !== 'DELETE' || deleteLoading}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 disabled:bg-red-200 disabled:text-red-400 text-white text-sm font-semibold transition-all"
              >
                {deleteLoading ? 'Deleting...' : 'Delete Account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
